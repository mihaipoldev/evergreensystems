"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const OutcomesSection = () => {
  return (
    <section id="outcomes" className="section-spacing">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center md:mb-10 mb-6"
          {...fadeInUp}
        >
          <h2 className="heading-md md:heading-lg mb-4">
            Get Consistent, Qualified Sales Calls
          </h2>
          <p className="heading-sm text-muted-foreground font-normal">
            At least 10 qualified sales calls within 30 days of the system going live
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div 
          className="md:space-y-4 space-y-2 md:mb-10 mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            "Without spending tens of thousands on ads",
            "Without paying bloated retainers for \"leads\" that go nowhere",
            "Without managing tools, inboxes, follow-ups, or infrastructure",
          ].map((benefit, index) => (
            <motion.div 
              key={index} 
              className="md:p-5 p-3 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="body-md font-medium text-foreground">{benefit}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Core Value Prop */}
        <motion.div 
          className="md:mb-10 mb-6"
          {...fadeInUp}
        >
          <p className="md:body-lg body-md text-center font-medium text-foreground">
            We build and run the entire outbound system for you — end-to-end.
          </p>
          <p className="md:body-md body-sm text-center mt-3">
            You only show up to qualified calls booked directly on your calendar.
          </p>
        </motion.div>

        {/* Qualifier */}
        <motion.div 
          className="bg-muted/50 rounded-lg md:p-5 p-3 border border-border/50"
          {...fadeInUp}
        >
          <p className="body-sm text-center text-foreground/80">
            <span className="font-medium text-foreground">ℹ️ Only continue if you're a B2B founder or decision-maker</span> with a clear offer and the ability to handle new sales conversations. This is not for experiments, short-term spikes, or "growth hacks." <br />This is for founders who want a <span className="font-medium text-foreground">repeatable, system-driven acquisition channel.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default OutcomesSection;
