
-- Admin-only function to list users with their roles.
-- Returns email + roles aggregated; gated by admin role.
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  roles app_role[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    u.created_at,
    COALESCE(
      ARRAY(
        SELECT ur.role
        FROM public.user_roles ur
        WHERE ur.user_id = u.id
        ORDER BY ur.role
      ),
      ARRAY[]::app_role[]
    ) AS roles
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Admin-only role grant
CREATE OR REPLACE FUNCTION public.admin_grant_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Admin-only role revoke (cannot revoke own admin to prevent lockout)
CREATE OR REPLACE FUNCTION public.admin_revoke_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;
  IF _user_id = auth.uid() AND _role = 'admin' THEN
    RAISE EXCEPTION 'cannot revoke your own admin role';
  END IF;
  DELETE FROM public.user_roles
   WHERE user_id = _user_id AND role = _role;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_grant_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_revoke_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_role(uuid, app_role) TO authenticated;
