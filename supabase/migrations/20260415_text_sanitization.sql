-- Text sanitization hardening:
-- Enforce sanitization at database layer before INSERT/UPDATE so all write paths are covered.

BEGIN;

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

DROP TRIGGER IF EXISTS sanitize_profiles_before_write_trigger ON profiles;
CREATE TRIGGER sanitize_profiles_before_write_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_profiles_before_write();

DROP TRIGGER IF EXISTS sanitize_widgets_before_write_trigger ON widgets;
CREATE TRIGGER sanitize_widgets_before_write_trigger
  BEFORE INSERT OR UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_widgets_before_write();

DROP TRIGGER IF EXISTS sanitize_testimonials_before_write_trigger ON testimonials;
CREATE TRIGGER sanitize_testimonials_before_write_trigger
  BEFORE INSERT OR UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_testimonials_before_write();

COMMIT;
