"use client";

import { motion } from "framer-motion";

// Helper function to extract text from string or object
const getTagText = (tag: string | Record<string, any>): string => {
  if (typeof tag === "string") {
    return tag;
  }
  return (
    tag.theme ||
    tag.label ||
    tag.name ||
    tag.value ||
    tag.text ||
    tag.rationale ||
    JSON.stringify(tag)
  );
};

export type TagCloudVariant = "default" | "accent" | "primary" | "green" | "warning" | "danger" | "outline";

interface TagCloudProps {
  tags: (string | Record<string, any>)[];
  variant?: TagCloudVariant;
}

const variantClasses: Record<TagCloudVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  accent: "bg-accent/10 text-accent border border-accent/20",
  primary: "bg-primary/10 text-primary border border-primary/20",
  green: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 dark:border-green-400/20",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 dark:border-yellow-400/20",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-400/20",
  outline: "bg-transparent border border-border text-foreground",
};

export const TagCloud = ({ tags, variant = "default" }: TagCloudProps) => {
  if (!tags || tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-body">
        No tags available
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => {
        const tagText = getTagText(tag);
        return (
          <motion.span
            key={`${index}-${tagText}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
            className={`px-3 py-1.5 rounded-md text-xs font-body font-medium ${variantClasses[variant]}`}
          >
            {tagText}
          </motion.span>
        );
      })}
    </div>
  );
};
