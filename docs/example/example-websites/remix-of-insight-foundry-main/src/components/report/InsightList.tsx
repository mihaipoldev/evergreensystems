import { motion } from "framer-motion";
import { Check, AlertTriangle, Info, Target } from "lucide-react";

type InsightType = "success" | "warning" | "info" | "target";

interface InsightListProps {
  items: string[];
  type?: InsightType;
  numbered?: boolean;
}

const iconMap = {
  success: Check,
  warning: AlertTriangle,
  info: Info,
  target: Target,
};

const colorMap = {
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  target: "text-accent bg-accent/10 border-accent/20",
};

export const InsightList = ({
  items,
  type = "info",
  numbered = false,
}: InsightListProps) => {
  const Icon = iconMap[type];

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-start gap-3 p-3 rounded-md border ${colorMap[type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {numbered ? (
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </div>
          <span className="text-sm font-body leading-relaxed text-foreground">
            {item}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};
