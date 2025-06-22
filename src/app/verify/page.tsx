"use client"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeLink } from "@/components/ui/home-link";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não fornecido.");
      return;
    }
    fetch(`/api/auth/verify?token=${token}`)
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

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/login");
    }
  }, [countdown, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <HomeLink isFormDirty={false} />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificação de Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && <div>Verificando...</div>}
          {status !== "loading" && (
            <>
              <div className={status === "success" ? "text-green-600" : "text-red-600"}>{message}</div>
              {status === "success" && (
                <div className="text-sm text-gray-500">
                  Redirecionando para a página de login em {countdown} segundos...
                </div>
              )}
              <Button className="mt-4 w-full" onClick={() => router.push("/login")}>Ir para o Login</Button>
            </>
          )}
        </CardContent>
      </Card>
      <ThemeToggleButton />
    </div>
  );
} 