import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { AnalyticsTracker } from "@/components/landing/AnalyticsTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = {
  title: "Thank you — Evergreen Systems",
  description: "Thank you. You're all set.",
};

// Honest, flow-aware confirmation. The Stripe-side redirect sets ?flow so the copy
// matches what actually happened — a real payment, a started subscription (with or
// without a trial), or a saved card with no charge. Defaults to the payment copy
// when no flow is given (the one-off payment links don't set it).
type Copy = { eyebrow: string; heading: string; body: string };

function copyForFlow(flow: string | undefined, isTrial: boolean): Copy {
  if (flow === "setup") {
    return {
      eyebrow: "Card saved",
      heading: "You're all set.",
      body: "Your card has been saved securely. No charge was made — you'll only be billed when an invoice or subscription is started.",
    };
  }
  if (flow === "subscription") {
    return isTrial
      ? {
          eyebrow: "Subscription started",
          heading: "You're all set.",
          body: "Your subscription is active. Your first charge happens at the end of the trial period — we'll email a receipt then.",
        }
      : {
          eyebrow: "Subscription started",
          heading: "You're subscribed.",
          body: "Your first payment went through and your subscription is now active. A receipt is on the way to your inbox.",
        };
  }
  return {
    eyebrow: "Payment received",
    heading: "Thank you.",
    body: "Your payment was successful. A receipt and invoice are on the way to your inbox. If you don't see them within a few minutes, check your spam folder.",
  };
}

type PageProps = {
  searchParams: Promise<{ flow?: string; trial?: string; session?: string }>;
};

export default async function ThanksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { eyebrow, heading, body } = copyForFlow(params.flow, params.trial === "1");

  return (
    <>
      <ErrorBoundary>
        <AnalyticsTracker pageId="thanks" pageSlug="thanks" />
      </ErrorBoundary>
      <Navbar sections={[]} headerSection={undefined} />
      <main className="min-h-screen bg-background text-foreground">
        <section className="py-24 md:py-32">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-8">
              <FontAwesomeIcon icon={faCircleCheck} className="h-10 w-10" />
            </div>

            <div className="h-1 w-16 bg-primary mx-auto mb-8 rounded-full" />

            <span className="text-primary text-sm font-medium uppercase tracking-wider block mb-4">
              {eyebrow}
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {heading}
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              {body}
            </p>

            <Button asChild size="xl" className="bg-primary hover:bg-primary text-primary-foreground">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
