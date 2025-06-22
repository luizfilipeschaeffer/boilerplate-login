"use client"

import { useEffect } from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  // Reseta o scroll no container ao navegar
  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [children]);


  return (
    <main className="h-full w-full bg-black overflow-y-auto rounded-lg scroll-container relative shadow-2xl z-20 sm:z-auto">
      {children}
    </main>
  )
} 