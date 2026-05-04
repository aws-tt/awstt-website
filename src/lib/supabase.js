import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anon ? createClient(url, anon) : null;
export const portalBaseUrl = import.meta.env.VITE_PORTAL_BASE_URL || 'https://awstorqueandtension.com';
export const adminBaseUrl = import.meta.env.VITE_ADMIN_BASE_URL || 'https://admin.torqueandtension.com';
export const helperApi = import.meta.env.VITE_HELPER_API_URL || 'http://localhost:5055';

export async function getSessionProfile() {
  if (!supabase) return { session: null, profile: null };
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session || null;
  if (!session) return { session: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return { session, profile };
}

export function isAdmin(profile) {
  return profile?.role === 'admin';
}
