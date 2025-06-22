"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setProgress(10);
      timer = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : 90));
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
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="text-gray-400">Digite suas credenciais para acessar sua conta</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-900/50 border-gray-700 text-white" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-400 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-900/50 border-gray-700 text-white" />
        </div>
        {error && <div className="text-red-500 text-sm text-center pt-2">{error}</div>}
        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        {loading && (
          <div className="pt-2">
            <Progress value={progress} className="w-full [&>div]:bg-blue-600" />
          </div>
        )}
      </form>
      <div className="text-center text-sm mt-6 text-gray-300">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-400 hover:underline">
          Registre-se
        </Link>
      </div>
    </div>
  )
}
