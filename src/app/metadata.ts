import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "Boilerplate Login",
    template: "%s | Boilerplate Login",
  },
  description: "Sistema de autenticação e gerenciamento de usuários com Next.js e PostgreSQL",
  keywords: ["next.js", "react", "typescript", "postgresql", "autenticação", "login", "dashboard"],
  authors: [{ name: "Boilerplate Login Team" }],
  creator: "Boilerplate Login Team",
  publisher: "Boilerplate Login",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
}; 