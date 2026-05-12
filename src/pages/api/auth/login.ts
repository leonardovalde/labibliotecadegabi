import type { APIRoute } from 'astro';
import { login } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  console.log('[login endpoint] called');
  try {
    const form = await request.formData();
    const username = form.get('username') as string;
    const password = form.get('password') as string;
    console.log('[login endpoint] username:', username);
    const result = await login(username, password);
    console.log('[login endpoint] result:', result);
    if ('error' in result) return redirect(`/login?error=${encodeURIComponent(result.error)}`);
    cookies.set('session', result.token, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
    return redirect('/');
  } catch (e) {
    console.error('[login endpoint] exception:', e);
    return redirect(`/login?error=${encodeURIComponent(String(e))}`);
  }
};
