import { Metadata } from "next";
import AuthBackground from "@/components/auth-background";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Login",
    description: "Acesse sua conta para continuar.",
};

export default function AuthLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black">
      <Button asChild variant="ghost" className="absolute top-8 left-8 z-20 h-12 w-12 rounded-full text-white hover:bg-white/10 hover:text-white">
        <Link href="/">
          <Home className="h-6 w-6" />
          <span className="sr-only">Voltar para a página inicial</span>
        </Link>
      </Button>
      <AuthBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}   