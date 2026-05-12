import type { APIRoute } from 'astro';
import { searchBooks } from '../../../lib/openlibrary';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') ?? '';
  const source = url.searchParams.get('source') ?? 'ol';

  if (!q) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });

  if (source === 'bing') {
    const apiKey = process.env.BING_SEARCH_API_KEY as string;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Bing Search no configurado — agrega BING_SEARCH_API_KEY en .env' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(
      `https://real-time-image-search.p.rapidapi.com/search?query=${encodeURIComponent(q + ' book cover')}&limit=15&size=any&type=any`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'real-time-image-search.p.rapidapi.com',
        },
      }
    );
    const data = await res.json();
    const covers = (data.data ?? []).map((item: any) => ({
      url: item.thumbnail_url ?? item.url,
      label: item.title ?? '',
    })).filter((c: any) => c.url);
    return new Response(JSON.stringify(covers), { headers: { 'Content-Type': 'application/json' } });
  }

  // Open Library (default)
  const results = await searchBooks(q, 10);
  const covers = results
    .filter((book) => book.cover_i)
    .map((book) => ({
      url: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
      label: book.title,
    }))
    .slice(0, 20);

  return new Response(JSON.stringify(covers), { headers: { 'Content-Type': 'application/json' } });
};
