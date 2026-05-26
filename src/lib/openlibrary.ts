export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  language?: string[];
  subject?: string[];
  series?: string[];
}

export interface OLAuthor {
  key: string;
  name: string;
  birth_date?: string;
  bio?: string | { value: string };
  personal_name?: string;
}

const BASE = 'https://openlibrary.org';

export function getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L') {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function getCoverByIsbn(isbn: string, size: 'S' | 'M' | 'L' = 'L') {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

export async function searchBooks(query: string, limit = 20): Promise<OLSearchResult[]> {
  try {
    const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,author_key,first_publish_year,isbn,cover_i,number_of_pages_median,language,subject,series`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs ?? [];
  } catch (e) {
    console.error('[openlibrary] search failed:', e);
    return [];
  }
}

export async function getAuthor(authorKey: string): Promise<OLAuthor | null> {
  const res = await fetch(`${BASE}${authorKey}.json`);
  if (!res.ok) return null;
  return res.json();
}
