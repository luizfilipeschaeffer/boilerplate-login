import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../src/lib/db';

async function setUserAsAdmin(email: string) {
  try {
    // Verificar se o usuário existe
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.error(`Usuário com email ${email} não encontrado.`);
      return;
    }

    // Atualizar o usuário para admin
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
    
    console.log(`Usuário ${email} definido como administrador com sucesso!`);
    
  } catch (error) {
    console.error('Erro ao definir usuário como admin:', error);
  } finally {
    await pool.end();
  }
}

// Verificar se o email foi fornecido como argumento
const email = process.argv[2];
if (!email) {
  console.error('Uso: pnpm run set-admin <email>');
  console.error('Exemplo: pnpm run set-admin admin@exemplo.com');
  process.exit(1);
}

setUserAsAdmin(email); 