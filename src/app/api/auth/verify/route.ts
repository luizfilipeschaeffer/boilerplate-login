import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Token não fornecido.' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 400 });
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.verification_token_expires)) {
      // Opcional: aqui você poderia adicionar lógica para reenviar um novo token
      return NextResponse.json({ message: 'Token expirado.' }, { status: 400 });
    }

    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL, updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    return NextResponse.json({ message: 'Conta verificada com sucesso! Você pode fazer login agora.' });
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
} 