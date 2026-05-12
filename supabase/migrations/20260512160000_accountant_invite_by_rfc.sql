CREATE OR REPLACE FUNCTION public.accountant_invite_by_rfc(p_rfc TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_accountant_id UUID := auth.uid();
  v_role          TEXT;
  v_client_id     UUID;
  v_link_id       UUID;
BEGIN
  -- 1. Verificar rol
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = v_accountant_id AND role IN ('accountant', 'admin')
  LIMIT 1;
  IF v_role IS NULL THEN
    RETURN jsonb_build_object('error', 'Solo los contadores pueden enviar invitaciones.');
  END IF;

  -- 2. Buscar contribuyente por RFC
  SELECT user_id INTO v_client_id
  FROM public.taxpayer_profiles
  WHERE UPPER(TRIM(rfc)) = UPPER(TRIM(p_rfc))
  LIMIT 1;
  IF v_client_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No se encontró un contribuyente registrado con ese RFC.');
  END IF;

  -- 3. No invitarse a sí mismo
  IF v_client_id = v_accountant_id THEN
    RETURN jsonb_build_object('error', 'No puedes invitarte a ti mismo.');
  END IF;

  -- 4. Insertar o reutilizar
  INSERT INTO public.accountant_client_links (accountant_id, client_id, status)
  VALUES (v_accountant_id, v_client_id, 'pending')
  ON CONFLICT (accountant_id, client_id) DO UPDATE
    SET status = CASE
      WHEN public.accountant_client_links.status = 'rejected' THEN 'pending'
      ELSE public.accountant_client_links.status
    END, updated_at = now()
  RETURNING id INTO v_link_id;

  IF v_link_id IS NULL THEN
    SELECT id INTO v_link_id FROM public.accountant_client_links
    WHERE accountant_id = v_accountant_id AND client_id = v_client_id;
    IF (SELECT status FROM public.accountant_client_links WHERE id = v_link_id) = 'active' THEN
      RETURN jsonb_build_object('error', 'Este cliente ya está vinculado a tu cuenta.');
    END IF;
    RETURN jsonb_build_object('error', 'Ya existe una invitación pendiente para este cliente.');
  END IF;

  -- 5. Audit log
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
  VALUES (v_accountant_id, 'accountant.invite', 'accountant_client_links', v_client_id,
    jsonb_build_object('rfc', p_rfc, 'link_id', v_link_id));

  RETURN jsonb_build_object('ok', true, 'link_id', v_link_id);
END;
$$;

REVOKE ALL ON FUNCTION public.accountant_invite_by_rfc(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accountant_invite_by_rfc(TEXT) TO authenticated;
