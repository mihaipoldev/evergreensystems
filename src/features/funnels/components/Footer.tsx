import type { FooterContent } from "../types";

interface FooterProps {
  content?: FooterContent;
}

const Footer = ({ content }: FooterProps) => {
  const companyName = content?.companyName ?? "Evergreen Systems";

  return (
    <footer className="py-8 border-t border-border">
      <div className="text-center">
        <p className="body-sm">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
