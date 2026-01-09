import { motion } from "framer-motion";
import { Mail, Linkedin, Calendar, Users, Phone } from "lucide-react";

const channelIcons: Record<string, React.ElementType> = {
  cold_email: Mail,
  linkedin: Linkedin,
  events: Calendar,
  partners: Users,
  cold_call: Phone,
};

const channelLabels: Record<string, string> = {
  cold_email: "Cold Email",
  linkedin: "LinkedIn",
  events: "Events",
  partners: "Partners",
  cold_call: "Cold Call",
};

interface ChannelRankingProps {
  channels: string[];
}

export const ChannelRanking = ({ channels }: ChannelRankingProps) => {
  return (
    <div className="space-y-3">
      {channels.map((channel, index) => {
        const Icon = channelIcons[channel] || Mail;
        const label = channelLabels[channel] || channel;
        const width = 100 - index * 15;

        return (
          <motion.div
            key={channel}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-3 w-32 flex-shrink-0">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body font-medium text-foreground">
                {label}
              </span>
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${width}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="h-full bg-accent rounded-full"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
