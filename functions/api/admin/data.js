import { json } from '../../_lib/http.js';
import { requireAdmin } from '../../_lib/auth.js';
import { getAll } from '../../_lib/db.js';
export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Sesi dashboard berakhir. Silakan masuk kembali.' }, 401);
  try {
    const [participants, assessments, reflections] = await Promise.all([
      getAll(env, 'participants', 'select=participant_key,name,institution,created_at,updated_at&order=updated_at.desc'),
      getAll(env, 'assessment_responses', 'select=id,participant_key,stage,answers,score,total,submitted_at&order=submitted_at.desc'),
      getAll(env, 'reflection_responses', 'select=id,participant_key,q1,q2,q3,submitted_at&order=submitted_at.desc')
    ]);
    return json({ ok: true, fetchedAt: new Date().toISOString(), participants, assessments, reflections });
  } catch (error) { return json({ error: error.message || 'Gagal memuat data.' }, 500); }
}
