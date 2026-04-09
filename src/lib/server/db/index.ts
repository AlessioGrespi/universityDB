import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL, {
	max: 5,
	idle_timeout: 10,
	max_lifetime: 60 * 2,
	connect_timeout: 10,
	prepare: false,
	connection: { application_name: 'universitydb' }
});

export const db = drizzle(client, { schema });
