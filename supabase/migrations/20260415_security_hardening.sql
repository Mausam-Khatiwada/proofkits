-- Security hardening migration:
-- 1) Add explicit WITH CHECK for UPDATE policies.
-- 2) Add explicit DELETE policy for profiles.

BEGIN;

-- Profiles
DROP POLICY IF EXISTS "profiles: update own" ON profiles;
CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: delete own" ON profiles;
CREATE POLICY "profiles: delete own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Widgets
DROP POLICY IF EXISTS "widgets: update own" ON widgets;
CREATE POLICY "widgets: update own" ON widgets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Testimonials
DROP POLICY IF EXISTS "testimonials: owner update" ON testimonials;
CREATE POLICY "testimonials: owner update" ON testimonials
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM widgets WHERE id = widget_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM widgets WHERE id = widget_id)
  );

COMMIT;
