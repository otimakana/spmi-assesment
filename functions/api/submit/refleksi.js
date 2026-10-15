import { submitReflection } from '../../_lib/submit.js';
export async function onRequestPost({ request, env }) { return submitReflection(request, env); }
