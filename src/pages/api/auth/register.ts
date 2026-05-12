import type { APIRoute } from 'astro';
import { register, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const result = await register(
    form.get('username') as string,
    form.get('password') as string,
    form.get('displayName') as string,
  );
  if ('error' in result) return redirect(`/register?error=${encodeURIComponent(result.error)}`);
  const token = await createSession(result.user.id);
  cookies.set('session', token, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
  return redirect('/');
};
