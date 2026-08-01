import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-xs text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
          <Link to="/refund-policy" className="transition-colors hover:text-foreground">Refund Policy</Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          <a href="mailto:hello@corahq.com" className="transition-colors hover:text-foreground">Contact</a>
        </nav>
        <p>© {new Date().getFullYear()} Cora · CoraHQ · Built for YouTubers</p>
      </div>
    </footer>
  );
}
