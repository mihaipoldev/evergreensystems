"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faComment, 
  faArrowRight 
} from "@fortawesome/free-solid-svg-icons";

interface Objection {
  objection?: string;
  positioning?: string;
  text?: string;
  response?: string;
  rationale?: string;
}

interface ObjectionHandlerProps {
  objections: (Objection | string)[];
}

export const ObjectionHandler = ({ objections }: ObjectionHandlerProps) => {
  if (!objections || objections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-body">
        No objection handling strategies available
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {objections.map((item, index) => {
        // Handle both object format and string format
        const objection = typeof item === "string" ? item : (item.objection || item.text || "");
        const positioning = typeof item === "string" ? "" : (item.positioning || item.response || item.rationale || "");
        
        return (
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
              <FontAwesomeIcon icon={faComment} className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                  Objection
                </span>
                <p className="text-sm font-body font-medium text-foreground italic">
                  "{objection}"
                </p>
              </div>
            </div>
          </div>

          {/* Response */}
          {positioning && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                    Strategic Response
                  </span>
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {positioning}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        );
      })}
    </div>
  );
};

