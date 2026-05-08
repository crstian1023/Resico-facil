import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface DocItem {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

const requiredDocs = [
  { key: 'ine', label: 'INE / Identificación oficial', description: 'Frente y vuelta' },
  { key: 'csf', label: 'Constancia de Situación Fiscal', description: 'Descárgala del SAT' },
  { key: 'comprobante', label: 'Comprobante de domicilio', description: 'No mayor a 3 meses' },
  { key: 'estado-cuenta', label: 'Estado de cuenta bancario', description: 'Del mes más reciente' },
];

const Documents = () => {
  const [docs, setDocs] = useState<DocItem[]>([
    { id: '1', name: 'INE_frente.jpg', type: 'ine', status: 'verified', uploadedAt: '2024-01-10' },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const completeness = Math.round((docs.length / requiredDocs.length) * 100);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      const doc: DocItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: 'otros',
        status: 'pending',
        uploadedAt: new Date().toISOString().split('T')[0],
      };
      setDocs(prev => [doc, ...prev]);
    });
    toast.success('Documento(s) subido(s)');
    if (fileRef.current) fileRef.current.value = '';
  };

  const statusBadge = (status: DocItem['status']) => {
    switch (status) {
      case 'verified': return <Badge variant="default" className="bg-success text-success-foreground text-xs">Verificado</Badge>;
      case 'rejected': return <Badge variant="destructive" className="text-xs">Rechazado</Badge>;
      default: return <Badge variant="secondary" className="text-xs">Pendiente</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-display">Expediente Digital</h1>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Completitud del expediente</p>
              <span className="text-sm font-bold text-primary">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-3" />
            <p className="text-xs text-muted-foreground">{docs.length} de {requiredDocs.length} documentos requeridos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">Documentos requeridos</CardTitle>
              <div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleUpload} />
                <Button size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload size={16} /> Subir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {requiredDocs.map(req => {
              const uploaded = docs.find(d => d.type === req.key);
              return (
                <div key={req.key} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className={`p-2 rounded-lg ${uploaded ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {uploaded ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{req.label}</p>
                    <p className="text-xs text-muted-foreground">{req.description}</p>
                  </div>
                  {uploaded ? statusBadge(uploaded.status) : (
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Subir</Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Todos los documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aún no has subido documentos</p>
            ) : (
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-muted">
                      {doc.name.match(/\.(jpg|jpeg|png|webp)$/i) ? <Image size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString('es-MX')}</p>
                    </div>
                    {statusBadge(doc.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
