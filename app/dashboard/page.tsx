import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  // Verifica autenticação no lado do servidor
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  // Buscar total de usuários da API
  let totalUsuarios = 0;
  try {
    const res = await fetch("http://localhost:5000/api/users");
    if (res.ok) {
      const data = await res.json();
      totalUsuarios = data.length;
    }
  } catch {}

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
