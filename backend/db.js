import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para Render, mas considere segurança em produção
  },
});

pool.on('connect', () => {
  console.log('Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco de dados PostgreSQL', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export { pool }; 