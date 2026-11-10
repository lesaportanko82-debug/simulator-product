import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? `https://${projectId}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? publicAnonKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // КРИТИЧЕСКИ ВАЖНО: включаем персистентность сессии
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Используем localStorage для хранения сессии
      storage: window.localStorage,
      storageKey: 'pm-academy-auth',
      // Включаем flowType для более надежной аутентификации
      flowType: 'pkce'
    }
  }
);