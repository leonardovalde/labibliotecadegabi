import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// NeonDB pooler requires prepare:false and explicit search_path via options
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  onnotice: () => {},
  connection: {
    options: '--search_path=public',
  },
});
export const db = drizzle(client, { schema });
