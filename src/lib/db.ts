import { Pool } from 'pg';

// A documentação do Vercel Postgres sugere que podemos instanciar o pool diretamente.
// As variáveis de ambiente (POSTGRES_URL etc.) são injetadas automaticamente no ambiente de produção.

// Para desenvolvimento local, você precisará de um arquivo .env.local com a sua connection string
// ex: POSTGRES_URL="postgresql://user:password@host:port/database"

if (!process.env.POSTGRES_URL) {
  throw new Error('A variável de ambiente POSTGRES_URL não está definida.');
}

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // Forçar SSL, que é necessário para a maioria dos provedores de DB em nuvem
  ssl: {
    rejectUnauthorized: false,
  },
});

// Opcional: listeners para depuração
pool.on('connect', () => {
  console.log('Base de dados conectada com sucesso.');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente da base de dados', err);
  process.exit(-1);
}); 