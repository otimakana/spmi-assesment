import { json } from './http.js';

function config(env) {
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || '';
  if (!url || !key) throw new Error('Konfigurasi database belum lengkap. Tambahkan SUPABASE_URL dan SUPABASE_SECRET_KEY di Cloudflare Pages.');
  return { url, key };
}
function headers(key, extra = {}) {
  const h = { apikey: key, 'Content-Type': 'application/json', ...extra };
  // Legacy service_role keys are JWTs and are commonly passed as the bearer token.
  // New sb_secret_* API keys should remain server-side and are sent as the API key.
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
}
export async function dbRequest(env, path, options = {}) {
  const { url, key } = config(env);
  const res = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: headers(key, options.headers || {}) });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const message = body && (body.message || body.error_description || body.hint) || `Database merespons ${res.status}.`;
    throw new Error(message);
  }
  return body;
}
export async function upsert(env, table, rows, conflict) {
  const query = new URLSearchParams({ on_conflict: conflict }).toString();
  return dbRequest(env, `${table}?${query}`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows)
  });
}
export async function getAll(env, table, query) {
  const { url, key } = config(env);
  const results = [];
  const pageSize = 1000;
  for (let offset = 0; offset < 20000; offset += pageSize) {
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: headers(key, { Range: `${offset}-${offset + pageSize - 1}`, 'Range-Unit': 'items' })
    });
    const text = await response.text();
    let body; try { body = text ? JSON.parse(text) : []; } catch { body = []; }
    if (!response.ok) throw new Error(body?.message || `Gagal membaca tabel ${table} (${response.status}).`);
    if (!Array.isArray(body)) throw new Error(`Format tabel ${table} tidak sesuai.`);
    results.push(...body);
    if (body.length < pageSize) return results;
  }
  return results;
}
export function configStatus(env) {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY));
}
export { json };
