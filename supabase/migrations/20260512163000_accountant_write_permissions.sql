-- =============================================
-- ACCOUNTANT WRITE PERMISSIONS
-- Permite al contador registrar movimientos y
-- actualizar declaraciones de sus clientes vinculados,
-- respetando el campo permissions->>'edit' del link.
-- También agrega el estado 'rejected' al CHECK de status.
-- =============================================

-- 1. Fix del CHECK constraint de status
ALTER TABLE public.accountant_client_links DROP CONSTRAINT IF EXISTS accountant_client_links_status_check;
ALTER TABLE public.accountant_client_links ADD CONSTRAINT accountant_client_links_status_check 
  CHECK (status IN ('active', 'revoked', 'pending', 'rejected'));

-- 2. Función para alternar el permiso de edición (RPC)
CREATE OR REPLACE FUNCTION public.accountant_set_edit_permission(p_link_id UUID, p_can_edit BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_accountant_id UUID := auth.uid();
  v_role          TEXT;
BEGIN
  -- Verificar que el usuario sea contador o admin
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = v_accountant_id AND role IN ('accountant', 'admin')
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN jsonb_build_object('error', 'Solo los contadores pueden gestionar permisos de edición.');
  END IF;

  -- Verificar que el vínculo pertenezca al contador
  IF NOT EXISTS (
    SELECT 1 FROM public.accountant_client_links 
    WHERE id = p_link_id AND accountant_id = v_accountant_id
  ) THEN
    RETURN jsonb_build_object('error', 'No tienes permiso sobre este vínculo de cliente.');
  END IF;

  -- Actualizar el JSONB de permisos
  UPDATE public.accountant_client_links
  SET permissions = permissions || jsonb_build_object('edit', p_can_edit),
      updated_at = now()
  WHERE id = p_link_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.accountant_set_edit_permission(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accountant_set_edit_permission(UUID, BOOLEAN) TO authenticated;

-- 3. Políticas RLS de escritura para Contadores

-- INCOME_RECORDS
CREATE POLICY "Accountants can insert client income" ON public.income_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = income_records.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

CREATE POLICY "Accountants can update client income" ON public.income_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = income_records.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

CREATE POLICY "Accountants can delete client income" ON public.income_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = income_records.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

-- EXPENSE_RECORDS
CREATE POLICY "Accountants can insert client expenses" ON public.expense_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = expense_records.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

CREATE POLICY "Accountants can update client expenses" ON public.expense_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = expense_records.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

CREATE POLICY "Accountants can delete client expenses" ON public.expense_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = expense_records.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

-- TAX_PERIODS
CREATE POLICY "Accountants can manage client tax periods" ON public.tax_periods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = tax_periods.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );

-- DECLARATION_DRAFTS
CREATE POLICY "Accountants can manage client declarations" ON public.declaration_drafts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.accountant_client_links
      WHERE accountant_id = auth.uid() 
        AND client_id = declaration_drafts.user_id 
        AND status = 'active'
        AND (permissions->>'edit')::boolean = true
    )
  );
