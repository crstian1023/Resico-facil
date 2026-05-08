import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please check your .env file or .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Tipos para mejor autenticación y tipos de datos
export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  rfc?: string;
  role: 'taxpayer' | 'accountant' | 'admin' | 'supervisor';
  created_at: string;
};

export type TaxpayerProfile = {
  id: string;
  user_id: string;
  rfc: string;
  curp?: string;
  business_name?: string;
  tax_regime: string;
  activity?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
};

export type IncomeRecord = {
  id: string;
  user_id: string;
  taxpayer_profile_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseRecord = {
  id: string;
  user_id: string;
  taxpayer_profile_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
};

// Funciones de utilidad para autenticación
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Funciones para obtener perfil del usuario
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getTaxpayerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('taxpayer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

// Funciones para ingresos y gastos
export const getIncomeRecords = async (userId: string, year?: number, month?: number) => {
  let query = supabase
    .from('income_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (year && month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    query = query.gte('date', startDate).lte('date', endDate);
  } else if (year) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getExpenseRecords = async (userId: string, year?: number, month?: number) => {
  let query = supabase
    .from('expense_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (year && month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    query = query.gte('date', startDate).lte('date', endDate);
  } else if (year) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createIncomeRecord = async (record: Omit<IncomeRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('income_records')
    .insert([record])
    .select()
    .single();
  return { data, error };
};

export const createExpenseRecord = async (record: Omit<ExpenseRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('expense_records')
    .insert([record])
    .select()
    .single();
  return { data, error };
};

export const updateIncomeRecord = async (id: string, updates: Partial<IncomeRecord>) => {
  const { data, error } = await supabase
    .from('income_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const updateExpenseRecord = async (id: string, updates: Partial<ExpenseRecord>) => {
  const { data, error } = await supabase
    .from('expense_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteIncomeRecord = async (id: string) => {
  const { error } = await supabase
    .from('income_records')
    .delete()
    .eq('id', id);
  return { error };
};

export const deleteExpenseRecord = async (id: string) => {
  const { error } = await supabase
    .from('expense_records')
    .delete()
    .eq('id', id);
  return { error };
};

// Funciones para documentos
export const uploadDocument = async (file: File, userId: string, documentType: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('taxpayer-documents')
    .upload(fileName, file);
  
  return { data, error };
};

export const getDocumentUrl = async (fileName: string) => {
  const { data, error } = await supabase.storage
    .from('taxpayer-documents')
    .getPublicUrl(fileName);
  return { data, error };
};

// Escuchar cambios en autenticación
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
