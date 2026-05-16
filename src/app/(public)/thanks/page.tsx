import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = {
  title: "Payment received — Evergreen Systems",
  description: "Thank you for your payment. A receipt and invoice are on the way.",
};

export default function ThanksPage() {
  return (
    <>
      <Navbar sections={[]} headerSection={undefined} />
      <main className="min-h-screen bg-background text-foreground">
        <section className="py-24 md:py-32">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-8">
              <FontAwesomeIcon icon={faCircleCheck} className="h-10 w-10" />
            </div>

            <div className="h-1 w-16 bg-primary mx-auto mb-8 rounded-full" />

            <span className="text-primary text-sm font-medium uppercase tracking-wider block mb-4">
              Payment received
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Thank you.
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Your payment was successful. A receipt and invoice are on the way to your inbox.
              If you don&apos;t see them within a few minutes, check your spam folder.
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
