import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout, LayoutFull } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { About } from "./components/About";
import { Terms } from "./components/Terms";
import { LevelEditor } from "./components/LevelEditor";
import { LevelPlayer } from "./components/LevelPlayer";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

          </Route>
          <Route element={<LayoutFull />}>
            <Route path="/play/:id" element={<LevelPlayer />} />
            <Route
              path="/editor/:id?"
              element={
                <ProtectedRoute>
                  <LevelEditor />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
