import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { books } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const bookId = form.get('bookId') as string;

  await db.delete(books).where(eq(books.id, bookId));

  return redirect('/');
};
