"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { HomeLink } from "@/components/ui/home-link"
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const isFormDirty = email !== "" || password !== "";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setProgress(10); // Inicia a barra de progresso
      timer = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : 90)); // Avança até 90%
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erro ao fazer login");
        return;
      }
      // Token já está salvo em cookie seguro pela API route
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <HomeLink isFormDirty={isFormDirty} />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">Digite suas credenciais para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            {loading && (
              <div className="pt-2">
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </form>
          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Registre-se
            </Link>
          </div>
        </CardContent>
      </Card>
      <ThemeToggleButton />
    </div>
  )
}
