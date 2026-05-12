import { db } from './index';
import { books, authors, bookAuthors, userBooks, tags, bookTags, collections, collectionBooks, users, follows } from './schema';
import { eq, ilike, and, sql, ne } from 'drizzle-orm';

export async function getLibrary(filters: {
  status?: string;
  genre?: string;
  search?: string;
  wishlist?: boolean;
  userId: string;
} ) {
  let query = db
    .select({ userBook: userBooks, book: books })
    .from(userBooks)
    .innerJoin(books, eq(userBooks.bookId, books.id))
    .$dynamic();

  const conditions = [eq(userBooks.userId, filters.userId)];

  if (filters.wishlist) {
    conditions.push(eq(userBooks.wishlist, true));
  } else if (filters.status) {
    conditions.push(eq(userBooks.status, filters.status as any));
  }
  if (filters.search) conditions.push(
    sql`unaccent(lower(${books.title})) like unaccent(lower(${'%' + filters.search + '%'}))`
  );

  return query.where(and(...conditions));
}

export async function getBookWithDetails(bookId: string, userId: string) {
  const [book] = await db.select().from(books).where(eq(books.id, bookId));
  if (!book) return null;

  const bookAuthorRows = await db
    .select({ author: authors })
    .from(bookAuthors)
    .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(eq(bookAuthors.bookId, bookId));

  const [userBook] = await db.select().from(userBooks)
    .where(and(eq(userBooks.bookId, bookId), eq(userBooks.userId, userId)));

  const bookTagRows = await db
    .select({ tag: tags })
    .from(bookTags)
    .innerJoin(tags, eq(bookTags.tagId, tags.id))
    .where(eq(bookTags.bookId, bookId));

  return {
    book,
    authors: bookAuthorRows.map((r) => r.author),
    userBook: userBook ?? null,
    tags: bookTagRows.map((r) => r.tag),
  };
}

export async function upsertBookFromOL(data: {
  isbn?: string;
  openLibraryId: string;
  title: string;
  originalLanguage?: string;
  coverUrl?: string;
  pages?: number;
  yearPublished?: number;
  genres?: string[];
  isSaga?: boolean;
  sagaName?: string;
  sagaOrder?: number;
}) {
  const [existing] = await db.select().from(books).where(eq(books.openLibraryId, data.openLibraryId));
  if (existing) return existing;

  const [book] = await db.insert(books).values(data).returning();
  return book;
}

export async function upsertAuthor(data: {
  openLibraryId?: string;
  name: string;
  nationality?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'unknown';
}) {
  if (data.openLibraryId) {
    const [existing] = await db.select().from(authors).where(eq(authors.openLibraryId, data.openLibraryId));
    if (existing) return existing;
  }
  const [author] = await db.insert(authors).values(data).returning();
  return author;
}

export async function addBookToLibrary(bookId: string, userId: string) {
  const [existing] = await db.select().from(userBooks).where(and(eq(userBooks.bookId, bookId), eq(userBooks.userId, userId)));
  if (existing) return existing;
  const [row] = await db.insert(userBooks).values({ bookId, userId, status: 'quiero_leer' }).returning();
  return row;
}

export async function updateUserBook(bookId: string, userId: string, data: Partial<{
  status: 'quiero_leer' | 'leyendo' | 'leido' | 'abandonado' | 'pausado' | 'releyendo' | 'releido';
  format: 'fisico' | 'digital' | 'audiolibro';
  wishlist: boolean;
  rating: number;
  readAt: string;
  notes: string;
}>) {
  const [row] = await db
    .update(userBooks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(userBooks.bookId, bookId), eq(userBooks.userId, userId)))
    .returning();
  return row;
}




export async function getStats(userId: string) {
  const byStatus = await db
    .select({ status: userBooks.status, count: sql<number>`count(*)::int` })
    .from(userBooks)
    .where(eq(userBooks.userId, userId))
    .groupBy(userBooks.status);

  const totalPages = await db
    .select({ total: sql<number>`coalesce(sum(${books.pages}), 0)::int` })
    .from(userBooks)
    .innerJoin(books, eq(userBooks.bookId, books.id))
    .where(and(eq(userBooks.status, 'leido'), eq(userBooks.userId, userId)));

  const byGender = await db
    .select({ gender: authors.gender, count: sql<number>`count(distinct ${authors.id})::int` })
    .from(authors)
    .groupBy(authors.gender);

  const byNationality = await db
    .select({ nationality: authors.nationality, count: sql<number>`count(distinct ${authors.id})::int` })
    .from(authors)
    .groupBy(authors.nationality)
    .orderBy(sql`count(distinct ${authors.id}) desc`)
    .limit(10);

  const byMonth = await db
    .select({
      month: sql<string>`to_char(${userBooks.readAt}, 'YYYY-MM')`,
      count: sql<number>`count(*)::int`,
    })
    .from(userBooks)
    .where(and(eq(userBooks.status, 'leido'), sql`${userBooks.readAt} is not null`, eq(userBooks.userId, userId)))
    .groupBy(sql`to_char(${userBooks.readAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${userBooks.readAt}, 'YYYY-MM') desc`)
    .limit(24);

  return { byStatus, totalPages: totalPages[0]?.total ?? 0, byGender, byNationality, byMonth };
}

export async function getUserProfile(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) return null;

  const followerCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followingId, user.id));

  const followingCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  const bookCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userBooks)
    .where(eq(userBooks.userId, user.id));

  return {
    user,
    followers: followerCount[0]?.count ?? 0,
    following: followingCount[0]?.count ?? 0,
    books: bookCount[0]?.count ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string) {
  const [row] = await db.select().from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  return !!row;
}

export async function toggleFollow(followerId: string, followingId: string) {
  const already = await isFollowing(followerId, followingId);
  if (already) {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  } else {
    await db.insert(follows).values({ followerId, followingId });
  }
  return !already;
}

export async function getAllUsers(excludeId?: string) {
  const all = await db.select({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    bio: users.bio,
    bookCount: sql<number>`count(${userBooks.id})::int`,
  })
  .from(users)
  .leftJoin(userBooks, eq(users.id, userBooks.userId))
  .groupBy(users.id)
  .orderBy(sql`count(${userBooks.id}) desc`);

  return excludeId ? all.filter(u => u.id !== excludeId) : all;
}
