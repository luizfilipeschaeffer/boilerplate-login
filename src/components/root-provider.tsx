"use client"

import React from "react"
import { Providers } from "@/app/providers"

export function RootProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      {children}
    </Providers>
  )
} 