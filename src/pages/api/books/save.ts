import type { APIRoute } from 'astro';
import { addBookToLibrary } from '../../../db/queries';
import { db } from '../../../db';
import { userBooks } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const bookId = form.get('bookId') as string;
  const from = form.get('from') as string;
  const wishlist = form.get('wishlist') === 'true';

  await addBookToLibrary(bookId, locals.user!.id);

  if (wishlist) {
    await db.update(userBooks)
      .set({ wishlist: true })
      .where(and(eq(userBooks.bookId, bookId), eq(userBooks.userId, locals.user!.id)));
  }

  return redirect(from || '/');
};
