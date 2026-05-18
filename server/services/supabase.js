import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function upsertAccount({ accountId, accessToken, refreshToken }) {
  const { error } = await supabase.from('accounts').upsert({
    account_id: accountId,
    access_token: accessToken,
    refresh_token: refreshToken,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'account_id' });
  if (error) throw error;
}

export async function getAccount(accountId) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('account_id', accountId)
    .single();
  if (error) throw error;
  return data;
}

export async function getRules(accountId) {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createRule({ accountId, boardId, boardName, triggerColumn, channel, webhookUrl }) {
  const { data, error } = await supabase
    .from('notification_rules')
    .insert({
      account_id: accountId,
      board_id: boardId,
      board_name: boardName,
      trigger_column: triggerColumn,
      channel,
      webhook_url: webhookUrl,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRule(ruleId, accountId) {
  const { error } = await supabase
    .from('notification_rules')
    .delete()
    .eq('id', ruleId)
    .eq('account_id', accountId);
  if (error) throw error;
}

export async function logNotification({ ruleId, accountId, status, error }) {
  await supabase.from('notification_logs').insert({
    rule_id: ruleId,
    account_id: accountId,
    status,
    error_message: error || null,
    sent_at: new Date().toISOString(),
  });
}
