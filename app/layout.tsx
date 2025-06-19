"use client"
import React, { useEffect, useState, createContext, useContext } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const ThemeContext = createContext<{
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Detecta tema do sistema e localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  // Atualiza classe do html e salva no localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <html lang="pt-br" className={`${geistSans.variable} ${geistMono.variable} ${theme === "dark" ? "dark" : ""}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeContext.Provider value={{ theme, setTheme }}>
          {children}
        </ThemeContext.Provider>
      </body>
    </html>
  );
}
