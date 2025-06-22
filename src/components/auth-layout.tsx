"use client"
import React from 'react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full p-2 sm:p-4 bg-[#2B2B2B] select-none">
      {children}
    </div>
  );
} 