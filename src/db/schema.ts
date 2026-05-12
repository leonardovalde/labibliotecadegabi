import { pgTable, uuid, varchar, text, integer, boolean, smallint, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const readingStatusEnum = pgEnum('reading_status', ['quiero_leer', 'leyendo', 'leido', 'abandonado', 'pausado', 'releyendo', 'releido']);
export const authorGenderEnum = pgEnum('author_gender', ['male', 'female', 'non_binary', 'unknown']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  passwordB64: varchar('password_b64', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  token: varchar('token', { length: 64 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
});

export const follows = pgTable('follows', {
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  openLibraryId: varchar('open_library_id', { length: 50 }),
  name: varchar('name', { length: 255 }).notNull(),
  nationality: varchar('nationality', { length: 100 }),
  gender: authorGenderEnum('gender').default('unknown'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  isbn: varchar('isbn', { length: 13 }),
  openLibraryId: varchar('open_library_id', { length: 50 }),
  googleBooksId: varchar('google_books_id', { length: 50 }),
  title: varchar('title', { length: 500 }).notNull(),
  originalLanguage: varchar('original_language', { length: 50 }),
  coverUrl: text('cover_url'),
  pages: integer('pages'),
  yearPublished: integer('year_published'),
  genres: varchar('genres', { length: 100 }).array(),
  isSaga: boolean('is_saga').default(false),
  sagaName: varchar('saga_name', { length: 255 }),
  sagaOrder: integer('saga_order'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookAuthors = pgTable('book_authors', {
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
});

export const userBooks = pgTable('user_books', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  status: readingStatusEnum('status').default('quiero_leer'),
  wishlist: boolean('wishlist').default(false),
  rating: smallint('rating'),
  readAt: date('read_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const collectionBooks = pgTable('collection_books', {
  collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
});

export const bookTags = pgTable('book_tags', {
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});
