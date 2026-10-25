import { Brand } from "./Brand";
import { DEMO_HREF, SUPPORT_EMAIL, legalLinks, organizationLinks, platformLinks } from "./links";

export function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid section-shell">
        <div className="footer-intro">
          <Brand />
          <p>Registration, messaging and fundraising for youth football and cheer.</p>
        </div>
        <div>
          <h3>Platform</h3>
          <ul>
            {platformLinks.map(([label, href]) => (
              <li key={label}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Organizations</h3>
          <ul>
            {organizationLinks.map(([label, href]) => (
              <li key={label}><a href={href}>{label}</a></li>
            ))}
            <li><a href={DEMO_HREF}>Book a demo</a></li>
          </ul>
        </div>
        <div>
          <h3>Resources</h3>
          <ul>
            {legalLinks.map(([label, href]) => (
              <li key={label}><a href={href}>{label}</a></li>
            ))}
            <li><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom section-shell">
        <span>© {new Date().getFullYear()} GameDay Huddle LLC</span>
        <span>Made for youth football and cheer.</span>
      </div>
    </footer>
  );
}
