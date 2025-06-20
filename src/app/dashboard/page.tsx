import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getTotalUsers(token: string): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/users`, {
      headers: {
        'Cookie': `auth_token=${token}`
      },
      cache: 'no-store', // Garante que os dados sejam sempre frescos
    });

    if (!res.ok) {
      console.error("Falha ao buscar usuários na dashboard:", res.statusText);
      return 0;
    }

    const users = await res.json();
    return users.length || 0;
  } catch (error) {
    console.error("Erro de conexão ao buscar usuários:", error);
    return 0;
  }
}

export default async function DashboardPage() {
  // Verifica autenticação no lado do servidor
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    redirect("/login");
  }

  const totalUsuarios = await getTotalUsers(token);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
