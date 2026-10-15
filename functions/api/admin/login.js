import { json, readJson } from '../../_lib/http.js';
import { issueToken, sessionCookie } from '../../_lib/auth.js';
export async function onRequestPost({ request, env }) {
  try {
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) return json({ error: 'Password dashboard atau ADMIN_SESSION_SECRET belum dikonfigurasi dengan benar.' }, 503);
    const body = await readJson(request);
    if (typeof body.password !== 'string' || body.password !== env.ADMIN_PASSWORD) return json({ error: 'Password dashboard tidak sesuai.' }, 401);
    const token = await issueToken(env.ADMIN_SESSION_SECRET);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) { return json({ error: error.message || 'Login gagal.' }, 400); }
}
