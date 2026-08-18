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
          <a href="/#workflow">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/download">Android download</a>
          <a href="/signup">Sign up</a>
        </div>
        <div>
          <h3>Company</h3>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div>
          <h3>Legal</h3>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
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
