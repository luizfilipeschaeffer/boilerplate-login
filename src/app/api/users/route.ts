import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { headers, cookies } from 'next/headers';
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
    if (!currentUserId) {
      return NextResponse.json({ message: 'Sessão inválida ou usuário não encontrado.' }, { status: 401 });
    }
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "Nenhum ID de usuário fornecido." }, { status: 400 });
    }

    const isDeletingSelf = ids.length === 1 && ids[0] === currentUserId;
    const canDeleteOthers = process.env.CAN_DELETE_OTHER_USERS === 'true';

    if (!isDeletingSelf && !canDeleteOthers) {
      console.log(`Tentativa de exclusão não autorizada pelo usuário ${currentUserId} para os usuários ${ids.join(', ')}.`);
      return NextResponse.json({ message: "Você não tem permissão para excluir outros usuários." }, { status: 403 });
    }
    
    if (!isDeletingSelf) {
      const otherUsersToDelete = ids.filter(id => id !== currentUserId);
      if(otherUsersToDelete.length > 0 && !canDeleteOthers){
        console.log(`Tentativa de exclusão não autorizada pelo usuário ${currentUserId} para os usuários ${otherUsersToDelete.join(', ')}.`);
        return NextResponse.json({ message: "Você não tem permissão para excluir outros usuários." }, { status: 403 });
      }
    }
    
    const deleteResult = await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [ids]);

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ message: "Nenhum usuário encontrado com os IDs fornecidos." }, { status: 404 });
    }

    const response = isDeletingSelf 
      ? NextResponse.json({ message: "Sua conta foi removida com sucesso." })
      : NextResponse.json({ message: `${deleteResult.rowCount} usuário(s) removido(s) com sucesso.` });

    if (isDeletingSelf) {
      // Limpa os cookies de autenticação na resposta
      response.cookies.delete('session_token');
      response.cookies.delete('user_id');
    }

    return response;

  } catch (error) {
    console.error("Erro ao remover usuários:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
} 