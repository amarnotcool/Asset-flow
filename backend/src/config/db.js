import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isLocalConnection = (url) => !url || /localhost|127\.0\.0\.1|::1/.test(url);

const poolConfig = {};

if (connectionString) {
  poolConfig.connectionString = connectionString;

  if (!isLocalConnection(connectionString)) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    return true;
  } finally {
    client.release();
  }
};
