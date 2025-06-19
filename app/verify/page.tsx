"use client"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não fornecido.");
      return;
    }
    fetch(`${API_URL}/api/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Conta verificada com sucesso!");
        } else {
          setStatus("error");
          setMessage(data.message || "Erro ao verificar conta.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de conexão com o servidor.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificação de Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && <div>Verificando...</div>}
          {status !== "loading" && (
            <>
              <div className={status === "success" ? "text-green-600" : "text-red-600"}>{message}</div>
              <Button className="mt-4 w-full" onClick={() => router.push("/login")}>Ir para o Login</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 