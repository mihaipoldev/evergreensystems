import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";

interface Objection {
  objection: string;
  positioning: string;
}

interface ObjectionHandlerProps {
  objections: Objection[];
}

export const ObjectionHandler = ({ objections }: ObjectionHandlerProps) => {
  return (
    <div className="space-y-4">
      {objections.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-lg border border-border overflow-hidden report-shadow"
        >
          {/* Objection */}
          <div className="p-4 bg-muted/50 border-b border-border">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                  Objection
                </span>
                <p className="text-sm font-body font-medium text-foreground italic">
                  "{item.objection}"
                </p>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                  Strategic Response
                </span>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {item.positioning}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
