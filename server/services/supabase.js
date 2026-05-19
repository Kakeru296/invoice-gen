import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function upsertAccount({ account_id, access_token, refresh_token, token_expires_at, monday_user_id, monday_account_name }) {
  const { error } = await supabase.from('accounts').upsert({
    account_id,
    access_token,
    refresh_token,
    token_expires_at,
    monday_user_id,
    monday_account_name,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'account_id' });
  if (error) throw error;
}

export async function getAccount(account_id) {
  const { data, error } = await supabase.from('accounts').select('*').eq('account_id', account_id).single();
  if (error) throw error;
  return data;
}

export async function getTemplate(account_id) {
  const { data, error } = await supabase.from('invoice_templates').select('*').eq('account_id', account_id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function upsertTemplate(account_id, fields) {
  const { error } = await supabase.from('invoice_templates').upsert({
    account_id,
    ...fields,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'account_id' });
  if (error) throw error;
}

export async function createInvoice(data) {
  const { data: row, error } = await supabase.from('invoices').insert(data).select().single();
  if (error) throw error;
  return row;
}

export async function listInvoices(account_id, limit = 50) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('account_id', account_id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getInvoice(id, account_id) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('account_id', account_id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(id, account_id, status) {
  const { error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('account_id', account_id);
  if (error) throw error;
}
