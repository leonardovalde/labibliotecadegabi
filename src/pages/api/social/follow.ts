import type { APIRoute } from 'astro';
import { toggleFollow } from '../../../db/queries';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();
  const targetId = form.get('targetId') as string;
  const currentUser = locals.user!;
  if (targetId !== currentUser.id) await toggleFollow(currentUser.id, targetId);
  return redirect(`/explore`);
};
