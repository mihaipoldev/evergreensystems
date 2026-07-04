"use client";
/* eslint-disable react/no-unescaped-entities -- long-form prose; apostrophes/quotes read fine */

import { useEffect, useState } from "react";
import { TextureCanvas } from "@/components/home/TextureCanvas";

// Ported from the Claude Design v2 playbook article. Static prose + interactive
// TOC scrollspy, copy-link, and FAQ accordion. Copy scrubbed to production
// rules (no em/en dashes). Placeholder essay content — real content is Mihai's.

const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";
const AVATAR = "/home/mihai.png";
const SHARE_URL = "https://www.evergreensystems.ai/insights/volume-isnt-the-system";

const TOC = [
  { id: "problem", num: "01", label: "Lists exist. Meetings don't." },
  { id: "blast", num: "02", label: "The blast trains the filter against you" },
  { id: "deliverability", num: "03", label: "Deliverability is engineering, not luck" },
  { id: "checklist", label: "The infrastructure checklist", sub: true },
  { id: "targeting", num: "04", label: "Targeting is data, not spray" },
  { id: "reply", num: "05", label: "The reply is the job" },
  { id: "booked", num: "06", label: "Booked, not sent" },
  { id: "start", num: "07", label: "Start with the infrastructure" },
];

export function Article() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const heads = Array.from(
      document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id]"),
    );
    if (!heads.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
    );
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, []);

  function copyLink() {
    const show = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    };
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).then(show, show);
    } else {
      show();
    }
  }

  return (
    <article className="art" data-analytics-section="insights-article">
      <div className="wrap">
        <div className="art-head">
          <div className="art-cat">Strategy</div>
          <h1 className="art-title">
            <span className="em">Volume isn't the system.</span>{" "}
            <span className="dim">The system is the system.</span>
          </h1>
          <p className="art-dek">
            The blast is activity, not output. Here's why mass-sending quietly trains spam filters
            against you, and the four-part system that actually books qualified calls.
          </p>
          <div className="art-byline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AVATAR} alt="Mihai Pol" />
            <span className="bn">Mihai Pol</span>
            <span className="sep" />
            <span className="bd">May 28 2026</span>
          </div>
        </div>

        <figure className="art-hero">
          <TextureCanvas tex="terrain" color="accent" step={6} />
          <span className="htag">Fig. 01: the system, dissolved into data</span>
          <span className="cap">
            <b>Output</b> over activity: every dot is a send the system can account for.
          </span>
        </figure>

        <div className="art-layout">
          <aside className="aside">
            <nav className="toc">
              <h4>Table of contents</h4>
              <ol>
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className={`${t.sub ? "sub " : ""}${activeId === t.id ? "active" : ""}`.trim()}
                    >
                      {t.num && <span className="tn">{t.num}</span>}
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="share">
              <h4>Share</h4>
              <div className="share-row">
                <button onClick={copyLink} aria-label="Copy link" title="Copy link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${SHARE_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  title="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8.02h4.56V24H.22V8.02zM8.34 8.02h4.37v2.18h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V24h-4.56v-7.08c0-1.69-.03-3.86-2.35-3.86-2.35 0-2.71 1.84-2.71 3.74V24H8.34V8.02z" />
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=Volume%20isn't%20the%20system.%20The%20system%20is%20the%20system.&url=${SHARE_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                  title="X"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
              <p className={`copied${copied ? " show" : ""}`}>Link copied</p>
            </div>

            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="side-cta-btn">
              Talk with a specialist
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </aside>

          <div className="prose">
            <p className="intro">
              There is a comforting story in outbound that goes like this: if it isn't working, send
              more. More contacts, more domains, more volume. It is the wrong story, and it's
              expensive.
            </p>
            <p>
              Outbound isn't a volume problem. Lists exist: anyone can buy ten thousand names this
              afternoon. What doesn't scale by adding volume is the only thing that matters:
              qualified meetings on your calendar. The blast is activity. A booked calendar is
              output. They are not the same thing, and confusing them is what burns most outbound
              budgets.
            </p>

            <h2 id="problem">Lists exist. Meetings don't.</h2>
            <p>
              The first thing to internalize: a list is a starting point, not an outcome. The value
              was never in the names. It's in whether the right person reads a message that's clearly
              written for them, lands in their inbox, and gets a reply that someone actually works.
            </p>
            <p>
              Every step in that sentence is a place the blast fails. Wrong person. Generic message.
              Spam folder. A reply nobody reads for three days. Adding volume doesn't fix any of
              them; it multiplies all of them.
            </p>

            <div className="pullquote">
              <p>Volume isn't the system. The system is the system.</p>
              <cite>The recurring frame</cite>
            </div>

            <h2 id="blast">The blast trains the filter against you</h2>
            <p>
              Here's the part that makes mass-sending actively destructive rather than merely
              ineffective: spam filters learn. Every email that gets deleted unread, marked as spam,
              or bounced is a signal. Send ten thousand generic emails from your main domain and you
              don't just get a bad week; you teach Google and Microsoft that mail from your company
              is unwanted.
            </p>
            <p>
              That reputation is sticky. Once your domain is cooked, even your legitimate,
              one-to-one sales emails start landing in spam. The blast doesn't just fail to book
              meetings; it damages the asset every future campaign depends on.
            </p>

            <div className="cmp">
              <table>
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>The blast</th>
                    <th className="hi">The system</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Goal</td><td>Sends out the door</td><td className="hi">Qualified calls booked</td></tr>
                  <tr><td>Domain</td><td>Your main domain</td><td className="hi">Warmed secondary domains</td></tr>
                  <tr><td>Targeting</td><td>Scraped list, merge tags</td><td className="hi">Signal-based, enriched</td></tr>
                  <tr><td>Replies</td><td>An inbox nobody owns</td><td className="hi">Qualified &amp; routed daily</td></tr>
                  <tr><td>Result</td><td>Burned reputation</td><td className="hi">A pipeline that compounds</td></tr>
                </tbody>
              </table>
            </div>

            <h2 id="deliverability">Deliverability is engineering, not luck</h2>
            <p>
              Most people treat inbox placement as a mystery: sometimes it works, sometimes it
              doesn't. It isn't a mystery. It's an engineering problem with a known checklist, and
              skipping the checklist is why "we tried cold email and it didn't work."
            </p>
            <p>
              Your main domain should never send a cold email. Sending runs on secondary domains,
              authenticated and warmed for weeks before they touch a prospect, kept under a strict
              daily volume so the pattern always looks human.
            </p>

            <h3 id="checklist">The infrastructure checklist</h3>
            <ul>
              <li><b>SPF, DKIM, DMARC</b> configured on every sending domain, no exceptions.</li>
              <li><b>Secondary domains only.</b> Your primary domain is an asset; it never sends outbound.</li>
              <li><b>21 to 28 day warmup</b> before a domain sends a single real email.</li>
              <li><b>Under 30 sends per inbox per day</b>, so volume never trips a filter.</li>
              <li><b>Open tracking off.</b> The tracking pixel is itself a spam signal.</li>
            </ul>
            <p>
              None of this is glamorous. All of it is the difference between reaching the inbox and
              never being seen. Without this foundation, nothing else in the system matters, which is
              exactly why it comes first.
            </p>

            <div className="callout">
              <div className="ck">The honest version</div>
              <p>
                The numbers below are representative ranges from how a properly-built system tends to
                perform, not a specific client result. We label them as such on purpose. We'd rather
                show you what <em>your</em> setup should expect and then measure it, than quote a
                figure we can't stand behind.
              </p>
            </div>

            <div className="statrow">
              <div className="st"><div className="sn">3-5×</div><div className="sl">reply rate vs. a typical mass blast</div></div>
              <div className="st"><div className="sn">90%+</div><div className="sl">inbox placement, measured per domain</div></div>
              <div className="st"><div className="sn">{"<14"}</div><div className="sl">days to the first booked call after go-live</div></div>
            </div>
            <p className="statrow-note">Representative ranges. Confirm against your own setup.</p>

            <h2 id="targeting">Targeting is data, not spray</h2>
            <p>
              Real personalization is not "Hi {"{{FirstName}}"}, I saw your company is doing great
              things." That's mail merge wearing a costume. Real personalization references something
              true and specific: a job posting that signals a need, a recent funding round, a
              technology in their stack, a problem visible from public data.
            </p>
            <p>
              That's a data problem, and it's solvable at scale: enrichment pulls the signal, and the
              message gets built around it. The point isn't to sound personal. It's to prove, in one
              sentence, that you actually understand the prospect's situation. That's what earns a
              reply.
            </p>

            <h2 id="reply">The reply is the job</h2>
            <p>
              Sending is the easy 20%. The 80% that books meetings is what happens after someone
              replies: qualifying the interest, answering the real question, routing the good ones to
              a calendar, and doing it the same day, every day.
            </p>
            <p>
              This is the step automation-only setups quietly drop. A sequence can send. It can't
              read a nuanced reply, judge fit, and hold a short conversation that ends in a booked
              call. That takes a human in the loop, working the inbox as a workflow, not as something
              to check when there's time.
            </p>

            <h2 id="booked">Booked, not sent</h2>
            <p>
              Opens, sends, "activity on the account": vanity. If your outbound dashboard has ten
              numbers on it, nine of them are a distraction. The system is instrumented around one:
              qualified calls on the calendar.
            </p>
            <p>
              When that's the only number that counts, every decision gets simpler. You stop
              optimizing for volume and start optimizing for the outcome, which, conveniently, is the
              thing you were actually paying for.
            </p>

            <h2 id="start">Start with the infrastructure</h2>
            <p>
              If you take one thing from this: don't start by sending. Start by building the thing
              that makes sending safe. The infrastructure first, then the targeting, then the reply
              workflow, then the automation that turns a booked call into a real calendar invite. In
              that order. The pipeline follows the system, never the other way around.
            </p>
            <p>
              That's the whole pitch, and it's an honest one. We don't sell you names. We build and
              run the system that books you calls, and if it doesn't hit the floor in 90 days, every
              dollar comes back.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
