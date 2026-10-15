import { submitAssessment } from '../../_lib/submit.js';
export async function onRequestPost({ request, env }) { return submitAssessment(request, env, 'posttest'); }
