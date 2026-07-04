import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_DRAFTS, postBySlug, visiblePosts } from "@/features/insights/posts";
import "@/styles/home.css";
import "@/styles/insights.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Icon } from "@/components/home/icons";
import { TextureCanvas } from "@/components/home/TextureCanvas";
import { Article } from "@/components/insights/Article";
import { ArticleFaq } from "@/components/insights/ArticleFaq";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";

export const revalidate = 60;

const SLUG = "volume-isnt-the-system";
const ARTICLE = `/insights/${SLUG}`;
const AVATAR = "/home/mihai.png";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Volume Isn't the System. The System Is the System.",
    description:
      "The blast is activity, not output. Why mass-sending trains spam filters against you, and the four-part system that actually books qualified calls.",
    url: `${SEO_CONFIG.siteUrl}${ARTICLE}`,
  });
}

export default function ArticlePage() {
  // Draft article: dev-only until its post is published in the registry.
  const post = postBySlug(SLUG);
  const isDraft = !post?.published;
  if (isDraft && !SHOW_DRAFTS) notFound();
  // "More insights" from the registry — everything visible except this article.
  const more = visiblePosts().filter((p) => p.slug !== SLUG).slice(0, 3);
  return (
    <div className={`eg-home ${egFontVars}`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="insights-article" />
      </ErrorBoundary>

      <div className="topbar" data-analytics-section="insights-announce">
        <div className="wrap">
          <p>
            <b>The 90-day guarantee:</b> 10 qualified calls or every dollar back.
          </p>
          <Link href="/#guarantee">
            See how it works <Icon name="arrow-right" className="ic" />
          </Link>
        </div>
      </div>

      <Navbar />

      <main>
        {isDraft && (
          <div className="draft-note" role="status">
            Draft — visible in dev only. Publish it in src/features/insights/posts.ts.
          </div>
        )}
        <Article />

        <ArticleFaq />

        <section className="more" data-analytics-section="insights-more">
          <div className="wrap">
            <div className="more-head">
              <h2>More insights</h2>
              <p>Keep reading on the same system.</p>
            </div>
            <div className="pgrid">
              {more.map((m) => {
                const draft = SHOW_DRAFTS && !m.published;
                const body = (
                  <>
                    <div className={`pcard-vis${m.vis ? ` ${m.vis}` : ""}`}>
                      <span className="vtag">{m.tag}</span>
                      <span className="vnum">{m.num}</span>
                      {draft && <span className="pcard-draft">Draft</span>}
                      <TextureCanvas tex={m.tex} color={m.color} dir={m.dir} step={m.step} />
                    </div>
                    <div className="pcard-body">
                      <div className="pcard-date">{m.date}</div>
                      <h3 className="pcard-title">{m.title}</h3>
                      <p className="pcard-ex">{m.ex}</p>
                      <div className="pcard-foot">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={AVATAR} alt="Mihai Pol" />
                        <span className="an">Mihai Pol</span>
                      </div>
                    </div>
                  </>
                );
                if (!m.slug) {
                  return (
                    <div className="pcard is-static" key={m.num}>
                      {body}
                    </div>
                  );
                }
                return (
                  <a
                    className="pcard"
                    href={`/insights/${m.slug}`}
                    key={m.num}
                    data-analytics-id={`insights-more-${m.num}`}
                  >
                    {body}
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <div className="pre-close" />
        <ClosingCta />
      </main>

      <Footer />
    </div>
  );
}
