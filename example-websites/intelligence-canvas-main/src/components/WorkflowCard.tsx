import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowCardProps {
  icon: string;
  title: string;
  description: string;
  price: string;
  time: string;
  isSelected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

export const WorkflowCard = ({
  icon,
  title,
  description,
  price,
  time,
  isSelected,
  onSelect,
  children,
}: WorkflowCardProps) => {
  return (
    <motion.div
      layout
      className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-card shadow-strong ring-2 ring-primary"
          : "bg-card/80 shadow-medium hover:shadow-strong hover:scale-[1.02]"
      }`}
      onClick={!isSelected ? onSelect : undefined}
      whileHover={!isSelected ? { y: -4 } : undefined}
    >
      {/* Price Badge */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 rounded-full text-sm font-semibold gradient-bg text-primary-foreground">
          {price}
        </span>
      </div>

      {/* Icon & Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className="text-xl font-bold font-display text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Time Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
          ⏱ {time}
        </span>
      </div>

      {/* Select Button or Expanded Content */}
      <AnimatePresence mode="wait">
        {!isSelected ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="outline"
              className="w-full group hover:gradient-bg hover:text-primary-foreground hover:border-transparent transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              Select
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkflowCard;
