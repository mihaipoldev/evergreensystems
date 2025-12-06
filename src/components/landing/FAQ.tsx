"use client";

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RichText } from '@/components/ui/RichText';

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
  content: any | null;
} | null;

type FAQProps = {
  faqs?: FAQItem[];
  section?: Section;
};

// Default hardcoded FAQs as fallback
const defaultFaqs = [
  {
    id: '1',
    question: 'How long does it take to implement an automation system?',
    answer: 'Most projects are completed within 2-4 weeks, depending on complexity. Simple automations can be live in as little as 5 days, while more complex AI systems may take 4-6 weeks for full deployment.',
    position: 0,
  },
  {
    id: '2',
    question: 'What kind of ROI can I expect?',
    answer: 'Our clients typically see 3-5x ROI within the first 90 days. This comes from time savings, increased lead quality, and improved conversion rates. We track and report on all key metrics throughout our engagement.',
    position: 1,
  },
  {
    id: '3',
    question: 'Do I need technical expertise to work with EvergreenLabs?',
    answer: 'Not at all. We handle all the technical implementation and provide comprehensive training. Our systems are designed to be user-friendly, and we offer ongoing support to ensure you get maximum value.',
    position: 2,
  },
  {
    id: '4',
    question: 'What tools and platforms do you integrate with?',
    answer: 'We integrate with 200+ tools including Salesforce, HubSpot, Slack, Notion, Google Workspace, Microsoft 365, and most major CRM, marketing, and productivity platforms.',
    position: 3,
  },
  {
    id: '5',
    question: 'What happens after the initial implementation?',
    answer: 'We provide ongoing optimization and support. This includes regular performance reviews, system updates, and strategic recommendations to help you scale. Many clients choose to expand their automation stack over time.',
    position: 4,
  },
  {
    id: '6',
    question: 'Is my data secure with your systems?',
    answer: 'Absolutely. We use enterprise-grade encryption, SOC 2 compliant processes, and follow strict data handling protocols. Your data never leaves your authorized systems without explicit permission.',
    position: 5,
  },
];

export const FAQ = ({ faqs = defaultFaqs, section }: FAQProps) => {
  // Use section title if available, otherwise fallback to default
  const title = section?.title || 'Frequently asked [[questions]]';

  return (
    <section className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <RichText
            as="h2"
            text={title}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`item-${faq.id}`}
                className="border border-border rounded-xl px-6 bg-card/50"
              >
                <AccordionTrigger className="text-left text-foreground py-5 [&>svg]:text-muted-foreground [&>svg:hover]:text-muted-foreground hover:underline transition-all">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

