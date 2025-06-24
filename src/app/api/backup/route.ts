import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, isUserAdmin } from '@/lib/auth-utils';
import { generateBackup } from '@/lib/backup/backup';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem executar backups.' }, { status: 403 });
    }

    // Gerar o backup
    const backupResult = await generateBackup();

    // Verificar se o backup foi gerado via SQL (produção) ou pg_dump (desenvolvimento)
    if (typeof backupResult === 'string') {
      // Backup gerado via SQL (produção)
      const backupContent = Buffer.from(backupResult, 'utf8');
      
      // Retornar o arquivo como download
      return new NextResponse(backupContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': 'attachment; filename="backup.sql"',
          'Content-Length': backupContent.length.toString(),
        },
      });
    } else {
      // Backup gerado via pg_dump (desenvolvimento)
      const isWindows = process.platform === 'win32';
      const backupFilePath = isWindows 
        ? path.resolve(process.cwd(), 'backup.sql')
        : path.resolve(process.cwd(), 'src/lib/backup/backup.sql');
      
      if (!fs.existsSync(backupFilePath)) {
        return NextResponse.json({ error: 'Erro ao gerar backup' }, { status: 500 });
      }

      const backupContent = fs.readFileSync(backupFilePath);

      // Retornar o arquivo como download
      return new NextResponse(backupContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': 'attachment; filename="backup.sql"',
        },
      });
    }

  } catch (error) {
    console.error('Erro no endpoint de backup:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 