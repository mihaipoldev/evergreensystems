"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faCalendar, 
  faUsers, 
  faPhone 
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";

const channelIcons: Record<string, any> = {
  cold_email: faEnvelope,
  linkedin: faLinkedin,
  events: faCalendar,
  partners: faUsers,
  cold_call: faPhone,
};

const channelLabels: Record<string, string> = {
  cold_email: "Cold Email",
  linkedin: "LinkedIn",
  events: "Events",
  partners: "Partners",
  cold_call: "Cold Call",
};

interface ChannelRankingProps {
  channels: (string | Record<string, any>)[];
}

// Helper function to extract channel value from string or object
const getChannelValue = (channel: string | Record<string, any>): string => {
  if (typeof channel === "string") {
    return channel;
  }
  // If it's an object, try common property names
  return (
    channel.name ||
    channel.channel ||
    channel.value ||
    channel.label ||
    JSON.stringify(channel)
  );
};

export const ChannelRanking = ({ channels }: ChannelRankingProps) => {
  if (!channels || channels.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-body">
        No channels available
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {channels.map((channel, index) => {
        const channelValue = getChannelValue(channel);
        const icon = channelIcons[channelValue] || faEnvelope;
        const label = channelLabels[channelValue] || channelValue;
        const width = 100 - index * 15;

        // Use index as key to ensure uniqueness, but also include channel value for debugging
        const uniqueKey = `${index}-${channelValue}`;

        return (
          <motion.div
            key={uniqueKey}
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
              <FontAwesomeIcon icon={icon} className="w-4 h-4 text-muted-foreground" />
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

