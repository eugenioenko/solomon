import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Controls } from "./Controls";
import { Canvas } from "./Canvas";
import { MainContainer } from "./MainContainer";
import { LevelSidePanel } from "./LevelSidePanel";
import { CompletionOverlay } from "./CompletionOverlay";
import { apiFetch } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface LevelDetail {
  id: string;
  title: string;
  description: string | null;
  data: string;
  published: boolean;
  screenshot: string | null;
  createdBy: { id: string; username: string };
  createdAt: string;
  completionCount: number;
  version: number;
  completions?: { username: string; completedAt: string }[];
}

export function LevelPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<LevelDetail | null>(null);
  const [forking, setForking] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const gameRef = useRef<any>(null);

  const handleLevelComplete = useCallback(() => {
    setShowOverlay(true);
  }, []);

  useEffect(() => {
    setShowOverlay(false);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("No level ID provided");
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const lvl = await apiFetch<LevelDetail>(`/levels/${id}`);
        if (!mounted) return;

        setLevel(lvl);

        const levelData = typeof lvl.data === "string" ? JSON.parse(lvl.data) : lvl.data;
        const resources = await FireNIce.loadGameResources();
        if (!mounted) return;

        const canvas = document.getElementById("canvas");
        const game = new FireNIce.Game({
          canvas,
          resources,
          gameMode: "level",
          level: levelData,
          onLevelComplete: () => {
            handleLevelComplete();
            if (lvl.published) {
              apiFetch(`/levels/${id}/complete`, { method: "POST" }).catch(() => { });
            }
          },
        });
        gameRef.current = game;

        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load level");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [id, handleLevelComplete]);

  const handleRestart = useCallback(() => {
    const engine = gameRef.current?.engine;
    if (engine?.scene) {
      engine.scene.load(engine.level);
    }
  }, []);

  const handleFork = useCallback(async () => {
    if (!id) return;
    setForking(true);
    try {
      const forked = await apiFetch<{ id: string }>(`/levels/${id}/fork`, { method: "POST" });
      navigate(`/editor/${forked.id}`);
    } catch {
      setForking(false);
    }
  }, [id, navigate]);

  const isOwner = !!(user && level && user.id === level.createdBy.id);

  if (error) {
    return (
      <MainContainer className="flex  flex-col items-center justify-center">
        <p className="text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          Back to Home
        </button>
      </MainContainer>
    );
  }



  return (
    <div className="flex flex-col lg:flex-row flex-grow h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-[#e4e4e4] overflow-hidden">
      <main className="flex flex-col flex-grow items-center justify-center p-4 lg:p-8 lg:overflow-auto">
        <div className="relative">
          {showOverlay && id && (
            <CompletionOverlay currentLevelId={id} />
          )}
          {loading && (
            <div className="text-center text-[#888] py-4 text-sm">Loading level...</div>
          )}
          <Canvas />
        </div>
        <Controls hideDesktopInfo={true} />
      </main>
      {
        level && (
          <LevelSidePanel
            level={level}
            isOwner={isOwner}
            isLoggedIn={!!user}
            onRestart={handleRestart}
            onFork={handleFork}
            forking={forking}
            gameRef={gameRef}
          />
        )
      }

    </div >
  );
}
