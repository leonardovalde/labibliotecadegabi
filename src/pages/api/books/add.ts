import type { APIRoute } from 'astro';
import { upsertBookFromOL, upsertAuthor, addBookToLibrary } from '../../../db/queries';
import { db } from '../../../db';
import { bookAuthors } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const userId = locals.user!.id;
  const form = await request.formData();

  const openLibraryId = form.get('openLibraryId') as string;
  const title = form.get('title') as string;
  const isbn = form.get('isbn') as string;
  const coverUrl = form.get('coverUrl') as string;
  const pages = form.get('pages') ? Number(form.get('pages')) : undefined;
  const yearPublished = form.get('yearPublished') ? Number(form.get('yearPublished')) : undefined;
  const language = form.get('language') as string;
  const genres = form.get('genres') ? (form.get('genres') as string).split(',').filter(Boolean) : undefined;
  const authorNames = form.get('authorNames') ? (form.get('authorNames') as string).split(',').filter(Boolean) : [];
  const authorKeys = form.get('authorKeys') ? (form.get('authorKeys') as string).split(',').filter(Boolean) : [];
  const series = form.get('series') as string;

  const book = await upsertBookFromOL({
    openLibraryId,
    title,
    isbn: isbn || undefined,
    coverUrl: coverUrl || undefined,
    pages,
    yearPublished,
    originalLanguage: language || undefined,
    genres,
    isSaga: !!series,
    sagaName: series || undefined,
  });

  // Upsert authors and link
  for (let i = 0; i < authorNames.length; i++) {
    const author = await upsertAuthor({
      openLibraryId: authorKeys[i] || undefined,
      name: authorNames[i],
    });
    // Link if not already linked
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
