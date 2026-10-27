/**
 * Wizer — Cloudflare Workers (assets statiques + API Fidelity).
 * Route uniquement /api/fidelity/* vers l’API privée.
 * Toutes les autres pages restent servies depuis dist.
 */
import { onRequest as fidelityAPI, purgeExpiredFidelity } from '../functions/api/fidelity/[[path]].js';

export default {
  async fetch(request, env, context) {
    const path = new URL(request.url).pathname;
    if (path === '/api/fidelity' || path.startsWith('/api/fidelity/')) {
      return fidelityAPI({ request, env, context });
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(controller, env, ctx) {
    await purgeExpiredFidelity(env);
  }
};
