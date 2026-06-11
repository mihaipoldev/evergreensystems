import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Evergreen Systems",
  description:
    "What we collect on this site, why, and what we never do with it.",
};

// Plain-language privacy page for the first-party analytics. Kept honest and
// short on purpose — it describes exactly what src/lib/analytics.ts collects.
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="py-20 md:py-28">
        <div className="max-w-[680px] mx-auto px-4 sm:px-6">
          <span className="text-primary text-sm font-medium uppercase tracking-wider block mb-4">
            Privacy
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            What we collect, and what we don&apos;t.
          </h1>
          <p className="text-muted-foreground mb-12">
            Last updated: June 11, 2026
          </p>

          <div className="space-y-10 text-base leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold mb-3">What we collect</h2>
              <p className="text-muted-foreground mb-3">
                This site runs its own first-party analytics. When you visit, we
                record anonymous usage events:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Pages and sections you view, links and buttons you click</li>
                <li>How far you scroll and how long the page is open</li>
                <li>
                  Approximate location — country, region, and city derived from
                  your IP address. The IP address itself is never stored.
                </li>
                <li>Device type, operating system, and browser family</li>
                <li>
                  The campaign that brought you here (UTM parameters), if any
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">What we don&apos;t do</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>No names, emails, or personal identifiers are collected</li>
                <li>No third-party analytics, ad networks, or tracking pixels</li>
                <li>No cross-site tracking, fingerprinting, or data selling</li>
                <li>No advertising cookies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Cookies</h2>
              <p className="text-muted-foreground">
                We set a single first-party cookie containing a random session
                id, which expires after 30 minutes. Its only job is to group
                the events of one visit together. It identifies a visit, not
                a person.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Why we collect it</h2>
              <p className="text-muted-foreground">
                To understand which parts of the site work and which campaigns
                are worth running — our legitimate interest in improving a
                website we operate. The data is only ever read in aggregate.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Retention</h2>
              <p className="text-muted-foreground">
                Event data is retained for up to 24 months, then deleted.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-muted-foreground">
                Questions about any of this:{" "}
                <a
                  href="mailto:hello@evergreensystems.ai"
                  className="text-primary underline underline-offset-4"
                >
                  hello@evergreensystems.ai
                </a>
              </p>
            </div>
          </div>

          <div className="mt-14">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to evergreensystems.ai
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
