import { home } from "@/features/home/content";
import { Icon } from "./icons";
import { CtaLink } from "./CtaLink";
import { TextureCanvas } from "./TextureCanvas";

// Pricing — two PAYMENT models, same full service in both. v2 card design
// (navy featured "Performance" card + white "Predictable" card) kept on the
// current per-card includes model: each card carries its own full feature
// list (filtered by omitFeatures), rather than a single shared panel.
export function Pricing() {
  const { pricing } = home;
  return (
    <section className="pricing" id="pricing" data-analytics-section="pricing">
      <TextureCanvas
        tex="field"
        color="ink"
        step={12}
        animate
        speed={2.8}
        className="price-tex"
      />
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{pricing.eyebrow}</div>
          <h2>
            <span className="em">{pricing.headingEm}</span>{" "}
            <span className="dim">{pricing.headingDim}</span>
          </h2>
          <p>{pricing.sub}</p>
        </div>

        <div className="price-models">
          {pricing.plans.map((plan) => {
            const omit = plan.omitFeatures ?? [];
            const feats = pricing.features.filter((f) => !omit.includes(f));
            return (
              <div
                className={`pmodel${plan.featured ? " is-featured" : ""}`}
                key={plan.cta.id}
              >
                <div className="pm-top">
                  <span className="pm-kicker">{plan.kicker}</span>
                  {plan.tag && <span className="pm-tag">{plan.tag}</span>}
                </div>
                <h3 className="pm-name">{plan.name}</h3>
                <p className="pm-desc">{plan.descriptor}</p>
                <CtaLink
                  href={plan.cta.href}
                  entityId={plan.cta.id}
                  label={plan.cta.label}
                  location="pricing"
                  className={`pm-btn ${plan.featured ? "pm-btn-accent" : "pm-btn-ghost"}`}
                >
                  {plan.cta.label} <Icon name="arrow-right" />
                </CtaLink>
                <ul className="pm-feats">
                  {feats.map((f, i) => (
                    <li key={i}>
                      <Icon name="check" className="pm-fc" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.note && <p className="pm-note">{plan.note}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
