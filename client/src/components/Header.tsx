import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Shield, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export function Header() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/scores", label: "Scores" },
    { path: "/schedule", label: "Schedule" },
    { path: "/playoffs", label: "Playoffs" },
    { path: "/standings", label: "Standings" },
    { path: "/previous-weeks", label: "Previous Weeks" },
    { path: "/news", label: "News" },
    { path: "/pickems", label: "Pick'ems" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <h1 className="text-xl md:text-2xl font-bold text-foreground hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer">
              BFFL Fan Hub
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  size="default"
                  className="font-medium"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {isAuthenticated && (
              <Link href="/admin" data-testid="link-admin">
                <Button variant="outline" size="default" className="hidden md:flex gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <a href="/api/logout" data-testid="link-logout">
                <Button variant="outline" size="default">
                  Logout
                </Button>
              </a>
            ) : (
              <a href="/login" data-testid="link-login">
                <Button variant="default" size="default">
                  Admin Login
                </Button>
              </a>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  size="default"
                  className="w-full justify-start font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/admin" data-testid="link-mobile-admin">
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
