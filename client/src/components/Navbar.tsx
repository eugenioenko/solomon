import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Home, LayoutDashboard, Info, LogIn, LogOut, User, Plus, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${isActive(path)
      ? "text-primary-400 bg-primary-400/10"
      : "text-surface-300 hover:text-white hover:bg-white/5"
    }`;

  const mobileLinkClass = (path: string) =>
    `flex items-center gap-2 text-sm px-3 py-2.5 rounded-md transition-colors ${isActive(path)
      ? "text-primary-400 bg-primary-400/10"
      : "text-surface-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="bg-surface-900 border-b border-surface-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="mr-4 flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img src="/favicon.png" alt="Fire'n Ice" className="w-6 h-6" />
            <span
              className="text-sm font-bold text-white tracking-wider"
              style={{
                fontFamily: "var(--font-pixel)",
                textShadow:
                  "0 0 8px var(--color-ice), 0 0 16px var(--color-ice), 2px 2px 0 var(--color-fire)",
                animation: "logo-glow 2s ease-in-out infinite alternate",
              }}
            >
              Fire'n Ice
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>
              <Home size={16} />
              Home
            </Link>
            {user && (
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
            <Link to="/editor" className={linkClass("/editor")}>
              <Plus size={16} />
              Create
            </Link>
            <Link to="/about" className={linkClass("/about")}>
              <Info size={16} />
              About
            </Link>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-surface-300 bg-surface-800/50 px-3 py-1.5 rounded-md">
                <User size={14} className="text-surface-400" />
                {user.username}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-md transition-colors"
            >
              <LogIn size={14} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center text-surface-300 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-14 border-t border-surface-700/50 bg-surface-900/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1 shadow-lg z-50">
          <Link to="/" className={mobileLinkClass("/")}>
            <Home size={16} />
            Home
          </Link>
          {user && (
            <Link to="/dashboard" className={mobileLinkClass("/dashboard")}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}
          <Link to="/editor" className={mobileLinkClass("/editor")}>
            <Plus size={16} />
            Create
          </Link>
          <Link to="/about" className={mobileLinkClass("/about")}>
            <Info size={16} />
            About
          </Link>

          <div className="border-t border-surface-700/50 mt-2 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-surface-300 px-3 py-2">
                  <User size={14} className="text-surface-400" />
                  {user.username}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm text-surface-400 hover:text-white w-full px-3 py-2.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm bg-primary-600 hover:bg-primary-500 text-white px-3 py-2.5 rounded-md transition-colors"
              >
                <LogIn size={14} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
