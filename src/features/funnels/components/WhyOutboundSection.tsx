"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const WhyOutboundSection = () => {
  return (
    <section id="why-outbound" className="section-spacing md:px-0 px-3">
      <div className="max-w-5xl mx-auto">
        
        {/* Main Card Container */}
        <motion.div 
          className="bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl border border-border/50 p-8 md:p-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          
          {/* Why Outbound Works */}
          <div className="mb-16">
            <motion.h2 
              className="heading-lg mb-6 hero-align"
              {...fadeInUp}
            >
              Why Cold Outreach Still Works (When Done Right)
            </motion.h2>

            <motion.p 
              className="body-md mb-8 hero-align"
              {...fadeInUp}
            >
              There are three ways to acquire clients:
            </motion.p>

            <motion.div 
              className="grid md:grid-cols-3 gap-4 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.1 }}
            >
              {["Content Marketing", "Advertising", "Outbound Marketing"].map((method, index) => (
                <motion.div
                  key={index}
                  className={`p-5 rounded-xl text-center font-semibold border-2 transition-all ${
                    index === 2
                      ? "text-primary border-primary bg-primary/5 shadow-sm"
                      : "text-foreground border-border bg-background/50"
                  }`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {method}
                </motion.div>
              ))}
            </motion.div>

            <motion.p 
              className="body-md mb-6 hero-align"
              {...fadeInUp}
            >
              Most companies rely on the first two — and pay heavily for it.
            </motion.p>

            <motion.p 
              className="body-md mb-6 hero-align"
              {...fadeInUp}
            >
              You're only initiating conversations directly with <b>CEO's, Founders, Presidents, C-Suite, and Decision Makers.</b>
            </motion.p>

            <motion.p 
              className="body-lg text-foreground font-semibold hero-align"
              {...fadeInUp}
            >
              At the <b>exact companies you want</b>, with the <b>exact buyer context you need</b>.
            </motion.p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 mb-16"></div>

          {/* The Problem with Traditional Lead Gen */}
          <div>
            <motion.h2 
              className="heading-lg mb-6 hero-align"
              {...fadeInUp}
            >
              Why Traditional Lead Lists Fail in Real Sales Conversations
            </motion.h2>

            <motion.p 
              className="body-md mb-6 hero-align"
              {...fadeInUp}
            >
              Most "lead gen" looks like this:
            </motion.p>

            <motion.ul 
              className="space-y-3 mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.1 }}
            >
              {[
                "A list of emails",
                "Minimal context",
                "Generic personalization",
                "Low reply quality",
                "Endless back-and-forth before a real conversation",
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  className="body-md flex items-start hero-align-bullet gap-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-destructive font-bold text-sm">✗</span>
                  </span>
                  <span className="pt-0.5">{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Key Message */}
            <motion.div 
              className="mb-10 p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/20"
              {...fadeInUp}
            >
              <p className="body-lg hero-align text-foreground font-semibold text-center">
                You don't need more leads.
                <br />
                You need <span className="text-primary">better-informed leads</span>.
              </p>
            </motion.div>

            {/* Comparison Cards */}
            <motion.div 
              className="grid md:grid-cols-2 gap-4 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.15 }}
            >
              <motion.div 
                className="p-6 rounded-lg bg-destructive/5 border border-destructive/20"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-destructive font-bold text-sm">✗</span>
                  </div>
                  <p className="text-sm font-semibold">The Old Way</p>
                </div>
                <p className="body-sm text-foreground/80">
                  Here are 5,000 emails. Good luck closing.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-lg bg-primary/5 border border-primary/20"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <p className="text-sm font-semibold">The Evergreen Way</p>
                </div>
                <p className="body-sm text-foreground/80">
                  Here are <b>enriched prospects</b>, with the exact data points needed to start real conversations.
                </p>
              </motion.div>
            </motion.div>

            <motion.p 
              className="body-lg hero-align font-semibold text-foreground text-center"
              {...fadeInUp}
            >
              This is the core difference.<br />
              <b>Enriched leads = more qualified conversations.</b>
            </motion.p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 mb-16 mt-16"></div>

          {/* How the System Works - Enrichment */}
          <div className="mb-16">
            <motion.h3 
              className="heading-lg mb-6"
              {...fadeInUp}
            >
              What "Enrichment" Actually Means
            </motion.h3>
            <motion.p 
              className="body-md mb-8 leading-relaxed"
              {...fadeInUp}
            >
              We do not just identify companies or collect email addresses. Every prospect is processed through an enrichment layer that adds <span className="font-semibold text-foreground">real, usable context</span> before any message is sent.
            </motion.p>
            
            <motion.div 
              className="grid md:grid-cols-2 gap-4 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.1 }}
            >
              {[
                "Role relevance & buying authority",
                "Company signals & positioning",
                "Publicly available data that supports personalization",
                "Context that allows emails to sound intentional, not automated",
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <span className="body-sm font-medium text-foreground pt-0.5">{item}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.p 
              className="body-lg text-foreground/80 text-center font-medium"
              {...fadeInUp}
            >
              This ensures outreach is based on <span className="font-semibold text-foreground">information</span>, not assumptions.
            </motion.p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 mb-16"></div>

          {/* Sending Infrastructure */}
          <div className="mb-8">
            <motion.h3 
              className="heading-lg mb-6"
              {...fadeInUp}
            >
              How Emails Are Sent Safely and at Scale
            </motion.h3>
            <motion.p 
              className="body-md mb-8 leading-relaxed"
              {...fadeInUp}
            >
              Enrichment alone is not enough if the sending setup is wrong. That is why the system is built with <span className="font-semibold text-foreground">controlled sending and inbox-safe infrastructure</span> from day one.
            </motion.p>
            
            <motion.ul 
              className="space-y-3 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.1 }}
            >
              {[
                "Outreach is sent from dedicated secondary domains, not your main domain",
                "Each domain uses a small number of inboxes to keep sending behavior natural",
                "Sending volume is intentionally limited per inbox to protect reputation",
                "Domains and inboxes are warmed properly before campaigns go live",
                "Campaigns are centrally managed so replies, follow-ups, and stops are handled correctly",
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  className="body-md flex items-start gap-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="pt-0.5">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.div 
              className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50"
              {...fadeInUp}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">ℹ</span>
                </div>
                <div className="flex-1">
                  <p className="body-sm font-semibold text-foreground mb-2">Why Warmup Matters</p>
                  <p className="body-sm text-foreground/80 leading-relaxed">
                    Inbox warmup exists because email providers do not trust new sending domains immediately. Sending too much volume too quickly from a new domain is one of the fastest ways to trigger spam filtering or permanently damage sender reputation.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Why This Matters - Enhanced */}
          <motion.div 
            className="relative"
            {...fadeInUp}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
            <div className="relative bg-primary/5 rounded-2xl p-8 md:p-10 border-2 border-primary/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Key Insight</span>
              </div>
              
              <h3 className="heading-md mb-6">Why This Matters</h3>
              
              <p className="body-md mb-6 text-foreground/90">
                Most outbound fails for one of two reasons:
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="body-md flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  <span>Messages lack context, so prospects ignore them</span>
                </li>
                <li className="body-md flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  <span>Infrastructure is mismanaged, so messages never reach the inbox</span>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-primary/20">
                <p className="body-lg font-semibold text-foreground">
                  This system solves both. Enrichment improves reply quality. Controlled sending protects deliverability.
                </p>
              </div>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
};

export default WhyOutboundSection;
