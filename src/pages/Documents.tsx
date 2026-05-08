import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DocItem {
  id: string;
  name: string;
  typeCode: string | null;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  fileUrl: string;
}

interface DocType {
  id: string;
  code: string;
  name: string;
}

const REQUIRED_CODES = [
  { code: 'ine',                label: 'INE / Identificación oficial',    description: 'Frente y vuelta' },
  { code: 'csf',                label: 'Constancia de Situación Fiscal',  description: 'Descárgala del SAT' },
  { code: 'comprobante-domicilio', label: 'Comprobante de domicilio',     description: 'No mayor a 3 meses' },
  { code: 'estado-cuenta',      label: 'Estado de cuenta bancario',       description: 'Del mes más reciente' },
];

const Documents = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingTypeCode = useRef<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = async () => {
    if (!user) return;
    setLoadingData(true);

    const [typesRes, docsRes] = await Promise.all([
      supabase.from('document_types').select('id, code, name'),
      supabase
        .from('documents')
        .select('id, file_name, file_url, verification_status, created_at, document_type_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
    ]);

    const types: DocType[] = typesRes.data ?? [];
    setDocTypes(types);

    const typeById = Object.fromEntries(types.map(t => [t.id, t.code]));
    setDocs(
      (docsRes.data ?? []).map(d => ({
        id: d.id,
        name: d.file_name,
        typeCode: d.document_type_id ? (typeById[d.document_type_id] ?? null) : null,
        status: (d.verification_status ?? 'pending') as DocItem['status'],
        uploadedAt: d.created_at,
        fileUrl: d.file_url,
      }))
    );
    setLoadingData(false);
  };

  useEffect(() => { loadData(); }, [user]);

  // ── Trigger upload ────────────────────────────────────────────────────────
  const triggerUpload = (code: string | null) => {
    pendingTypeCode.current = code;
    if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); }
  };

  // ── Handle file → Storage → DB ────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const typeCode = pendingTypeCode.current;
    setUploading(typeCode ?? '__generic__');

    try {
      const storagePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('taxpayer-documents')
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      if (storageError) {
        toast.error(`Error al subir archivo: ${storageError.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from('taxpayer-documents').getPublicUrl(storagePath);
      const matchedType = docTypes.find(t => t.code === typeCode);

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData?.publicUrl ?? storagePath,
        file_size: file.size,
        mime_type: file.type,
        document_type_id: matchedType?.id ?? null,
        verification_status: 'pending',
        status: 'active',
      });

      if (dbError) {
        await supabase.storage.from('taxpayer-documents').remove([storagePath]);
        toast.error(`Error al guardar: ${dbError.message}`);
        return;
      }

      toast.success('Documento guardado correctamente');
      await loadData();
    } finally {
      setUploading(null);
      pendingTypeCode.current = null;
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const requiredUploaded = REQUIRED_CODES.filter(r => docs.some(d => d.typeCode === r.code)).length;
  const completeness = Math.round((requiredUploaded / REQUIRED_CODES.length) * 100);

  const statusBadge = (status: DocItem['status']) => {
    switch (status) {
      case 'verified': return <Badge variant="default" className="bg-success text-success-foreground text-xs">Verificado</Badge>;
      case 'rejected': return <Badge variant="destructive" className="text-xs">Rechazado</Badge>;
      default: return <Badge variant="secondary" className="text-xs">Pendiente</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Expediente Digital</h1>

        {/* Progress */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Completitud del expediente</p>
              <span className="text-sm font-bold text-primary">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-3" />
            <p className="text-xs text-muted-foreground">{requiredUploaded} de {REQUIRED_CODES.length} documentos requeridos</p>
          </CardContent>
        </Card>

        {/* Required docs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">Documentos requeridos</CardTitle>
              <div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                <Button size="sm" disabled={!!uploading} onClick={() => triggerUpload(null)}>
                  {uploading === '__generic__' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Subir otro
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingData ? (
              <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
            ) : (
              REQUIRED_CODES.map(req => {
                const uploaded = docs.find(d => d.typeCode === req.code);
                const isUploading = uploading === req.code;
                return (
                  <div key={req.code} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className={`p-2 rounded-lg ${uploaded ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {uploaded ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{req.label}</p>
                      {uploaded
                        ? <p className="text-xs text-muted-foreground truncate">{uploaded.name}</p>
                        : <p className="text-xs text-muted-foreground">{req.description}</p>
                      }
                    </div>
                    {uploaded ? (
                      <div className="flex items-center gap-2">
                        {statusBadge(uploaded.status)}
                        <Button variant="ghost" size="sm" disabled={!!uploading} onClick={() => triggerUpload(req.code)}>Reemplazar</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" disabled={!!uploading} onClick={() => triggerUpload(req.code)}>
                        {isUploading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                        {isUploading ? 'Subiendo...' : 'Subir'}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* All docs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Todos los documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
            ) : docs.length === 0 ? (
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString('es-MX')}
                        {doc.typeCode && ` · ${docTypes.find(t => t.code === doc.typeCode)?.name ?? doc.typeCode}`}
                      </p>
                    </div>
                    {statusBadge(doc.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Documents;
