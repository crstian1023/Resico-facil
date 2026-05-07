import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Shield, Bell, HelpCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [rfc, setRfc] = useState('');
  const [curp, setCurp] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [activity, setActivity] = useState('');

  const handleSave = () => {
    if (rfc && !/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i.test(rfc)) {
      toast.error('Formato de RFC inválido');
      return;
    }
    toast.success('Datos guardados correctamente');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Ajustes</h1>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <CardTitle className="text-base font-display">Datos personales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input value={user?.email || ''} disabled className="h-12 bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input value={user?.user_metadata?.full_name || ''} disabled className="h-12 bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input placeholder="10 dígitos" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              <CardTitle className="text-base font-display">Perfil fiscal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>RFC</Label>
              <Input placeholder="XAXX010101000" value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} className="h-12 uppercase" maxLength={13} />
            </div>
            <div className="space-y-2">
              <Label>CURP</Label>
              <Input placeholder="18 caracteres" value={curp} onChange={(e) => setCurp(e.target.value.toUpperCase())} className="h-12 uppercase" maxLength={18} />
            </div>
            <div className="space-y-2">
              <Label>Domicilio fiscal</Label>
              <Input placeholder="Calle, número, colonia, CP" value={address} onChange={(e) => setAddress(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Actividad económica principal</Label>
              <Input placeholder="Ej: Venta de alimentos" value={activity} onChange={(e) => setActivity(e.target.value)} className="h-12" />
            </div>
            <Button size="lg" className="w-full" onClick={handleSave}>Guardar cambios</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
