import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerPasskey, loginPasskey } from "../services/auth";

export function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleRegister() {
    if (!username.trim() || username.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await registerPasskey(username.trim());
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await loginPasskey(username.trim());
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm bg-surface-800 rounded-lg p-8 border border-surface-700 relative overflow-hidden">
        {/* Retro corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--color-ice)] opacity-30" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--color-fire)] opacity-30" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--color-fire)] opacity-30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--color-ice)] opacity-30" />

        <h1
          className="text-center mb-4"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "clamp(18px, 4vw, 24px)",
            color: "#fff",
            textShadow:
              "0 0 10px var(--color-ice), 0 0 20px var(--color-ice), 3px 3px 0 var(--color-fire)",
            letterSpacing: "2px",
            animation: "logo-glow 2s ease-in-out infinite alternate",
          }}
        >
          Fire'n Ice
        </h1>
        <p className="text-center text-surface-400 text-xs mb-6" >
          Play, Create and Share!
        </p>
        <div className="space-y-8">
          <div>
            <label htmlFor="username" className="block text-sm text-surface-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
              className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          {error && (
            <p className="text-danger-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 rounded font-medium cursor-pointer"
            >
              {loading ? "..." : "Login"}
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50 text-white py-2 rounded font-medium cursor-pointer"
            >
              {loading ? "..." : "Sign Up"}
            </button>
          </div>

          <p className="text-xs text-surface-500 text-center">
            Authentication uses passkeys. Your credentials are stored securely and never leave your device
          </p>
        </div>
      </div>
    </div>
  );
}
