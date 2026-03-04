const FooterSection = () => {
  return (
    <footer className="border-t border-section-divider py-8">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-small">
          © {new Date().getFullYear()} Evergreen Systems. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
