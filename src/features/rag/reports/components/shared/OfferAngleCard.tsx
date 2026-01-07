"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullseye, 
  faUsers, 
  faStar 
} from "@fortawesome/free-solid-svg-icons";

import type { ReportData } from "../../types";

interface OfferAngleCardProps {
  angle: ReportData["data"]["generic_offer_angles"][number];
  index: number;
}

export const OfferAngleCard = ({ angle, index }: OfferAngleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border report-shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body">
              Offer Angle {index + 1}
            </span>
          </div>
          {angle.confidence !== undefined && (
            <span className="text-xs text-primary-foreground/70 font-body">
              {(angle.confidence * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>
        <h3 className="text-xl font-display font-semibold text-primary-foreground">
          {angle.angle_name}
        </h3>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Target */}
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
              Who It Targets
            </span>
            <p className="text-sm font-body text-foreground">{angle.who_it_targets}</p>
          </div>
        </div>

        {/* Promise */}
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
              Core Promise
            </span>
            <p className="text-sm font-body text-foreground font-medium">
              {angle.core_promise}
            </p>
          </div>
        </div>

        {/* Why It Resonates */}
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
            Why This Resonates
          </span>
          <ul className="space-y-2">
            {angle.why_this_resonates.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Constraints */}
        {angle.constraints && angle.constraints.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
              Constraints
            </span>
            <ul className="space-y-2">
              {angle.constraints.map((constraint, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body text-amber-600 dark:text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2 flex-shrink-0" />
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

