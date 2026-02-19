"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  status?: string;
  className?: string;
}

/**
 * CircularProgress - Animated circular progress indicator
 * Features smooth animation and gradient stroke (or red for failed)
 */
export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 12,
  status = "generating",
  className = "",
}: CircularProgressProps) {
  const gradientId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const isFailed = status === "failed";
  const isComplete = status === "complete";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Gradient definition - red for failed, primary for others */}
        <defs>
          {isFailed ? (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(0 72% 51%)" />
              <stop offset="50%" stopColor="hsl(0 72% 51% / 0.8)" />
              <stop offset="100%" stopColor="hsl(0 60% 45%)" />
            </linearGradient>
          ) : (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--primary) / 0.8)" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          )}
        </defs>

        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: isFailed 
              ? "drop-shadow(0 0 10px hsl(0 72% 51% / 0.5))" 
              : "drop-shadow(0 0 10px hsl(var(--primary) / 0.5))",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold inline-block"
          style={
            isFailed
              ? {
                  background: "linear-gradient(135deg, hsl(0 72% 51%), hsl(0 60% 45%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }
              : {
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }
          }
        >
          {percentage}%
        </motion.div>
        <span className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
          {isFailed ? "Failed" : isComplete ? "Complete" : "In Progress"}
        </span>
      </div>

      {/* Animated glow effect */}
      <motion.div
        animate={{
          boxShadow: isFailed
            ? [
                "0 0 20px hsl(0 72% 51% / 0.2)",
                "0 0 40px hsl(0 72% 51% / 0.4)",
                "0 0 20px hsl(0 72% 51% / 0.2)",
              ]
            : [
                "0 0 20px hsl(var(--primary) / 0.2)",
                "0 0 40px hsl(var(--primary) / 0.4)",
                "0 0 20px hsl(var(--primary) / 0.2)",
              ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full pointer-events-none"
      />
    </div>
  );
}

