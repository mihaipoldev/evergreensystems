import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowCardProps {
  icon: string;
  title: string;
  description: string;
  price: string;
  time: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * WorkflowCard - A bold, animated card component for selecting report workflows
 * Features gradient borders, hover effects, and smooth expand animations
 */
export function WorkflowCard({
  icon,
  title,
  description,
  price,
  time,
  isSelected,
  onSelect,
}: WorkflowCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isSelected ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 transition-all duration-300",
        "bg-card hover:border-primary/50",
        isSelected
          ? "border-primary ring-4 ring-primary/20"
          : "border-border hover:shadow-xl"
      )}
      style={{
        boxShadow: isSelected
          ? "0 12px 40px -8px hsla(262, 83%, 58%, 0.35)"
          : undefined,
      }}
    >
      {/* Price Badge - Top Right */}
      <div className="absolute -top-3 -right-3 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="gradient-bg-accent px-4 py-1.5 rounded-full shadow-lg"
        >
          <span className="text-sm font-bold text-accent-foreground">{price}</span>
        </motion.div>
      </div>

      <div className="p-6">
        {/* Icon */}
        <motion.div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4",
            "bg-gradient-to-br from-primary/10 to-secondary/10"
          )}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold font-display text-foreground mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Time Badge */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{time}</span>
        </div>

        {/* Select Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
            isSelected
              ? "gradient-bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          {isSelected ? "Selected" : "Select"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
