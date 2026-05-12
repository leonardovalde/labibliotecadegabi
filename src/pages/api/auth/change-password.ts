import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { encodePassword } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const current = form.get('current') as string;
  const next = form.get('new') as string;

  const user = locals.user!;
  if (user.passwordB64 !== encodePassword(current)) {
    return redirect('/settings?error=Contraseña actual incorrecta');
  }
  if (!next || next.length < 3) {
    return redirect('/settings?error=La nueva contraseña es muy corta');
  }

  await db.update(users).set({ passwordB64: encodePassword(next) }).where(eq(users.id, user.id));
  return redirect('/settings?ok=1');
};
