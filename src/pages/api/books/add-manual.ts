import type { APIRoute } from 'astro';
import { upsertBookFromOL, upsertAuthor, addBookToLibrary } from '../../../db/queries';
import { db } from '../../../db';
import { bookAuthors } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const userId = locals.user!.id;
  const form = await request.formData();

  const book = await upsertBookFromOL({
    openLibraryId: `manual-${Date.now()}`,
    title: form.get('title') as string,
    isbn: (form.get('isbn') as string) || undefined,
    coverUrl: (form.get('coverUrl') as string) || undefined,
    pages: form.get('pages') ? Number(form.get('pages')) : undefined,
    yearPublished: form.get('yearPublished') ? Number(form.get('yearPublished')) : undefined,
    originalLanguage: (form.get('originalLanguage') as string) || undefined,
    genres: form.get('genres') ? (form.get('genres') as string).split(',').map((g) => g.trim()).filter(Boolean) : undefined,
    isSaga: form.get('isSaga') === 'true',
    sagaName: (form.get('sagaName') as string) || undefined,
    sagaOrder: form.get('sagaOrder') ? Number(form.get('sagaOrder')) : undefined,
  });

  const authorName = (form.get('authorName') as string)?.trim();
  if (authorName) {
    const author = await upsertAuthor({
      name: authorName,
      nationality: (form.get('authorNationality') as string) || undefined,
      gender: (form.get('authorGender') as any) || 'unknown',
    });
    const [existing] = await db
      .select()
      .from(bookAuthors)
      .where(and(eq(bookAuthors.bookId, book.id), eq(bookAuthors.authorId, author.id)));
    if (!existing) {
      await db.insert(bookAuthors).values({ bookId: book.id, authorId: author.id });
    }
  }

  await addBookToLibrary(book.id, userId);
  return redirect(`/books/${book.id}`);
};
