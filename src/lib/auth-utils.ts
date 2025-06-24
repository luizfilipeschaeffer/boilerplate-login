import { headers } from 'next/headers';
import { pool } from './db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getUserIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  return userId;
}

export async function verifyToken(token: string): Promise<{ id: string } | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string };
  } catch (error) {
    console.error("Erro ao verificar token (auth-utils):", error);
    return null;
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.role === 'admin';
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    return false;
  }
}

export async function getUsers() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log("getUsers: Token não encontrado");
      return [];
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log("getUsers: Token inválido");
      return [];
    }

    const result = await pool.query('SELECT id FROM users');
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar usuários (auth-utils):", error);
    return []; // Retorna um array vazio em caso de erro
  }
} 