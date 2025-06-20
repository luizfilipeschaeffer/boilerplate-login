"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext<{
  theme: "light" | "dark"
  setTheme: (t: "light" | "dark") => void
}>({
  theme: "light",
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Detecta tema do sistema e localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "light" || saved === "dark") {
      setTheme(saved)
      document.documentElement.classList.toggle("dark", saved === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  // Atualiza classe do html e salva no localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 