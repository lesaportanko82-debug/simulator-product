import { supabase } from './supabase';
import { projectId } from '/utils/supabase/info';

export const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4`;

/** Bearer-токен текущей сессии (сервер проверяет пользователя по нему). */
export async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? '';
}
