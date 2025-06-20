import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verificação de Conta",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 