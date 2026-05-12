import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ locals, redirect }) => {
  const user = locals.user!;
  await db.update(users).set({ darkMode: !user.darkMode }).where(eq(users.id, user.id));
  return new Response(null, { status: 204 });
};
