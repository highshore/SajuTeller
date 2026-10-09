import { supabase, supabaseAnonKey, supabaseUrl, isSupabaseConfigured } from '../supabase';
import { safeReturn } from './plans';

export async function authProviders(signal?: AbortSignal): Promise<Record<string, boolean>> {
  if (!isSupabaseConfigured) throw new Error('Sign-in is not configured for this environment.');
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey }, signal });
  if (!response.ok) throw new Error('Sign-in options could not be loaded. Please try again.');
  const settings = await response.json();
  return settings.external || {};
}
export async function afterSignIn(next: string) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Please sign in again to continue.');
  const { data, error: profileError } = await supabase.from('profiles').select('onboarding_completed').eq('auth_user_id', user.id).maybeSingle();
  if (profileError) throw new Error('Your profile could not be loaded. Please try again.');
  return data?.onboarding_completed ? safeReturn(next) : `/onboarding?next=${encodeURIComponent(safeReturn(next))}`;
}
export function passwordError(password: string) {
  return password.length < 10 ? 'Use at least 10 characters.' : password.length > 72 ? 'Use no more than 72 characters.' : '';
}
