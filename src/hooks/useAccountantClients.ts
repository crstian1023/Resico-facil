import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AccountantClientRow {
  id: string;
  client_id: string;
  status: string;
  created_at: string;
  permissions: any;
  client_name?: string | null;
  client_rfc?: string | null;
}

export const useAccountantClients = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['accountant_clients', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AccountantClientRow[]> => {
      const { data: links, error } = await supabase
        .from('accountant_client_links')
        .select('id, client_id, status, created_at, permissions')
        .eq('accountant_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const ids = (links ?? []).map((l) => l.client_id);
      if (ids.length === 0) return [];

      const [{ data: profs }, { data: tps }] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name').in('user_id', ids),
        supabase.from('taxpayer_profiles').select('user_id, rfc').in('user_id', ids),
      ]);

      return (links ?? []).map((l) => ({
        ...l,
        client_name: profs?.find((p) => p.user_id === l.client_id)?.full_name ?? null,
        client_rfc: tps?.find((t) => t.user_id === l.client_id)?.rfc ?? null,
      }));
    },
  });

  const inviteByRfc = useMutation({
    mutationFn: async (rfc: string) => {
      if (!user) throw new Error('No user');
      const cleanRfc = rfc.trim().toUpperCase();
      const { data: tp, error: tpErr } = await supabase
        .from('taxpayer_profiles')
        .select('user_id')
        .eq('rfc', cleanRfc)
        .maybeSingle();
      if (tpErr) throw tpErr;
      if (!tp) throw new Error('No se encontró un contribuyente con ese RFC.');

      const { error } = await supabase.from('accountant_client_links').insert({
        accountant_id: user.id,
        client_id: tp.user_id,
        status: 'pending',
      });
      if (error) {
        if (error.code === '23505') throw new Error('Ya existe una invitación para este cliente.');
        throw error;
      }

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'accountant.invite',
        table_name: 'accountant_client_links',
        new_data: { client_id: tp.user_id, rfc: cleanRfc } as any,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accountant_clients', user?.id] }),
  });

  return { ...list, inviteByRfc };
};

export const usePendingInvitations = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['my_invitations', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: links, error } = await supabase
        .from('accountant_client_links')
        .select('id, accountant_id, status, created_at')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const ids = (links ?? []).map((l) => l.accountant_id);
      if (ids.length === 0) return [];

      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', ids);

      return (links ?? []).map((l) => ({
        ...l,
        accountant_name: profs?.find((p) => p.user_id === l.accountant_id)?.full_name ?? 'Contador',
      }));
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      if (!user) throw new Error('No user');
      const status = accept ? 'active' : 'rejected';
      const { error } = await supabase
        .from('accountant_client_links')
        .update({ status })
        .eq('id', id)
        .eq('client_id', user.id);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: accept ? 'accountant.link.accept' : 'accountant.link.reject',
        table_name: 'accountant_client_links',
        record_id: id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my_invitations', user?.id] });
      qc.invalidateQueries({ queryKey: ['accountant_clients'] });
    },
  });

  return { ...list, respond };
};
