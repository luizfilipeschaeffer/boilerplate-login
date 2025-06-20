import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';
import { VerificationEmail } from '@/components/emails/verification-email';
// Lembre-se de instalar a dependência: pnpm add -D @types/bcryptjs

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'nao-responda@luizfilipeschaeffer.dev';

function validateInternationalPhone(phone: string) {
    const regex = /^\+[1-9]{1}[0-9]{0,2} \d{2} \d{4,5}-\d{4}$/;
    return regex.test(phone);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nickname, email, password, birth_date, gender, nome, sobrenome, telefone, email_recuperacao, cpf } = body;

    if (email_recuperacao && email_recuperacao === email) {
      return NextResponse.json({ message: 'O email de recuperação deve ser diferente do email principal.' }, { status: 400 });
    }
    if (telefone && !validateInternationalPhone(telefone)) {
      return NextResponse.json({ message: 'Telefone deve estar no formato internacional. Ex: +55 11 91234-5678' }, { status: 400 });
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return NextResponse.json({ message: 'Usuário com este e-mail já existe.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const birthDateToInsert = birth_date === "" ? null : birth_date;

    const verification_token = crypto.randomBytes(32).toString('hex');
    const verification_token_expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const newUserQuery = await pool.query(
      'INSERT INTO users(nickname, email, password_hash, birth_date, gender, nome, sobrenome, telefone, email_recuperacao, cpf, is_verified, verification_token, verification_token_expires) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, nickname, email',
      [nickname, email, hashedPassword, birthDateToInsert, gender, nome, sobrenome, telefone, email_recuperacao, cpf, false, verification_token, verification_token_expires]
    );

    const user = newUserQuery.rows[0];

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${verification_token}`;

    await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: 'Verifique sua conta',
        react: VerificationEmail({ userNickname: user.nickname, verificationLink }),
    });

    return NextResponse.json({ message: 'Usuário registrado com sucesso! Verifique seu e-mail para ativar a conta.', user }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
} 