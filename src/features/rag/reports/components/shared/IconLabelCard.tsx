"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface IconLabelCardProps {
  icon: ReactNode;
  label: string;
  variant?: "default" | "primary" | "muted";
}

export const IconLabelCard = ({
  icon,
  label,
  variant = "default",
}: IconLabelCardProps) => {
  const iconWrapperClasses = {
    default: "bg-primary text-primary-foreground",
    primary: "bg-primary text-primary-foreground",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-card rounded-lg p-4 border border-border text-center report-shadow"
    >
      <div
        className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 ${iconWrapperClasses[variant]}`}
      >
        {icon}
      </div>
      <p className="text-sm font-body font-medium text-foreground">{label}</p>
    </motion.div>
  );
};
