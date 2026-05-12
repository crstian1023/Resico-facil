-- =============================================
-- ACCOUNTANT WRITE PERMISSIONS
-- Permite al contador registrar movimientos y
-- actualizar declaraciones de sus clientes vinculados,
-- respetando el campo permissions->>'edit' del link.
-- También corrige el CHECK constraint de status para
-- incluir 'rejected' (el frontend lo usa).
-- =============================================

-- 1. Corregir CHECK constraint en accountant_client_links
--    El schema original solo tenía: 'active','revoked','pending'
--    pero el frontend usa 'rejected' al declinar una invitación.
ALTER TABLE public.accountant_client_links
  DROP CONSTRAINT IF EXISTS accountant_client_links_status_check;

ALTER TABLE public.accountant_client_links
  ADD CONSTRAINT accountant_client_links_status_check
  CHECK (status IN ('active', 'revoked', 'pending', 'rejected'));

-- 2. income_records: accountant puede INSERT y UPDATE
--    solo si el link está activo Y tiene permiso de edición.
DROP POLICY IF EXISTS "Accountants insert client income" ON public.income_records;
CREATE POLICY "Accountants insert client income" ON public.income_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = income_records.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

DROP POLICY IF EXISTS "Accountants update client income" ON public.income_records;
CREATE POLICY "Accountants update client income" ON public.income_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = income_records.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

-- 3. expense_records: ídem
DROP POLICY IF EXISTS "Accountants insert client expenses" ON public.expense_records;
CREATE POLICY "Accountants insert client expenses" ON public.expense_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = expense_records.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

DROP POLICY IF EXISTS "Accountants update client expenses" ON public.expense_records;
CREATE POLICY "Accountants update client expenses" ON public.expense_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = expense_records.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

-- 4. declaration_drafts: accountant puede INSERT y UPDATE
DROP POLICY IF EXISTS "Accountants insert client declarations" ON public.declaration_drafts;
CREATE POLICY "Accountants insert client declarations" ON public.declaration_drafts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = declaration_drafts.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

DROP POLICY IF EXISTS "Accountants update client declarations" ON public.declaration_drafts;
CREATE POLICY "Accountants update client declarations" ON public.declaration_drafts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = declaration_drafts.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

-- 5. tax_periods: accountant puede INSERT y UPDATE (para calcular impuestos)
DROP POLICY IF EXISTS "Accountants insert client tax periods" ON public.tax_periods;
CREATE POLICY "Accountants insert client tax periods" ON public.tax_periods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = tax_periods.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

DROP POLICY IF EXISTS "Accountants update client tax periods" ON public.tax_periods;
CREATE POLICY "Accountants update client tax periods" ON public.tax_periods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = tax_periods.user_id
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

DROP POLICY IF EXISTS "Accountants view client tax periods" ON public.tax_periods;
CREATE POLICY "Accountants view client tax periods" ON public.tax_periods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid()
        AND client_id = tax_periods.user_id
        AND status = 'active'
    )
  );

-- 6. Función para que el contador active/desactive permisos de edición
--    en un vínculo. Solo el contador dueño del vínculo puede llamarla.
CREATE OR REPLACE FUNCTION public.accountant_set_edit_permission(
  p_link_id UUID,
  p_can_edit BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.accountant_client_links
  SET permissions = jsonb_set(permissions, '{edit}', to_jsonb(p_can_edit)),
      updated_at  = now()
  WHERE id = p_link_id
    AND accountant_id = auth.uid()
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Vínculo no encontrado o no tienes permiso.');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.accountant_set_edit_permission(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accountant_set_edit_permission(UUID, BOOLEAN) TO authenticated;
