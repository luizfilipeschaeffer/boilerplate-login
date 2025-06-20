import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { headers } from 'next/headers';
import { getUserIdFromHeaders } from "@/lib/auth-utils";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    // O middleware já protege a rota, mas fazemos uma verificação extra.
    if (!userId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    // No futuro, poderíamos verificar se o userId é de um admin
    // const adminResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    // if (adminResult.rows[0]?.role !== 'admin') {
    //   return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    // }

    const result = await pool.query(
      'SELECT id, nickname, email, nome, sobrenome, created_at, is_verified FROM users ORDER BY created_at DESC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUserId = await getUserIdFromHeaders();
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "Nenhum ID de usuário fornecido." }, { status: 400 });
    }

    // Impede que o usuário logado se auto-delete
    if (ids.includes(currentUserId)) {
      return NextResponse.json({ message: "Você não pode excluir a si mesmo." }, { status: 403 });
    }

    // Usando ANY para deletar múltiplos IDs de forma eficiente
    const deleteResult = await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [ids]);

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ message: "Nenhum usuário encontrado com os IDs fornecidos." }, { status: 404 });
    }

    return NextResponse.json({ message: `${deleteResult.rowCount} usuário(s) removido(s) com sucesso.` });

  } catch (error) {
    console.error("Erro ao remover usuários:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
} 