import Link from "next/link";
import { Brand } from "./Brand";

export function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-intro">
          <Brand />
          <p>Built for the people making decisions while the clock is moving.</p>
        </div>
        <div>
          <h3>Product</h3>
          <Link href="/#product">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Android download</Link>
          <Link href="/login">Portal sign in</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/#organizations">Organizations</Link>
          <Link href="/#contact">Contact</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@gamedayhuddle.com">Support</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} GameDay Huddle</span>
        <span>Made for football. Ready for the sideline.</span>
      </div>
    </footer>
  );
}
