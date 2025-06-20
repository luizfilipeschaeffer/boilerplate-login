import { NextRequest, NextResponse } from "next/server";
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
// Lembre-se de instalar a dependência: pnpm add -D @types/jsonwebtoken

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 400 });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 400 });
    }

    if (!user.is_verified) {
      return NextResponse.json({ message: 'Conta não verificada. Por favor, verifique seu e-mail.' }, { status: 403 });
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('A variável de ambiente JWT_SECRET não está definida.');
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(secret);

    const userResponsePayload = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      nome: user.nome,
      sobrenome: user.sobrenome,
      profile_image: user.profile_image
    };

    const response = NextResponse.json({ message: 'Login bem-sucedido!', user: userResponsePayload });

    response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hora
    });

    return response;

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
} 