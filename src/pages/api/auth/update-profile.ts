import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  await db.update(users).set({
    displayName: (form.get('displayName') as string) || null,
    avatarUrl: (form.get('avatarUrl') as string) || null,
    bio: (form.get('bio') as string) || null,
  }).where(eq(users.id, locals.user!.id));
  return redirect(`/u/${locals.user!.username}`);
};
