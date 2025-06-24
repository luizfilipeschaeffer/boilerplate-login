import { NextResponse } from 'next/server';
import { writeFile, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const REQUIRED_ENVS = [
  'POSTGRES_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_BASE_URL',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const envPath = join(process.cwd(), '.env');
    let envContent = '';
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf-8');
    }
    // Atualiza ou adiciona as variáveis
    for (const [key, value] of Object.entries(body)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    // Remove linhas em branco duplicadas
    envContent = envContent.replace(/\n{2,}/g, '\n');
    await new Promise((resolve, reject) => {
      writeFile(envPath, envContent.trim() + '\n', err => err ? reject(err) : resolve(null));
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar .env' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Checagem para rota /api/env-setup/check
  if (req.url?.endsWith('/check')) {
    const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      return NextResponse.json({ missing }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
} 