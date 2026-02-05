import { motion } from "framer-motion";

interface TagCloudProps {
  tags: string[];
  variant?: "default" | "gold" | "outline";
}

export const TagCloud = ({ tags, variant = "default" }: TagCloudProps) => {
  const variantClasses = {
    default: "bg-secondary text-secondary-foreground",
    gold: "bg-accent/10 text-accent border border-accent/20",
    outline: "bg-transparent border border-border text-foreground",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.03 }}
          className={`px-3 py-1.5 rounded-md text-xs font-body font-medium ${variantClasses[variant]}`}
        >
          {tag}
        </motion.span>
      ))}
    </div>
  );
};
