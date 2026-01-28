"use client";

import { memo } from 'react';
import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RichText } from '@/components/ui/RichText';
import { trackEvent } from '@/lib/analytics';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
};

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
} | null;

type FAQProps = {
  faqs?: FAQItem[];
  section?: Section;
  waveGradientEnabled?: boolean;
};

export const FAQ = memo(({ faqs = [], section, waveGradientEnabled = false }: FAQProps) => {
  // If no FAQs, don't render the section
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Use section title if available
  const title = section?.title || 'Frequently asked [[questions]]';

  // Track which FAQs were previously open to detect newly opened ones
  const prevOpenRef = React.useRef<Set<string>>(new Set());

  // Handle FAQ click tracking
  const handleFAQOpen = (values: string[]) => {
    console.log("Accordion onValueChange called with values:", values);
    
    // Convert current open values to a Set for easier comparison
    const currentOpen = new Set(values);
    
    // Find newly opened FAQs (ones that are in currentOpen but not in prevOpenRef)
    values.forEach((value) => {
      if (!prevOpenRef.current.has(value) && value && value.trim() !== '') {
        // Extract FAQ ID from value (format: "item-{id}")
        const faqId = value.replace('item-', '');
        console.log("Extracted FAQ ID:", faqId, "from value:", value);
        
        const faq = faqs.find((f) => f.id === faqId);
        
        if (faq) {
          console.log("Tracking FAQ click:", {
            faqId: faq.id,
            question: faq.question,
            entity_type: "faq_item",
            event_type: "link_click",
          });
          
          trackEvent({
            event_type: "link_click",
            entity_type: "faq_item",
            entity_id: faq.id,
            metadata: {
              question: faq.question,
              position: faq.position,
            },
          }).then(() => {
            console.log("FAQ click tracked successfully");
          }).catch((error) => {
            console.error("Error tracking FAQ click:", error);
          });
        } else {
          console.warn("FAQ not found for ID:", faqId, "Available FAQs:", faqs.map(f => f.id));
        }
      }
    });
    
    // Update the previous open ref
    prevOpenRef.current = currentOpen;
  };

  return (
    <section id="faq" className="py-12 md:py-20 relative">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center md:mb-16 mb-8"
        >
          {section?.eyebrow && (
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              {section.eyebrow}
            </span>
          )}
          <RichText
            as="h2"
            text={title}
            className="text-2xl md:text-5xl font-bold text-foreground mt-4 leading-tight"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion 
            type="multiple" 
            className="space-y-0" 
            onValueChange={handleFAQOpen as (value: string[]) => void}
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`item-${faq.id}`}
                className={`rounded-xl transition-all duration-100 ${
                  waveGradientEnabled 
                    ? 'border-none bg-gradient-to-br from-card/50 via-card/55 to-card/50 hover:border-primary/20 hover:from-card/60 hover:via-card/65 hover:to-card/60' 
                    : 'bg-card/80 border-none hover:border-primary/30'
                }`}
              >
                <AccordionTrigger className="text-left md:text-lg text-base text-foreground md:p-6 px-4 py-4 w-full [&>svg]:text-muted-foreground [&>svg:hover]:text-muted-foreground hover:no-underline transition-all cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="md:pb-6 pb-4 md:pt-0 pt-0 md:px-6 px-4 text-md">
                  <RichText
                    text={faq.answer}
                    as="div"
                    className="text-foreground/70 leading-relaxed"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
});

FAQ.displayName = 'FAQ';

