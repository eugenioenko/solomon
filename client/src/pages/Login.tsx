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
      <div className="w-full max-w-sm bg-surface-800 rounded-lg p-6 border border-surface-700">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Solomon</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-surface-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-danger-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 rounded font-medium"
            >
              {loading ? "..." : "Login"}
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 bg-surface-600 hover:bg-surface-500 disabled:opacity-50 text-white py-2 rounded font-medium"
            >
              {loading ? "..." : "Sign Up"}
            </button>
          </div>

          <p className="text-xs text-surface-500 text-center">
            Authentication uses passkeys. Your browser will prompt you to verify your identity.
          </p>
        </div>
      </div>
    </div>
  );
}
