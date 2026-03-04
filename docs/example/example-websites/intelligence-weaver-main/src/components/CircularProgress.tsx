import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * CircularProgress - Animated circular progress indicator
 * Features smooth animation and gradient stroke
 */
export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 12,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
            <stop offset="50%" stopColor="hsl(174, 72%, 46%)" />
            <stop offset="100%" stopColor="hsl(220, 90%, 56%)" />
          </linearGradient>
        </defs>

        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: "drop-shadow(0 0 10px hsla(262, 83%, 58%, 0.5))",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-5xl font-bold font-display gradient-text"
        >
          {percentage}%
        </motion.span>
        <span className="text-sm text-muted-foreground mt-1">Complete</span>
      </div>

      {/* Animated glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 20px hsla(262, 83%, 58%, 0.2)",
            "0 0 40px hsla(262, 83%, 58%, 0.4)",
            "0 0 20px hsla(262, 83%, 58%, 0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full pointer-events-none"
      />
    </div>
  );
}
