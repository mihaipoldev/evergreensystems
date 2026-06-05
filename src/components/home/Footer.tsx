import { home } from "@/features/home/content";
import { Icon } from "./icons";

export function Footer() {
  const { footer } = home;
  return (
    <footer className="foot">
      <div className="wrap">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={footer.brandLogo} alt={footer.brandAlt} />
          <div className="tag">{footer.tag}</div>
        </div>

        {footer.columns.map((col) => (
          <div className="col" key={col.title}>
            <h4>{col.title}</h4>
            {col.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.icon ? <Icon name={l.icon} className="icon" /> : null}
                {l.label}
              </a>
            ))}
          </div>
        ))}

        <div className="copy">{footer.copy}</div>
      </div>
    </footer>
  );
}
