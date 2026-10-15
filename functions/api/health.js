import { json } from '../_lib/http.js';
import { configStatus } from '../_lib/db.js';
export async function onRequestGet({ env }) {
  return json({ ok: true, databaseConfigured: configStatus(env), adminConfigured: Boolean(env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET), message: configStatus(env) ? 'Layanan aktif.' : 'Lengkapi secrets database di Cloudflare.' });
}
