import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Home, LayoutDashboard, Info, LogIn, LogOut, User, Flame, Snowflake, Plus } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${isActive(path)
      ? "text-primary-400 bg-primary-400/10"
      : "text-surface-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-surface-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="mr-4 flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <Flame size={18} className="text-[var(--color-fire)]" />
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
            <Snowflake size={18} className="text-[var(--color-ice)]" />
          </Link>
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
        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
}
