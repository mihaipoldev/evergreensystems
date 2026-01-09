import { motion } from "framer-motion";
import { Target, Users, Sparkles } from "lucide-react";

interface OfferAngle {
  angle_name: string;
  who_it_targets: string;
  core_promise: string;
  why_this_resonates: string[];
}

interface OfferAngleCardProps {
  angle: OfferAngle;
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
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body">
            Offer Angle {index + 1}
          </span>
        </div>
        <h3 className="text-xl font-display font-semibold text-primary-foreground">
          {angle.angle_name}
        </h3>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Target */}
        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
              Who It Targets
            </span>
            <p className="text-sm font-body text-foreground">{angle.who_it_targets}</p>
          </div>
        </div>

        {/* Promise */}
        <div className="flex items-start gap-3">
          <Target className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
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
      </div>
    </motion.div>
  );
};
