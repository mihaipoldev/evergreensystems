import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What does Evergreen Systems actually handle?",
    answer: "Evergreen Systems builds, runs, and optimizes the entire outbound system end to end. This includes targeting, lead sourcing, AI driven enrichment, messaging, sending, follow ups, reply handling, and booking qualified sales calls to your calendar. Your role is focused on sales conversations, not outbound execution."
  },
  {
    question: "How involved do I need to be?",
    answer: "Very little. We align upfront on your offer, ideal customer profile, and qualification criteria. Once the system is live, your main responsibility is showing up prepared for booked sales calls."
  },
  {
    question: "How quickly does the system start working?",
    answer: "Every engagement begins with a setup and warmup phase designed to protect deliverability. This typically takes a few weeks. Once outreach goes live, replies and conversations begin accumulating as the system gathers real data."
  },
  {
    question: "Is this a one time campaign or an ongoing system?",
    answer: "This is an ongoing outbound system, not a one off campaign. Performance improves over time as targeting, enrichment, and messaging are refined based on real reply data."
  },
  {
    question: "What happens after a call is booked?",
    answer: "Once a qualified call is booked, the conversation is handed off to you. From that point forward, you handle the sales process, follow up, and closing inside your existing workflow or CRM. If needed, booked calls can be passed into your CRM so your pipeline stays organized, but sales execution remains fully on your side."
  },
  {
    question: "Is this compliant with email regulations?",
    answer: "Outbound is set up using standard best practices, including proper identification and unsubscribe handling. You remain in control of your messaging and business information at all times."
  }
];

const FAQSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-8">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border">
            <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
