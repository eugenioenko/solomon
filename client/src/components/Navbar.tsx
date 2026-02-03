import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-surface-900 border-b border-surface-700">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold text-primary-400">
            Solomon
          </Link>
          <Link
            to="/"
            className="text-surface-300 hover:text-white text-sm"
          >
            Home
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="text-surface-300 hover:text-white text-sm"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/about"
            className="text-surface-300 hover:text-white text-sm"
          >
            About
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-surface-300 text-sm">{user.username}</span>
              <button
                onClick={logout}
                className="text-sm text-surface-400 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
