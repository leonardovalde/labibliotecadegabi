import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from './lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const token = ctx.cookies.get('session')?.value;

  let user = null;
  if (token) {
    try {
      user = await getSessionUser(token);
    } catch (e) {
      console.error('[middleware] getSessionUser error:', e);
      ctx.cookies.delete('session', { path: '/' });
    }
  }

  if (token && !user) {
    ctx.cookies.delete('session', { path: '/' });
  }

  ctx.locals.user = user;

  if (!user && !PUBLIC_PATHS.includes(ctx.url.pathname)) {
    return ctx.redirect('/login');
  }

  return next();
});
