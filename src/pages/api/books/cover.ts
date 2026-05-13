import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { userBooks } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { uploadCover } from '../../../lib/cloudinary';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const bookId = form.get('bookId') as string;
  const rawUrl = form.get('coverUrl') as string;

  const coverUrl = rawUrl ? await uploadCover(rawUrl, `user_${locals.user!.id}_${bookId}`) : rawUrl;

  await db.update(userBooks)
    .set({ coverUrl })
    .where(and(eq(userBooks.bookId, bookId), eq(userBooks.userId, locals.user!.id)));

  return redirect(`/books/${bookId}`);
};
