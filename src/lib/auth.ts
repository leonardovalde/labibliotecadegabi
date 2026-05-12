import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';

export function encodePassword(password: string) {
  return Buffer.from(password).toString('base64');
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user ?? null;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await db.insert(sessions).values({ token, userId, expiresAt });
  return token;
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token));
  if (!row) return null;
  return row.user;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function register(username: string, password: string, displayName?: string) {
  const existing = await getUserByUsername(username);
  if (existing) return { error: 'El usuario ya existe' };
  const [user] = await db.insert(users).values({
    username,
    displayName: displayName || username,
    passwordB64: encodePassword(password),
  }).returning();
  return { user };
}

export async function login(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) return { error: 'Usuario no encontrado' };
  if (user.passwordB64 !== encodePassword(password)) return { error: 'Contraseña incorrecta' };
  const token = await createSession(user.id);
  return { token, user };
}
