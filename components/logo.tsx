"use client";

import { motion } from "framer-motion";
import { Code2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <motion.div
      className={cn("flex items-center gap-2", className)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0, 0.71, 0.2, 1.01],
        scale: {
          type: "spring",
          damping: 5,
          stiffness: 100,
          restDelta: 0.001,
        },
      }}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/50",
          sizes[size]
        )}
      >
        <motion.div
          className="absolute"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Code2 className={cn("text-primary-foreground", sizes[size])} />
        </motion.div>
        <Terminal
          className={cn(
            "absolute opacity-0 text-primary-foreground transition-opacity",
            sizes[size],
            "group-hover:opacity-100"
          )}
        />
      </div>
      {showText && (
        <motion.span
          className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent",
            textSizes[size]
          )}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          DevConnect
        </motion.span>
      )}
    </motion.div>
  );
}
