"use client";

import { motion } from "framer-motion";

// Helper function to extract text from string or object
const getTagText = (tag: string | Record<string, any>): string => {
  if (typeof tag === "string") {
    return tag;
  }
  // If it's an object, try common property names
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

interface TagCloudProps {
  tags: (string | Record<string, any>)[];
  variant?: "default" | "gold" | "outline";
}

export const TagCloud = ({ tags, variant = "default" }: TagCloudProps) => {
  if (!tags || tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-body">
        No tags available
      </p>
    );
  }

  const variantClasses = {
    default: "bg-secondary text-secondary-foreground",
    gold: "bg-accent/10 text-accent border border-accent/20",
    outline: "bg-transparent border border-border text-foreground",
  };

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

