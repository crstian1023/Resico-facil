import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HandCoins, Building2, FileCheck, ArrowRight } from 'lucide-react';

const programs = [
  { id: '1', name: 'Crédito PyME Digital', institution: 'Nacional Financiera', type: 'Crédito', amount: 'Hasta $500,000', eligible: true },
  { id: '2', name: 'Apoyo a Micronegocios', institution: 'Secretaría de Economía', type: 'Apoyo', amount: 'Hasta $25,000', eligible: true },
  { id: '3', name: 'Financiamiento Verde', institution: 'FIRA', type: 'Crédito', amount: 'Hasta $300,000', eligible: false },
];

const SupportCredits = () => (
  <AppLayout>
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-display">Apoyos y Créditos</h1>

      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <HandCoins size={24} className="text-primary shrink-0 mt-1" />
            <div>
              <p className="font-medium text-sm">Tu expediente fiscal te abre puertas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Mantén tu expediente completo y tus registros al día para acceder a programas de apoyo y financiamiento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Programas disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {programs.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <div className="p-2 rounded-lg bg-muted"><Building2 size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.institution} · {p.amount}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.eligible ? (
                  <Badge className="bg-success text-success-foreground text-xs">Elegible</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">No elegible</Badge>
                )}
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </AppLayout>
);

export default SupportCredits;
