import type { APIRoute } from 'astro';
import { updateUserBook } from '../../../db/queries';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const bookId = form.get('bookId') as string;
  const userId = locals.user!.id;
  const status = form.get('status') as any;
  const format = form.get('format') as any;
  const rating = form.get('rating') ? Number(form.get('rating')) : undefined;
  const notes = form.get('notes') as string;
  const readAt = form.get('readAt') as string;
  const wishlist = form.get('wishlist') === 'true';

  await updateUserBook(bookId, userId, {
    ...(status && { status }),
    ...(format && { format }),
    ...(rating && { rating }),
    ...(notes !== null && { notes }),
    ...(readAt && { readAt }),
    wishlist,
  });

  return redirect('/');
};
