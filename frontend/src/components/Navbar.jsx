import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bug, Sun, Moon, Plus } from "lucide-react";
import Button from "./ui/Button";

export default function Navbar({ onOpenNewIssue }) {
  const location = useLocation();
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("squash-theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
      localStorage.setItem("squash-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("squash-theme", "dark");
    }
  }, [isLight]);

  const toggleTheme = () => {
    setIsLight((prev) => !prev);
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-wider text-foreground text-lg hover:opacity-80 transition-opacity">
            <Bug className="h-5 w-5 text-chart-1" />
            <span>SQUASH</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/issues"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive("/issues")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Issues
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Button
            onClick={onOpenNewIssue}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            <span>New issue</span>
          </Button>

          <Button
            onClick={onOpenNewIssue}
            size="icon"
            className="sm:hidden"
            aria-label="New issue"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="sm:hidden flex items-center justify-around border-t border-border px-4 py-2 bg-card">
        <Link
          to="/"
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            isActive("/") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/issues"
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            isActive("/issues") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}
        >
          Issues
        </Link>
      </div>
    </header>
  );
}
