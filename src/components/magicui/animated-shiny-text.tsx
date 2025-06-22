"use client";

import { cn } from "@/lib/utils";
import React, { CSSProperties } from "react";

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
  textClassName?: string;
}

const AnimatedShinyText = ({
  children,
  className,
  shimmerWidth = 100,
  textClassName,
}: AnimatedShinyTextProps) => {
  return (
    <p
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md",
        "animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-neutral-600 via-black/80 to-neutral-600",
        "dark:bg-gradient-to-r dark:from-purple-500 dark:via-white/80 dark:to-purple-500",
        className,
        textClassName || "text-neutral-600/50",
      )}
    >
      {children}
    </p>
  );
};

export default AnimatedShinyText; 