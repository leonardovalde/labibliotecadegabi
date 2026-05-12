CREATE TYPE "public"."book_format" AS ENUM('fisico', 'digital', 'audiolibro');--> statement-breakpoint
ALTER TABLE "user_books" ADD COLUMN "format" "book_format" DEFAULT 'fisico';