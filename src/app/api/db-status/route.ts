import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    client.release();
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Erro de conexão com o banco de dados:', error);
    return NextResponse.json({ status: 'error', message: 'Não foi possível conectar ao banco de dados.' }, { status: 500 });
  }
} 