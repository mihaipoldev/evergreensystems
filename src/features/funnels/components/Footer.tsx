const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="text-center">
        <p className="body-sm">
          © {new Date().getFullYear()} Evergreen Systems. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
