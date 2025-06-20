import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import crypto from 'crypto';
import { Resend } from 'resend';
import ResetPasswordEmail from '@/components/emails/reset-password-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'nao-responda@luizfilipeschaeffer.dev';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Medida de segurança: não revelar se o e-mail existe ou não no banco.
    // O fluxo continua como se o e-mail tivesse sido enviado.
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetTokenExpires = new Date(Date.now() + 3600000); // 1 hora de validade

      await pool.query(
        'UPDATE users SET password_reset_token = $1, password_reset_token_expires = $2 WHERE id = $3',
        [resetToken, passwordResetTokenExpires, user.id]
      );

      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: 'Redefinição de Senha para seu App',
        react: ResetPasswordEmail({ resetLink }),
      });
    }

    return NextResponse.json({ message: 'Se um usuário com este e-mail existir, um link de redefinição de senha foi enviado.' });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    // Não retornar o erro detalhado para o cliente por segurança
    return NextResponse.json({ message: 'Ocorreu um erro ao processar sua solicitação.' }, { status: 500 });
  }
} 