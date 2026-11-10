/**
 * Единое преобразование «логин → email» для входа.
 * ДОЛЖНО совпадать с loginToEmail в supabase/functions/make-server-0610b5e4/index.ts.
 * Если введён email — используется как есть; иначе base64url(логин)@LOGIN_EMAIL_DOMAIN.
 */
export const LOGIN_EMAIL_DOMAIN = 'login.product-simulator.com';

function b64url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function loginToEmail(login: string): string {
  const v = String(login || '').trim().toLowerCase();
  if (!v) return '';
  if (v.includes('@')) return v;
  return `${b64url(v)}@${LOGIN_EMAIL_DOMAIN}`.toLowerCase();
}
