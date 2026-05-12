import type { APIRoute } from 'astro';
import { deleteSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get('session')?.value;
  if (token) await deleteSession(token);
  cookies.delete('session', { path: '/' });
  return redirect('/login');
};
