import { json, readJson, validText, validUuid } from './http.js';
import { upsert } from './db.js';

const KEYS = {
  pretest: ['B','C','A','D','C'],
  posttest: ['B','C','A','D','C']
};
const EXPLANATIONS = [
  'Pemetaan dimulai dari membaca indikator dan subindikator, memeriksa faktor yang memengaruhi, serta mencari bukti sebelum menentukan kegiatan.',
  'Alur lima tahap dalam bahan belajar ialah Memetakan, Merencanakan, Melaksanakan, Mengevaluasi, dan Mengendalikan.',
  'Solusi harus menanggapi akar masalah dan diteruskan dengan penerapan, pendampingan, serta observasi untuk melihat perubahan praktik.',
  'Evaluasi membandingkan kondisi awal, target, dan hasil aktual. Dokumentasi kegiatan saja belum membuktikan peningkatan mutu.',
  'Pengendalian memakai hasil evaluasi untuk tindakan korektif dan pencegahan, mempertahankan praktik baik, serta menyiapkan siklus berikutnya.'
];
export async function submitAssessment(request, env, stage) {
  if (request.method !== 'POST') return json({ error: 'Metode tidak didukung.' }, 405);
  try {
    if (!env.SUPABASE_URL || !(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY)) return json({ error: 'Database belum dikonfigurasi. Silakan hubungi fasilitator.' }, 503);
    const body = await readJson(request);
    if (!validUuid(body.participantKey)) throw new Error('ID peserta tidak valid. Muat ulang formulir lalu coba kembali.');
    if (!validText(body.name, 2, 120)) throw new Error('Nama wajib diisi (2–120 karakter).');
    if (!validText(body.institution, 2, 180)) throw new Error('Instansi wajib diisi (2–180 karakter).');
    if (body.consent !== true) throw new Error('Persetujuan penggunaan data untuk evaluasi sesi diperlukan.');
    if (!Array.isArray(body.answers) || body.answers.length !== 5 || body.answers.some(a => !['A','B','C','D'].includes(a))) throw new Error('Jawab kelima soal sebelum mengirim.');
    const now = new Date().toISOString();
    await upsert(env, 'participants', [{ participant_key: body.participantKey, name: body.name.trim(), institution: body.institution.trim(), updated_at: now }], 'participant_key');
    const key = KEYS[stage];
    const score = body.answers.reduce((sum, answer, i) => sum + (answer === key[i] ? 1 : 0), 0);
    await upsert(env, 'assessment_responses', [{ participant_key: body.participantKey, stage, answers: body.answers, score, total: 5, submitted_at: now, consented_at: now }], 'participant_key,stage');
    return json({ ok: true, stage, score, total: 5, details: body.answers.map((answer, i) => ({ correct: answer === key[i], answer: key[i], explanation: EXPLANATIONS[i] })) });
  } catch (error) {
    const message = error.message || 'Tidak dapat menyimpan jawaban.';
    const status = /wajib|tidak valid|jawab kelima|persetujuan|karakter|format|metode/i.test(message) ? 400 : 500;
    return json({ error: message }, status);
  }
}
export async function submitReflection(request, env) {
  if (request.method !== 'POST') return json({ error: 'Metode tidak didukung.' }, 405);
  try {
    if (!env.SUPABASE_URL || !(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY)) return json({ error: 'Database belum dikonfigurasi. Silakan hubungi fasilitator.' }, 503);
    const body = await readJson(request);
    if (!validUuid(body.participantKey)) throw new Error('ID peserta tidak valid. Muat ulang formulir lalu coba kembali.');
    if (!validText(body.name, 2, 120)) throw new Error('Nama wajib diisi (2–120 karakter).');
    if (!validText(body.institution, 2, 180)) throw new Error('Instansi wajib diisi (2–180 karakter).');
    if (body.consent !== true) throw new Error('Persetujuan penggunaan data untuk evaluasi sesi diperlukan.');
    for (const field of ['q1','q2','q3']) if (!validText(body[field], 3, 2500)) throw new Error('Isi ketiga pertanyaan refleksi (maksimal 2.500 karakter per jawaban).');
    const now = new Date().toISOString();
    await upsert(env, 'participants', [{ participant_key: body.participantKey, name: body.name.trim(), institution: body.institution.trim(), updated_at: now }], 'participant_key');
    await upsert(env, 'reflection_responses', [{ participant_key: body.participantKey, q1: body.q1.trim(), q2: body.q2.trim(), q3: body.q3.trim(), submitted_at: now, consented_at: now }], 'participant_key');
    return json({ ok: true });
  } catch (error) {
    const message = error.message || 'Tidak dapat menyimpan refleksi.';
    const status = /wajib|tidak valid|persetujuan|karakter|ketiga pertanyaan|format/i.test(message) ? 400 : 500;
    return json({ error: message }, status);
  }
}
