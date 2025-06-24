import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Variáveis obrigatórias
const REQUIRED_ENVS = [
  'POSTGRES_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_BASE_URL',
];

function missingRequiredEnvs() {
  return REQUIRED_ENVS.filter((key) => !process.env[key]);
}

// Esta função pode ser exportada para uso em outros lugares se necessário
async function verifyToken(token: string): Promise<{ id: string } | null> {
  if (!token) return null;
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no middleware!');
      return null;
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string };
  } catch (error) {
    console.error('Erro na verificação do token (middleware):', error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const missing = missingRequiredEnvs();
  const { pathname } = req.nextUrl;

  // Ignorar rotas de assets, rotas internas do Next.js, favicon, robots.txt
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt')
  ) {
    return NextResponse.next();
  }

  // Redirecionar para /env-setup apenas se faltar variável e não estiver já na página de setup
  if (missing.length > 0 && pathname !== '/env-setup') {
    return NextResponse.redirect(new URL('/env-setup', req.url));
  }

  const token = req.cookies.get('auth_token')?.value;

  const isApiRoute = pathname.startsWith('/api');
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Se for uma rota de API protegida
  if (isApiRoute && (pathname.startsWith('/api/user') || pathname.startsWith('/api/users'))) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Token de autenticação não fornecido.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ message: 'Token inválido ou expirado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Adiciona o ID do usuário aos headers para as API Routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', decoded.id as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Se for uma página de frontend protegida (dashboard)
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('auth_token'); // Limpa cookie inválido
      return response;
    }
  }

  return NextResponse.next();
}

// Configuração do matcher para definir onde o middleware será executado
export const config = {
  matcher: ['/:path*'],
}; 