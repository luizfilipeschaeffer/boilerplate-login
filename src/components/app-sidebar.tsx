"use client"

import React from "react"
import useSWR from "swr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Home, Users, User, LogOut, ChevronUp, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/app/providers"

const data = {
  user: {
    name: "João Silva",
    email: "joao@exemplo.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "Usuários",
          url: "/dashboard/users",
          icon: Users,
        },
      ],
    },
    {
      title: "Configurações",
      items: [
        {
          title: "Ajustes",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Tipos para navegação
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useSWR("/api/user/profile", fetcher, { refreshInterval: 0 });
  const router = useRouter();
  const user = React.useMemo(() => {
    if (!userData) return { name: "", email: "", avatar: "" };
    return {
      name: userData.nome ? `${userData.nome}${userData.sobrenome ? ' ' + userData.sobrenome : ''}` : userData.nickname || "Usuário",
      email: userData.email || "",
      avatar: userData.profile_image || "/placeholder.svg"
    };
  }, [userData]);
  const { theme, setTheme } = useTheme();

  function handleLogout() {
    if (typeof window !== 'undefined') {
      fetch('/api/logout', { method: 'POST' })
        .finally(() => {
          localStorage.removeItem("token");
          router.replace("/login");
        });
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="rounded-lg">{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Conta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {(data.navMain as NavGroup[]).map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {item.title === "Configurações" && (
                  <SidebarMenuItem key="theme-toggle">
                    <SidebarMenuButton
                      aria-label="Alternar tema"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="justify-start gap-2"
                    >
                      {theme === "dark" ? (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="5"/><path d="M10 1v2m0 14v2m9-9h-2M3 10H1m14.14 5.07l-1.41-1.41M5.34 5.34 3.93 3.93m12.02 0-1.41 1.41M5.34 14.66l-1.41 1.41"/></svg>
                      ) : (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 10.79A9 9 0 1 1 9.21 1 7 7 0 0 0 19 10.79z"/></svg>
                      )}
                      <span className="text-xs">Tema - {theme === "dark" ? "Noite" : "Dia"}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
