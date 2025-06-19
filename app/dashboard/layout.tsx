"use client"
import React, { useEffect, useState } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

function hasBreadcrumb(node: React.ReactNode): boolean {
  return React.Children.toArray(node).some((child) => {
    if (React.isValidElement(child)) {
      if (child.props && (child.props as { 'data-slot'?: string })['data-slot'] === 'breadcrumb') {
        return true;
      }
      if (child.props && (child.props as { children?: React.ReactNode }).children) {
        return hasBreadcrumb((child.props as { children?: React.ReactNode }).children);
      }
    }
    return false;
  });
}

// Função para mapear rotas para nomes amigáveis
function getBreadcrumbItems(pathname: string) {
  // Remove query params/hash
  const cleanPath = pathname.split(/[?#]/)[0]
  // Divide em partes
  const parts = cleanPath.split("/").filter(Boolean)
  // Mapeamento de nomes
  const nameMap: Record<string, string> = {
    dashboard: "Dashboard",
    profile: "Perfil",
    usuarios: "Usuários",
    relatorios: "Relatórios",
    documentos: "Documentos",
    inicio: "Início",
    // Adicione outros conforme necessário
  }
  // Monta os itens do breadcrumb
  const items = parts.map((part, idx) => {
    const href = "/" + parts.slice(0, idx + 1).join("/")
    return {
      label: nameMap[part] || part.charAt(0).toUpperCase() + part.slice(1),
      href,
      isLast: idx === parts.length - 1,
    }
  })
  return items
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [dbStatus, setDbStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const pathname = usePathname();
  const customBreadcrumb = hasBreadcrumb(children);
  const breadcrumbItems = getBreadcrumbItems(pathname)

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/db-status");
        if (res.ok) setDbStatus('ok');
        else setDbStatus('error');
      } catch {
        setDbStatus('error');
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {!customBreadcrumb && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, idx) => {
                    // Se só existe um item, ele deve ser BreadcrumbPage
                    if (breadcrumbItems.length === 1) {
                      return (
                        <BreadcrumbItem key={item.href}>
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                      )
                    }
                    // Se for o último, BreadcrumbPage
                    if (item.isLast) {
                      return (
                        <BreadcrumbItem key={item.href}>
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                      )
                    }
                    // Se não for o último, BreadcrumbLink
                    return (
                      <React.Fragment key={item.href}>
                        <BreadcrumbItem className={idx === 0 ? "hidden md:block" : undefined}>
                          <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className={idx === 0 ? "hidden md:block" : undefined} />
                      </React.Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
      {/* Barra inferior fixa estilo VSCode */}
      <div className="fixed bottom-0 left-0 w-full h-6 bg-card flex items-center justify-between px-4 text-[11px] z-30 shadow-inner border-t border-border">
        <span className="text-foreground font-mono font-normal">Sessão: <span className="font-semibold">Conectado</span></span>
        <span className="flex items-center gap-2">
          <span
            className={
              dbStatus === 'loading'
                ? 'inline-block w-2.5 h-2.5 rounded-full bg-muted'
                : dbStatus === 'ok'
                ? 'inline-block w-2.5 h-2.5 rounded-full bg-green-500'
                : 'inline-block w-2.5 h-2.5 rounded-full bg-red-500'
            }
            title={
              dbStatus === 'loading'
                ? 'Verificando conexão...'
                : dbStatus === 'ok'
                ? 'Banco de dados: OK'
                : 'Banco de dados: Indisponível'
            }
          />
        </span>
      </div>
    </SidebarProvider>
  )
}
