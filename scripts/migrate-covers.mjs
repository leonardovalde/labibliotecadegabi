#!/usr/bin/env node
// Migrates all existing cover URLs to Cloudinary
// Run: node scripts/migrate-covers.mjs

import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import postgres from 'postgres';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function uploadSafe(url, publicId) {
  try {
    const result = await cloudinary.uploader.upload(url, {
      public_id: publicId,
      overwrite: false, // skip if already uploaded
      fetch_format: 'auto',
      quality: 'auto',
    });
    return result.secure_url;
  } catch (e) {
    console.error(`  ❌ failed: ${e.message}`);
    return null;
  }
}

// Migrate books.cover_url
const books = await sql`SELECT id, title, cover_url FROM public.books WHERE cover_url IS NOT NULL`;
console.log(`\nMigrating ${books.length} book covers...`);
for (const book of books) {
  if (book.cover_url.includes('cloudinary.com')) { console.log(`  ⏭ already on Cloudinary: ${book.title}`); continue; }
  process.stdout.write(`  📚 ${book.title.slice(0, 50)}... `);
  const newUrl = await uploadSafe(book.cover_url, `book-covers/${book.id}`);
  if (newUrl) {
    await sql`UPDATE public.books SET cover_url = ${newUrl} WHERE id = ${book.id}`;
    console.log('✅');
  }
}

// Migrate user_books.cover_url
const userBooks = await sql`SELECT id, book_id, user_id, cover_url FROM public.user_books WHERE cover_url IS NOT NULL`;
console.log(`\nMigrating ${userBooks.length} user cover overrides...`);
for (const ub of userBooks) {
  if (ub.cover_url.includes('cloudinary.com')) { console.log(`  ⏭ already on Cloudinary`); continue; }
  process.stdout.write(`  🖼 user_book ${ub.id.slice(0, 8)}... `);
  const newUrl = await uploadSafe(ub.cover_url, `book-covers/user_${ub.user_id}_${ub.book_id}`);
  if (newUrl) {
    await sql`UPDATE public.user_books SET cover_url = ${newUrl} WHERE id = ${ub.id}`;
    console.log('✅');
  }
}

await sql.end();
console.log('\n✅ Migration complete.');
