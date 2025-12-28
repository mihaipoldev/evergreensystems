/**
 * AdminFontStyle - Applies static geist-sans font for admin pages
 * Since admin fonts are now static (always geist-sans), this component
 * provides early font application via inline styles.
 */
export async function AdminFontStyle() {
  // Always use geist-sans for admin - static CSS
  // This ensures fonts are applied early via inline styles before React hydrates
  const css = `html.preset-admin,html.preset-admin *{--font-family-admin-heading:var(--font-geist-sans);--font-family-admin-body:var(--font-geist-sans);}html.preset-admin *,html.preset-admin *::before,html.preset-admin *::after{font-family:var(--font-geist-sans),system-ui,sans-serif!important;}html.preset-admin h1,html.preset-admin h2,html.preset-admin h3,html.preset-admin h4,html.preset-admin h5,html.preset-admin h6,html.preset-admin h1 *,html.preset-admin h2 *,html.preset-admin h3 *,html.preset-admin h4 *,html.preset-admin h5 *,html.preset-admin h6 *{font-family:var(--font-geist-sans),system-ui,sans-serif!important;}`;

  return (
    <style
      id="font-family-inline-server"
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  );
}

