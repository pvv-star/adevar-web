import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function logDataChange({ tableName, recordKey, action, changedBy, reason, payload }) {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from('data_change_log').insert({
    table_name: tableName,
    record_key: recordKey || null,
    action,
    changed_by: changedBy || null,
    reason: reason || null,
    payload: payload || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
