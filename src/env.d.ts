// src/env.d.ts
/// <reference path="../.astro/types.d.ts" />

type UserRow = typeof import('./db/schema').users.$inferSelect;

declare namespace App {
  interface Locals {
    user: UserRow | null;
  }
}
