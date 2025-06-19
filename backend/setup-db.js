import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('Attempting to connect with DATABASE_URL:', process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    const client = await pool.connect();
    // Executa o init.sql primeiro (criação base)
    const initSql = fs.readFileSync(path.join('./sql/init.sql')).toString();
    await client.query(initSql);
    // Executa todas as migrations (exceto init.sql)
    const migrationsDir = './sql';
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && f !== 'init.sql')
      .sort();
    for (const file of files) {
      const migrationSql = fs.readFileSync(path.join(migrationsDir, file)).toString();
      console.log(`Executando migration: ${file}`);
      await client.query(migrationSql);
    }
    console.log('Banco de dados configurado e migrations aplicadas com sucesso!');
    client.release();
  } catch (err) {
    console.error('Erro ao configurar o banco de dados:', err);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 