import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, isUserAdmin } from '@/lib/auth-utils';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o usuário é administrador
    const isAdmin = await isUserAdmin(decoded.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar configurações.' }, { status: 403 });
    }

    // Buscar configurações
    const result = await pool.query('SELECT auto_backup_enabled FROM settings WHERE id = 1');
    
    if (result.rows.length === 0) {
      // Criar registro padrão se não existir
      await pool.query('INSERT INTO settings (id, auto_backup_enabled) VALUES (1, false)');
      return NextResponse.json({ auto_backup_enabled: false });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o usuário é administrador
    const isAdmin = await isUserAdmin(decoded.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem modificar configurações.' }, { status: 403 });
    }

    const body = await request.json();
    const { auto_backup_enabled } = body;

    // Atualizar configurações
    await pool.query(
      'UPDATE settings SET auto_backup_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [auto_backup_enabled]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 