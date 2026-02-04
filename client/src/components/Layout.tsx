
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-[100dvh]  bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0d1320] text-white">
      <Navbar />
      <Outlet />
    </div>
  );
}
