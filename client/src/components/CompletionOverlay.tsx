import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { apiFetch } from "../services/api";

interface CompletionOverlayProps {
  currentLevelId: string;
}

export function CompletionOverlay({ currentLevelId }: CompletionOverlayProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [nextLevelId, setNextLevelId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<{ id: string } | null>(`/levels/next?after=${currentLevelId}`)
      .then((result) => {
        setNextLevelId(result?.id ?? null);
        setLoaded(true);
      })
      .catch(() => {
        setNextLevelId(null);
        setLoaded(true);
      });
  }, [currentLevelId]);

  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loaded]);

  useEffect(() => {
    if (countdown === 0 && loaded) {
      if (nextLevelId) {
        navigate(`/play/${nextLevelId}`);
      } else {
        navigate("/");
      }
    }
  }, [countdown, loaded, nextLevelId, navigate]);

  const handleNavigate = useCallback(() => {
    if (nextLevelId) {
      navigate(`/play/${nextLevelId}`);
    } else {
      navigate("/");
    }
  }, [nextLevelId, navigate]);

  const buttonLabel = nextLevelId
    ? `Next Level${loaded ? ` (${countdown})` : ""}`
    : `Back to Home${loaded ? ` (${countdown})` : ""}`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-[#ffe17f] animate-bounce">
          <Trophy size={64} strokeWidth={1.5} />
        </div>

        <h2
          className="text-2xl text-white text-center m-0"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "20px",
            textShadow:
              "0 0 10px rgba(0, 212, 255, 0.6), 0 0 20px rgba(0, 212, 255, 0.3)",
          }}
        >
          Level Completed!
        </h2>

        <button
          onClick={handleNavigate}
          className="mt-2 px-6 py-3 bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.4)] rounded-lg text-[#00d4ff] text-sm cursor-pointer transition-all duration-200 hover:bg-[rgba(0,212,255,0.3)] hover:border-[rgba(0,212,255,0.6)] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "12px" }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
