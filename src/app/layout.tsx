"use client"

import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "@/components/ui/next-top-loader";
import { RootProvider } from "@/components/root-provider";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { cn } from "@/lib/utils"
import { usePathname } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Boilerplate de Autenticação",
  description: "Uma solução completa e pronta para uso para sistemas de autenticação, registro e gerenciamento de usuários.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable
        )}
      >
        <Suspense fallback={null}>
          <NextTopLoader />
        </Suspense>
        
        <RootProvider>
          {pathname.startsWith('/dashboard') ? (
            children
          ) : (
            <AuthLayout>{children}</AuthLayout>
          )}
          <Toaster />
        </RootProvider>
        
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}