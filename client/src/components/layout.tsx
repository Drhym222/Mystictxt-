import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/live", label: "Live Chat" },
  { href: "/account", label: "Account" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function Header() {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" data-testid="link-home-logo">
          <span className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              MysticTxt
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" data-testid="nav-desktop">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}>
              <Button
                variant={location === l.href ? "secondary" : "ghost"}
                size="sm"
                data-testid={`link-nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggle}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col border-t px-4 pb-4 pt-2 md:hidden" data-testid="nav-mobile">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              <Button
                variant={location === l.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                data-testid={`link-mobile-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="flex items-center gap-2 font-serif text-lg font-bold">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                MysticTxt
              </span>
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Professional psychic services delivered with care and accuracy.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" data-testid="link-footer-services">All Services</Link></li>
              <li><Link href="/live" data-testid="link-footer-live-chat">Live Chat</Link></li>
              <li><Link href="/services/psychic-reading" data-testid="link-footer-psychic">Psychic Reading</Link></li>
              <li><Link href="/services/telepathy-mind-reading" data-testid="link-footer-telepathy">Telepathy Reading</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" data-testid="link-footer-faq">FAQ</Link></li>
              <li><Link href="/contact" data-testid="link-footer-contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" data-testid="link-footer-terms">Terms of Service</Link></li>
              <li><Link href="/privacy" data-testid="link-footer-privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MysticTxt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
