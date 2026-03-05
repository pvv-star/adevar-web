/**
 * Server-side auth helpers for API routes.
 * Extracts and verifies JWT from Authorization header,
 * returns user + profile data.
 */

import { getSupabaseServerClient } from './supabase-server';

/**
 * Get authenticated user from request.
 * Returns null if not authenticated (no error thrown).
 *
 * @param {Request} request
 * @returns {Promise<{ user: object, profile: object } | null>}
 */
export async function getUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const supabase = getSupabaseServerClient();

    // Verify JWT and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return null;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile: profile || { tier: 'free', ai_questions_today: 0 } };
  } catch {
    return null;
  }
}

/**
 * Reset daily question counter if it's a new day.
 * Returns updated question count.
 *
 * @param {string} userId
 * @param {object} profile
 * @returns {Promise<{ questionsToday: number, limitReached: boolean }>}
 */
export async function checkAndIncrementUsage(userId, profile) {
  const FREE_DAILY_LIMIT = 10;
  const supabase = getSupabaseServerClient();

  const now = new Date();
  const resetAt = new Date(profile.ai_questions_reset_at);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let questionsToday = profile.ai_questions_today;

  // Reset counter if it's a new day
  if (resetAt < startOfToday) {
    questionsToday = 0;
  }

  // Check if free user has hit limit
  if (profile.tier === 'free' && questionsToday >= FREE_DAILY_LIMIT) {
    return { questionsToday, limitReached: true };
  }

  // Increment counter
  questionsToday += 1;
  await supabase
    .from('profiles')
    .update({
      ai_questions_today: questionsToday,
      ai_questions_reset_at: now.toISOString(),
    })
    .eq('id', userId);

  return { questionsToday, limitReached: false };
}

/** Free tier daily limit */
export const FREE_DAILY_LIMIT = 10;
