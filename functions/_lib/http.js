export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  }});
}
export async function readJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) throw new Error('Permintaan harus menggunakan format JSON.');
  const raw = await request.text();
  if (raw.length > 30000) throw new Error('Ukuran data terlalu besar.');
  try { return JSON.parse(raw); } catch { throw new Error('Format data tidak valid.'); }
}
export function validText(value, min, max) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
}
export function validUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
