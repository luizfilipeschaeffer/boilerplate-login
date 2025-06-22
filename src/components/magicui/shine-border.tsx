"use client";

import { cn } from "@/lib/utils";
import React, { CSSProperties } from "react";

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string[];
  borderWidth?: number;
}

export default function ShineBorder({
  children,
  className,
  color = ["#A07CFE", "#FE8A71", "#FFD700"],
  borderWidth = 2,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--shine-color": color.join(", "),
          "--shine-border-width": `${borderWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "relative rounded-lg p-[--shine-border-width] before:absolute before:inset-0 before:rounded-lg before:bg-[conic-gradient(from_var(--shine-angle),_var(--shine-color),_var(--shine-color)_25%,_transparent_50%,_transparent)] before:[animation:shine_4s_linear_infinite] before:[background-size:200%_200%] before:[mask:linear-gradient(white,white)_content-box,linear-gradient(white,white)] before:[mask-composite:exclude]",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
} 