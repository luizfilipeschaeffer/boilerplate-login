import dotenv from 'dotenv';
// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config();

import { pool } from './db';
import fs from 'fs/promises';
import path from 'path';

async function runMigrations() {
  const client = await pool.connect();
  try {
    // 1. Garante que a tabela de log de migrações exista
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    console.log('Arquivos de migração encontrados:', sqlFiles);

    // 2. Busca migrações já executadas
    const executedMigrationsResult = await client.query('SELECT file_name FROM migrations_log');
    const executedMigrations = executedMigrationsResult.rows.map(row => row.file_name);
    console.log('Migrações já executadas:', executedMigrations);

    for (const file of sqlFiles) {
      // 3. Pula se já foi executada
      if (executedMigrations.includes(file)) {
        console.log(`Migração ${file} já foi executada, pulando.`);
        continue;
      }

      console.log(`Executando migração: ${file}`);
      
      try {
        // 4. Executa cada migração em sua própria transação
        await client.query('BEGIN');
        const filePath = path.join(migrationsDir, file);
        const script = await fs.readFile(filePath, 'utf-8');
        await client.query(script);
        
        // 5. Registra a migração como executada
        await client.query('INSERT INTO migrations_log (file_name) VALUES ($1)', [file]);
        
        await client.query('COMMIT');
        console.log(`Migração ${file} concluída e registrada com sucesso.`);
      } catch (error) {
        await client.query('ROLLBACK');
        // Se o erro for de coluna/tabela que já existe, consideramos que a migração foi aplicada manualmente
        const dbError = error as { code?: string };
        if (dbError.code === '42701' || dbError.code === '42P07') { // 42701: duplicate column, 42P07: duplicate table
          console.warn(`AVISO: A migração ${file} falhou porque o objeto já existe. Isso pode ter acontecido por uma aplicação manual. Registrando como executada para prosseguir.`);
          // Registra para não tentar novamente
          await client.query('INSERT INTO migrations_log (file_name) VALUES ($1) ON CONFLICT (file_name) DO NOTHING', [file]);
        } else {
          // Para todos os outros erros, falha e interrompe o processo.
          console.error(`Erro ao executar a migração ${file}, revertendo alterações:`, error);
          throw error;
        }
      }
    }

    console.log('Processo de migração concluído com sucesso.');

  } catch (criticalError) {
    console.error('Falha crítica durante o processo de migração. Nenhuma outra migração será executada.', criticalError);
    // Não precisa de throw, pois o processo será encerrado
  } finally {
    client.release();
    // Encerra o pool para que o script não fique pendurado
    await pool.end();
  }
}

runMigrations().catch(() => {
  // O erro já foi logado dentro da função runMigrations.
  // Apenas garantimos que o processo seja encerrado se houver erro não capturado.
  process.exit(1);
}); 