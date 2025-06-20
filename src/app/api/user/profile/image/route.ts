import { NextRequest, NextResponse } from "next/server";
import { pool } from '@/lib/db';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
        }

        const result = await pool.query(
            'SELECT profile_image FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }

        const user = result.rows[0];

        // Se o usuário não tiver uma imagem de perfil, podemos retornar null ou um placeholder
        if (!user.profile_image) {
             return NextResponse.json({ imageUrl: null }, { status: 200 });
        }

        return NextResponse.json({ imageUrl: user.profile_image });

    } catch (error) {
        console.error('Erro ao buscar a imagem do perfil:', error);
        return NextResponse.json({ message: 'Erro interno do servidor ao buscar a imagem.' }, { status: 500 });
    }
}

// Esta rota agora salva a imagem em /public/avatars com o nome do nickname do usuário
export async function POST(request: NextRequest): Promise<NextResponse> {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
        return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }
    
    try {
        // 1. Pega o arquivo do form-data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'Nenhum arquivo enviado.' }, { status: 400 });
        }
        
        // 2. Busca o usuário para pegar nickname e imagem antiga
        const userResult = await pool.query('SELECT nickname, profile_image FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }
        const user = userResult.rows[0];
        const oldImageBuffer = user.profile_image;

        // 3. Deleta a imagem antiga se existir
        if (oldImageBuffer) {
            try {
                // Converte o buffer para string antes de usar
                const oldImagePath = oldImageBuffer.toString();
                const oldFilePath = path.join(process.cwd(), 'public', oldImagePath);
                await unlink(oldFilePath);
            } catch (error) {
                // Ignora o erro se o arquivo não existir, mas loga para outros casos
                console.warn(`Não foi possível deletar a imagem antiga: ${oldImageBuffer.toString()}`, error);
            }
        }
        
        // 4. Prepara o novo nome e caminho do arquivo
        const fileExtension = path.extname(file.name);
        const newFilename = `${user.nickname}${fileExtension}`;
        
        const uploadDir = path.join(process.cwd(), 'public', 'avatars');
        const newFilePath = path.join(uploadDir, newFilename);
        
        // 5. Salva o novo arquivo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(newFilePath, buffer);

        // 6. Atualiza o banco de dados com o novo caminho
        const newImageUrl = `/avatars/${newFilename}`;
        await pool.query(
            'UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2',
            [newImageUrl, userId]
        );

        return NextResponse.json({ 
            message: 'Foto do perfil atualizada com sucesso!', 
            imageUrl: newImageUrl
        });

    } catch (error) {
        console.error('Erro ao processar o upload da imagem:', error);
        return NextResponse.json({ message: 'Erro interno do servidor ao processar a imagem.' }, { status: 500 });
    }
}