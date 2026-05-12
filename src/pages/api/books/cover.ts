import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { userBooks } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const bookId = form.get('bookId') as string;
  const coverUrl = form.get('coverUrl') as string;
  await db.update(userBooks)
    .set({ coverUrl })
    .where(and(eq(userBooks.bookId, bookId), eq(userBooks.userId, locals.user!.id)));
  return redirect(`/books/${bookId}`);
};
