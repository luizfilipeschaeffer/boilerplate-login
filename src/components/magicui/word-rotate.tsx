"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WordRotateProps {
  words: string[];
  className?: string;
  duration?: number;
}

export default function WordRotate({
  words,
  className,
  duration = 2500,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className="overflow-hidden py-2 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={words[index]}
          className={cn(className)}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {words[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 