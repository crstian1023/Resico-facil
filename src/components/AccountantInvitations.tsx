import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePendingInvitations } from '@/hooks/useAccountantClients';
import { Check, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const AccountantInvitations: React.FC = () => {
  const { data, isLoading, respond } = usePendingInvitations();
  const pending = (data ?? []).filter((i) => i.status === 'pending');

  if (isLoading || pending.length === 0) return null;

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck size={18} className="text-primary" />
          Invitaciones de contador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pending.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between gap-2 p-2 rounded border border-border">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{inv.accountant_name}</p>
              <p className="text-xs text-muted-foreground">Quiere acceder a tu información fiscal</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await respond.mutateAsync({ id: inv.id, accept: false });
                  toast.success('Invitación rechazada');
                }}
              >
                <X size={14} />
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  await respond.mutateAsync({ id: inv.id, accept: true });
                  toast.success('Vínculo aceptado');
                }}
              >
                <Check size={14} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AccountantInvitations;
