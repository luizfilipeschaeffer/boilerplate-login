import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

async function getUserIdFromHeaders() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) {
    throw new Error('ID do usuário não encontrado nos headers.');
  }
  return userId;
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserIdFromHeaders();
    const { senha_atual, nova_senha } = await req.json();

    if (!senha_atual || !nova_senha) {
      return NextResponse.json({ message: 'Por favor, forneça a senha atual e a nova senha.' }, { status: 400 });
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(senha_atual, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'A senha atual está incorreta.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nova_senha, salt);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);

    return NextResponse.json({ message: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar a senha:', error);
    if (error instanceof Error && error.message.includes('ID do usuário')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
} 