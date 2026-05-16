import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = {
  title: "Payment cancelled — Evergreen Systems",
  description: "Your payment was cancelled. No charge has been made.",
};

export default function PaymentCancelledPage() {
  return (
    <>
      <Navbar sections={[]} headerSection={undefined} />
      <main className="min-h-screen bg-background text-foreground">
        <section className="py-24 md:py-32">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-muted/40 text-muted-foreground mb-8">
              <FontAwesomeIcon icon={faCircleXmark} className="h-10 w-10" />
            </div>

            <div className="h-1 w-16 bg-muted-foreground/30 mx-auto mb-8 rounded-full" />

            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider block mb-4">
              Payment cancelled
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              No charge made.
            </h1>

            <p className="text-muted-foreground text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Your payment was cancelled. No money has been taken from your account. If this was
              a mistake, you can try again — ask the merchant to resend you a payment link.
            </p>

            <Button asChild size="xl" variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
