import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { headers } from 'next/headers';

async function getUserIdFromHeaders() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) {
    // Retorna null em vez de lançar erro para que a rota possa retornar um array vazio
    return null;
  }
  return userId;
}

export async function GET() {
  const userId = await getUserIdFromHeaders();

  if (!userId) {
    // Se não há usuário logado, não há notificações
    return NextResponse.json([]);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Busca as notificações não lidas para o usuário
    const notificationsResult = await client.query(
      'SELECT id, message, type, created_at FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at ASC',
      [userId]
    );

    const notifications = notificationsResult.rows;

    if (notifications.length > 0) {
      // 2. Extrai os IDs das notificações buscadas
      const notificationIds = notifications.map(n => n.id);

      // 3. Marca essas notificações como lidas
      await client.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ANY($1::int[])',
        [notificationIds]
      );
    }
    
    await client.query('COMMIT');
    
    // 4. Retorna as notificações que foram buscadas
    return NextResponse.json(notifications);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  } finally {
    client.release();
  }
} 