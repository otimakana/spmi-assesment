const enc = new TextEncoder();
function bytesToB64Url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function b64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function hmacKey(secret, usage) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);
}
export async function issueToken(secret) {
  const payload = bytesToB64Url(enc.encode(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 })));
  const key = await hmacKey(secret, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
  return `${payload}.${bytesToB64Url(sig)}`;
}
export async function validToken(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  try {
    const key = await hmacKey(secret, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, b64UrlToBytes(parts[1]), enc.encode(parts[0]));
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(b64UrlToBytes(parts[0])));
    return payload.role === 'admin' && Number(payload.exp) > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
export function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}
export async function requireAdmin(request, env) {
  return validToken(getCookie(request, 'spmi_admin'), env.ADMIN_SESSION_SECRET || '');
}
export function sessionCookie(token) {
  return `spmi_admin=${token}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}
export function clearSessionCookie() {
  return 'spmi_admin=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
