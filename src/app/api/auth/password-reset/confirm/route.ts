import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { PasswordChangedEmail } from '@/components/emails/password-changed-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'nao-responda@luizfilipeschaeffer.dev';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    // Encontrar usuário pelo token e verificar se não expirou
    const userResult = await pool.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_token_expires > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Token inválido ou expirado. Por favor, solicite um novo link de redefinição.' }, { status: 400 });
    }

    const user = userResult.rows[0];

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar a senha e limpar os campos de token
    await pool.query(
      `UPDATE users SET 
        password_hash = $1, 
        password_reset_token = NULL,
        password_reset_token_expires = NULL,
        updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    // Enviar e-mail de notificação
    try {
      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: 'Sua senha foi alterada',
        react: PasswordChangedEmail({ userNickname: user.nickname }),
      });
    } catch (emailError) {
      console.error('Falha ao enviar e-mail de notificação de alteração de senha:', emailError);
      // Não bloqueia a resposta principal, mas registra o erro.
    }

    return NextResponse.json({ message: 'Sua senha foi redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro ao confirmar a redefinição de senha:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
} 