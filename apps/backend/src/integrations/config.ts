import { Pool, type PoolClient } from 'pg';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));

export function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const user = encodeURIComponent(process.env.PGUSER || 'postgres');
  const pass = encodeURIComponent(process.env.PGPASSWORD || 'postgres');
  return `postgresql://${user}:${pass}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'cybersim'}`;
}
export const pool = new Pool({ connectionString: databaseUrl(), max: 8, connectionTimeoutMillis: 2000 });
export class ServiceError extends Error {
  constructor(public code: string, public status = 503, message = code) { super(message); }
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ServiceError('INVALID_OBJECT', 400);
  return value as Record<string, unknown>;
}
export function equalSecret(a: string, b: string): boolean {
  const x = Buffer.from(a); const y = Buffer.from(b);
  return !!a && !!b && x.length === y.length && timingSafeEqual(x, y);
}
export function fingerprint(value: unknown): string {
  const key = process.env.INTERNAL_SIGNING_KEY;
  if (!key) throw new ServiceError('SIGNING_KEY_MISSING');
  return createHmac('sha256', key).update(JSON.stringify(value)).digest('hex');
}
export async function locked<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='2s'");
    await client.query("SET LOCAL statement_timeout='5s'");
    await client.query('SELECT id FROM coordinacion_integracion WHERE id=1 FOR UPDATE');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function httpJson(url: string, init: RequestInit = {}, ms = 10000): Promise<unknown> {
  const response = await fetch(url, { ...init, signal: init.signal || AbortSignal.timeout(Math.max(1, ms)) });
  if (!response.ok) throw new ServiceError('UPSTREAM_' + response.status, response.status === 429 ? 429 : 502);
  return response.json();
}
export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new ServiceError('CONFIG_' + name);
  return value;
}

