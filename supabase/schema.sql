-- ============================================================
-- ProofEngine Supabase Schema
-- ============================================================

-- profiles table (auto-created on auth.users insert via trigger)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',         -- 'free' | 'pro'
  dodo_customer_id TEXT,
  dodo_subscription_id TEXT,
  widget_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- widgets table
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,               -- used in public collection URL
  show_badge BOOLEAN DEFAULT TRUE,         -- free plan: badge always true
  theme TEXT DEFAULT 'light',              -- 'light' | 'dark'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  author_avatar_url TEXT,
  body TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- Sanitization Helpers/Triggers
-- ==========================

CREATE OR REPLACE FUNCTION public.sanitize_user_text(input_text TEXT, max_length INT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  sanitized TEXT;
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;

  sanitized := input_text;

  -- Remove HTML tags and control characters.
  sanitized := regexp_replace(sanitized, '<[^>]*>', '', 'g');
  sanitized := regexp_replace(sanitized, E'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');

  -- Normalize whitespace.
  sanitized := replace(sanitized, E'\r\n', E'\n');
  sanitized := regexp_replace(sanitized, E'\n{3,}', E'\n\n', 'g');
  sanitized := regexp_replace(sanitized, E'[ \\t]{2,}', ' ', 'g');
  sanitized := btrim(sanitized);

  IF max_length IS NOT NULL AND max_length > 0 THEN
    sanitized := left(sanitized, max_length);
  END IF;

  RETURN sanitized;
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_profiles_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.full_name := public.sanitize_user_text(NEW.full_name, 100);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_widgets_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name := public.sanitize_user_text(NEW.name, 100);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_testimonials_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.author_name := public.sanitize_user_text(NEW.author_name, 100);
  NEW.author_role := public.sanitize_user_text(NEW.author_role, 100);
  NEW.author_company := public.sanitize_user_text(NEW.author_company, 100);
  NEW.body := public.sanitize_user_text(NEW.body, 2000);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_profiles_before_write_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_profiles_before_write();

CREATE TRIGGER sanitize_widgets_before_write_trigger
  BEFORE INSERT OR UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_widgets_before_write();

CREATE TRIGGER sanitize_testimonials_before_write_trigger
  BEFORE INSERT OR UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_testimonials_before_write();

-- ==========================
-- RLS Policies
-- ==========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
-- Users can read their own profile
CREATE POLICY "profiles: select own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles: delete own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Users can insert their own profile (for auto-creation fallback)
CREATE POLICY "profiles: insert own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- WIDGETS ----
-- Owners can SELECT their own widgets
CREATE POLICY "widgets: select own" ON widgets
  FOR SELECT USING (auth.uid() = user_id);

-- Public can SELECT any widget (for embed lookup by slug)
CREATE POLICY "widgets: public read" ON widgets
  FOR SELECT USING (true);

-- Owners can INSERT widgets
CREATE POLICY "widgets: insert own" ON widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owners can UPDATE their widgets
CREATE POLICY "widgets: update own" ON widgets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners can DELETE their widgets
CREATE POLICY "widgets: delete own" ON widgets
  FOR DELETE USING (auth.uid() = user_id);

-- ---- TESTIMONIALS ----
-- Widget owners can SELECT all their testimonials (including pending)
CREATE POLICY "testimonials: owner select" ON testimonials
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM widgets WHERE id = widget_id)
  );

-- Public can SELECT only approved testimonials (for embed widget)
CREATE POLICY "testimonials: public read approved" ON testimonials
  FOR SELECT USING (approved = TRUE);

-- Public can INSERT testimonials (submit form, always pending)
CREATE POLICY "testimonials: public insert" ON testimonials
  FOR INSERT WITH CHECK (true);

-- Widget owners can UPDATE their testimonials (approve/reject)
CREATE POLICY "testimonials: owner update" ON testimonials
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM widgets WHERE id = widget_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM widgets WHERE id = widget_id)
  );

-- Widget owners can DELETE their testimonials
CREATE POLICY "testimonials: owner delete" ON testimonials
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM widgets WHERE id = widget_id)
  );
