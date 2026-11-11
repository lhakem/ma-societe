/**
 * Authentification de l'espace admin.
 * Identifiants : secrets ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
 * (Cloudflare : Settings > Variables and Secrets ; en local : fichier .env).
 * Session = cookie HttpOnly signé (HMAC-SHA256). Changer le mot de passe déconnecte toutes les sessions.
 * La limitation des tentatives est stockée dans D1 (voir hitRateLimit dans db.ts).
 */
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET } from 'astro:env/server';

export const COOKIE = 'ms_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export const authConfigured = () =>
  Boolean(ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 10 && SESSION_SECRET && SESSION_SECRET.length >= 32);

const key = () => `${SESSION_SECRET}:${ADMIN_PASSWORD}`;
const sign = (payload: string) => createHmac('sha256', key()).update(payload).digest('base64url');
const safeEq = (a: string, b: string) =>
  timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

export function checkCredentials(email: string, password: string) {
  if (!authConfigured()) return false;
  const emailOk = !ADMIN_EMAIL || safeEq(email.trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const passOk = safeEq(password, ADMIN_PASSWORD!);
  return emailOk && passOk;
}

export function createSession(email: string) {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${Buffer.from(email).toString('base64url')}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string | undefined): { email: string } | null {
  if (!token || !authConfigured()) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [e, exp, sig] = parts;
  if (!safeEq(sig, sign(`${e}.${exp}`))) return null;
  if (!(Number(exp) > Date.now())) return null;
  return { email: Buffer.from(e, 'base64url').toString() };
}

export const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure,
  path: '/admin',
  maxAge: MAX_AGE,
});

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60_000;
export const LEAD_MAX_PER_HOUR = 10;
