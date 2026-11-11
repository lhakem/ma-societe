import { defineMiddleware } from 'astro:middleware';
import { verifySession, COOKIE } from './lib/auth';

/** Protège tout /admin : sans session valide, redirection vers la page de connexion. */
export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;
  if (!path.startsWith('/admin') || ctx.isPrerendered) return next();

  const isLogin = path.startsWith('/admin/login');
  const session = verifySession(ctx.cookies.get(COOKIE)?.value);
  ctx.locals.admin = session;

  if (!session && !isLogin) {
    return ctx.redirect(`/admin/login/?next=${encodeURIComponent(path + ctx.url.search)}`);
  }

  const res = await next();
  try {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'same-origin');
  } catch {
    /* en-têtes immuables (redirection) */
  }
  return res;
});
