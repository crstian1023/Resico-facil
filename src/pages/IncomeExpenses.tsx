import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const incomeCategories = ['Ventas', 'Servicios', 'Comisiones', 'Otros ingresos'];
const expenseCategories = ['Materia prima', 'Renta', 'Servicios', 'Transporte', 'Comida', 'Papelería', 'Otros gastos'];

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const IncomeExpenses = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'income', amount: 3500, category: 'Ventas', description: 'Venta del día', date: '2024-01-15' },
    { id: '2', type: 'expense', amount: 450, category: 'Transporte', description: 'Gasolina', date: '2024-01-15' },
    { id: '3', type: 'income', amount: 2800, category: 'Servicios', description: 'Servicio de plomería', date: '2024-01-14' },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleAdd = () => {
    if (!newAmount || !newCategory) { toast.error('Completa monto y categoría'); return; }
    const tx: Transaction = {
      id: Date.now().toString(),
      type: newType,
      amount: parseFloat(newAmount),
      category: newCategory,
      description: newDescription,
      date: newDate,
    };
    setTransactions([tx, ...transactions]);
    setDialogOpen(false);
    setNewAmount(''); setNewCategory(''); setNewDescription('');
    toast.success(newType === 'income' ? 'Ingreso registrado' : 'Gasto registrado');
  };

  const formatMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Ingresos y Gastos</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg"><Plus size={18} /> Registrar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Nuevo registro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs value={newType} onValueChange={(v) => setNewType(v as 'income' | 'expense')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="income">Ingreso</TabsTrigger>
                    <TabsTrigger value="expense">Gasto</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input type="number" placeholder="0.00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="h-12 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {(newType === 'income' ? incomeCategories : expenseCategories).map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descripción (opcional)</Label>
                  <Input placeholder="Ej: Venta de mercancía" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="h-12" />
                </div>
                <Button size="lg" className="w-full" onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent text-accent-foreground"><TrendingUp size={18} /></div>
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-lg font-bold font-display">{formatMoney(totalIncome)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive"><TrendingDown size={18} /></div>
              <div>
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="text-lg font-bold font-display">{formatMoney(totalExpenses)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Movimientos recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive'}`}>
                    {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description || tx.category}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default IncomeExpenses;
