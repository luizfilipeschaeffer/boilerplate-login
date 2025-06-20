import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { headers } from 'next/headers';

async function getUserIdFromHeaders() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) {
    throw new Error('ID do usuário não encontrado nos headers.');
  }
  return userId;
}

// Rota para buscar perfil do usuário autenticado
export async function GET() {
  try {
    const userId = await getUserIdFromHeaders();
    
    const result = await pool.query(
      'SELECT id, nickname, nome, sobrenome, email, email_recuperacao, telefone, cpf, birth_date, gender, profile_image, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    if (error instanceof Error && error.message.includes('ID do usuário')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

function validateInternationalPhone(phone: string) {
    const regex = /^\+[1-9]{1}[0-9]{0,2} ?\(?\d{2}\)? ?\d{4,5}-?\d{4}$/;
    return regex.test(phone);
}

// Rota para atualizar perfil do usuário autenticado
export async function PUT(req: Request) {
  try {
    const userId = await getUserIdFromHeaders();
    const body = await req.json();
    const { nickname, nome, sobrenome, email_recuperacao, telefone, cpf, birth_date, gender, profile_image } = body;

    // Buscar email principal do usuário para validação
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
        return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }
    const mainEmail = userResult.rows[0].email;

    if (email_recuperacao && email_recuperacao === mainEmail) {
      return NextResponse.json({ message: 'O email de recuperação deve ser diferente do email principal.' }, { status: 400 });
    }
    if (telefone && !validateInternationalPhone(telefone)) {
      return NextResponse.json({ message: 'Telefone deve estar no formato internacional. Ex: +55 11 91234-5678' }, { status: 400 });
    }

    await pool.query(
      `UPDATE users SET
          nickname = $1, nome = $2, sobrenome = $3, email_recuperacao = $4,
          telefone = $5, cpf = $6, birth_date = $7, gender = $8,
          profile_image = $9, updated_at = NOW()
       WHERE id = $10`,
      [nickname, nome, sobrenome, email_recuperacao, telefone, cpf, birth_date, gender, profile_image || null, userId]
    );

    return NextResponse.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    if (error instanceof Error && error.message.includes('ID do usuário')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
} 