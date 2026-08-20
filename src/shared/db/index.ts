import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: mysql.Pool | undefined;
}

function getPool(): mysql.Pool {
  if (!global.__dbPool) {
    global.__dbPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'sd_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sd_cosmetique',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return global.__dbPool;
}

export const db = drizzle(getPool(), { schema, mode: 'default' });
export * from './schema';
