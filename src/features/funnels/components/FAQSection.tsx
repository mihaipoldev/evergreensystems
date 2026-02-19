"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQContent } from "../types";

interface FAQSectionProps {
  content: FAQContent;
}

const FAQSection = ({ content }: FAQSectionProps) => {
  return (
    <section className="section-spacing">
      <div className="max-w-3xl mx-auto px-3 md:px-0">
        <h2 className="md:heading-lg heading-md md:mb-10 mb-6 text-center">
          {content.heading}
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {content.faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border"
            >
              <AccordionTrigger className="text-left md:py-5 py-4 hover:no-underline">
                <span className="md:heading-sm text-sm font-medium md:pr-4 pr-2">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="md:pb-5 pb-4">
                <p className="md:body-md body-sm md:leading-[26px] leading-relaxed text-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
