import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Eraser,
  BrickWall,
  RefreshCw,
  Trash2,
  Save,
  Globe,
  Keyboard,
  Palette,
  FolderOpen,
  ArrowLeft,
  Play,
  Grid3x3,
  Crosshair,
  CircleDot,
  User,
  Flame,
  Snowflake,
  Box,
  FlaskConical,
  Zap,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { MainContainer } from "./MainContainer";
import { apiFetch } from "../services/api";

const TOOLS: { id: number; name: string; shortcut: string; icon: LucideIcon; color: string }[] = [
  { id: 0, name: "Erase", shortcut: "E", icon: Eraser, color: "text-[#aaa]" },
  { id: 1, name: "Wall", shortcut: "W", icon: BrickWall, color: "text-[#a0845e]" },
  { id: 7, name: "Player", shortcut: "P", icon: User, color: "text-[#5bc0eb]" },
  { id: 6, name: "Fire", shortcut: "F", icon: Flame, color: "text-[#ff6600]" },
  { id: 3, name: "Ice", shortcut: "I", icon: Snowflake, color: "text-[#00bfff]" },
  { id: 4, name: "Metal", shortcut: "M", icon: Box, color: "text-[#8a8a9a]" },
  { id: 5, name: "Jar", shortcut: "J", icon: FlaskConical, color: "text-[#e8a43a]" },
  { id: 8, name: "Teleport", shortcut: "T", icon: Zap, color: "text-[#c77dff]" },
];

const TOOL_SHORTCUTS: Record<string, number> = {
  e: 0, "1": 0,
  w: 1, "2": 1,
  p: 7, "3": 7,
  f: 6, "4": 6,
  i: 3, "5": 3,
  m: 4, "6": 4,
  j: 5, "7": 5,
  t: 8, "8": 8,
};

const SHORTCUTS = [
  { key: "1-8", desc: "Select tool" },
  { key: "Ctrl+S", desc: "Save level" },
  { key: "R", desc: "Reload level" },
];

export function LevelEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState(1);
  const [activeTheme, setActiveTheme] = useState(0);
  const [coords, setCoords] = useState("X: -- Y: --");
  const [spriteCount, setSpriteCount] = useState(0);
  const [levelTitle, setLevelTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string; visible: boolean }>({
    message: "",
    type: "",
    visible: false,
  });
  const [themeCanvases, setThemeCanvases] = useState<string[]>([]);

  const gameRef = useRef<any>(null);
  const levelIdRef = useRef<string | undefined>(id);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mouseDownRef = useRef(false);
  const activeToolRef = useRef(activeTool);
  const activeThemeRef = useRef(activeTheme);

  // Keep refs in sync with state
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { activeThemeRef.current = activeTheme; }, [activeTheme]);
  useEffect(() => { levelIdRef.current = id; }, [id]);

  const showToast = useCallback((message: string, type = "info") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  const getEngine = useCallback(() => {
    return gameRef.current?.engine;
  }, []);

  const updateSpriteCount = useCallback(() => {
    const engine = getEngine();
    if (engine?.sprites) {
      setSpriteCount(engine.sprites.length);
    }
  }, [getEngine]);

  const getScreenshot = useCallback(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) return undefined;
    return canvas.toDataURL("image/png");
  }, []);

  const saveLevel = useCallback(async () => {
    const engine = getEngine();
    if (!engine?.scene) return;

    const data = engine.scene.save();
    const screenshot = getScreenshot();
    setSaving(true);

    try {
      if (levelIdRef.current) {
        await apiFetch(`/levels/${levelIdRef.current}`, {
          method: "PUT",
          body: JSON.stringify({ data, title: levelTitle || "Untitled Level", screenshot }),
        });
        showToast("Level saved", "success");
      } else {
        const result = await apiFetch<{ id: string }>("/levels", {
          method: "POST",
          body: JSON.stringify({ data, title: levelTitle || "Untitled Level", screenshot }),
        });
        levelIdRef.current = result.id;
        navigate(`/editor/${result.id}`, { replace: true });
        showToast("Level created", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }, [getEngine, levelTitle, navigate, showToast]);

  const publishLevel = useCallback(async () => {
    if (!levelIdRef.current) {
      showToast("Save the level first", "error");
      return;
    }

    setPublishing(true);
    try {
      // Save current state before publishing
      const engine = getEngine();
      if (engine?.scene) {
        const data = engine.scene.save();
        const screenshot = getScreenshot();
        await apiFetch(`/levels/${levelIdRef.current}`, {
          method: "PUT",
          body: JSON.stringify({ data, title: levelTitle || "Untitled Level", screenshot }),
        });
      }

      await apiFetch(`/levels/${levelIdRef.current}/publish`, { method: "POST" });
      setPublished(true);
      showToast("Level published!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to publish", "error");
    } finally {
      setPublishing(false);
    }
  }, [getEngine, levelTitle, showToast]);

  const clearLevel = useCallback(() => {
    const engine = getEngine();
    if (engine) {
      engine.sprites = engine.sprites.filter((s: any) => s.id === 7);
      showToast("Sprites cleared", "info");
      updateSpriteCount();
    }
  }, [getEngine, showToast, updateSpriteCount]);

  const reloadLevel = useCallback(() => {
    const engine = getEngine();
    if (engine?.scene) {
      engine.scene.load(engine.level);
      showToast("Level reloaded", "info");
      updateSpriteCount();
    }
  }, [getEngine, showToast, updateSpriteCount]);

  const selectTheme = useCallback(
    (themeId: number) => {
      setActiveTheme(themeId);
      const engine = getEngine();
      if (engine?.map) {
        engine.map.theme = themeId;
      }
    },
    [getEngine]
  );

  const loadLevel = useCallback(
    (levelIndex: number) => {
      const engine = getEngine();
      if (levelIndex >= 0 && engine) {
        engine.level = levelIndex;
        engine.scene.load(levelIndex);
        if (engine.map) {
          selectTheme(engine.map.theme);
        }
        showToast(`Loaded Level ${levelIndex + 1}`, "info");
        updateSpriteCount();
      }
    },
    [getEngine, selectTheme, showToast, updateSpriteCount]
  );

  // Place tile/sprite on canvas
  const placeTile = useCallback(
    (canvasEl: HTMLCanvasElement, clientX: number, clientY: number) => {
      const engine = getEngine();
      if (!engine) return;

      const rect = canvasEl.getBoundingClientRect();
      const scaleX = canvasEl.width / rect.width;
      const scaleY = canvasEl.height / rect.height;
      const tx = Math.floor((clientX - rect.left) * scaleX / 32);
      const ty = Math.floor((clientY - rect.top) * scaleY / 32);

      if (tx < 0 || tx > 20 || ty < 0 || ty > 14) return;

      const tool = activeToolRef.current;

      if (tool === 0) {
        engine.map.map[ty][tx] = 0;
        engine.sprites = engine.sprites.filter(
          (s: any) => !(s.xTile === tx && s.yTile === ty)
        );
      } else if (tool === 1) {
        engine.map.map[ty][tx] = 1;
      } else {
        engine.sprites = engine.sprites.filter(
          (s: any) => !(s.xTile === tx && s.yTile === ty)
        );
        engine.map.map[ty][tx] = 0;

        switch (tool) {
          case 3:
            engine.addSprite(
              new FireNIce.Ice(engine, tx, ty, 1, new FireNIce.Frost(true, true))
            );
            break;
          case 4:
            engine.addSprite(new FireNIce.Metal(engine, tx, ty, 1));
            break;
          case 5:
            engine.addSprite(new FireNIce.Jar(engine, tx, ty));
            break;
          case 6:
            engine.addSprite(new FireNIce.Fire(engine, tx, ty));
            break;
          case 7:
            engine.sprites = engine.sprites.filter((s: any) => s.id !== 7);
            engine.player = new FireNIce.Player(engine, tx, ty);
            engine.addSprite(engine.player);
            break;
          case 8:
            engine.addSprite(new FireNIce.Teleport(engine, tx, ty));
            break;
        }
      }
    },
    [getEngine]
  );

  // Initialize game engine and load existing level from DB if editing
  useEffect(() => {
    let mounted = true;

    (async () => {
      const resources = await FireNIce.loadGameResources();
      if (!mounted) return;

      const canvas = document.getElementById("canvas") as HTMLCanvasElement;

      let levelData = null;
      if (id) {
        try {
          const level = await apiFetch<{ title: string; data: string; published: boolean }>(`/levels/${id}`);
          setLevelTitle(level.title);
          setPublished(level.published);
          levelData = typeof level.data === "string" ? JSON.parse(level.data) : level.data;
        } catch (err: any) {
          showToast(err.message || "Failed to load level", "error");
        }
      }

      const game = new FireNIce.Game({
        canvas,
        resources,
        gameMode: "editor",
        ...(levelData ? { level: levelData } : {}),
      });
      gameRef.current = game;

      // Canvas mouse handlers for tile placement
      const handleMouseDown = (e: MouseEvent) => {
        mouseDownRef.current = true;
        placeTile(canvas, e.clientX, e.clientY);
      };
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX / 32);
        const y = Math.floor((e.clientY - rect.top) * scaleY / 32);
        setCoords(`X: ${x} Y: ${y}`);

        if (mouseDownRef.current) {
          placeTile(canvas, e.clientX, e.clientY);
        }
      };
      const handleMouseUp = () => { mouseDownRef.current = false; };
      const handleMouseLeave = () => {
        mouseDownRef.current = false;
        setCoords("X: -- Y: --");
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("mouseup", handleMouseUp);
    })();

    // Generate theme previews
    const img = new Image();
    img.onload = () => {
      const previews: string[] = [];
      for (let i = 0; i < 10; i++) {
        const c = document.createElement("canvas");
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 32, i * 32, 32, 32, 0, 0, 32, 32);
        previews.push(c.toDataURL());
      }
      setThemeCanvases(previews);
    };
    img.src = "/images/tilemap.png";

    // Sprite count updater
    const interval = setInterval(() => {
      const engine = gameRef.current?.engine;
      if (engine?.sprites) {
        setSpriteCount(engine.sprites.length);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id, placeTile, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      const key = e.key.toLowerCase();

      if (key in TOOL_SHORTCUTS) {
        e.preventDefault();
        setActiveTool(TOOL_SHORTCUTS[key]);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (key === "s") {
          e.preventDefault();
          saveLevel();
        }
      } else if (key === "r") {
        e.preventDefault();
        reloadLevel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [saveLevel, reloadLevel]);

  const levelCount = gameRef.current?.levels?.length ?? 0;

  return <MainContainer fullWidth={true}>
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-[#e4e4e4]">
      {/* Header */}
      <header className="bg-black/40 border-b border-white/10 px-5 py-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-xl font-semibold bg-gradient-to-r from-[#00d4ff] to-[#ff6b9d] bg-clip-text text-transparent">
            Fire 'n Ice Level Editor
          </h1>
          <span className="bg-[rgba(255,107,157,0.2)] text-[#ff6b9d] text-[10px] px-2 py-0.5 rounded-[10px] font-semibold uppercase tracking-wide">
            Beta
          </span>
          {id && (
            <span className={`text-[10px] px-2 py-0.5 rounded-[10px] font-semibold uppercase tracking-wide ${
              published
                ? "bg-[rgba(76,175,80,0.2)] text-[#4caf50]"
                : "bg-[rgba(255,255,255,0.08)] text-[#888]"
            }`}>
              {published ? "Published" : "Draft"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={levelTitle}
            onChange={(e) => setLevelTitle(e.target.value)}
            placeholder="Level title..."
            className="bg-black/30 border border-white/10 rounded-md text-[#e4e4e4] px-3 py-2 text-[13px] w-48 transition-all duration-150 hover:border-white/20 focus:outline-none focus:border-[#00d4ff]"
          />
          <button
            onClick={saveLevel}
            disabled={saving}
            className="bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.3)] rounded-md text-[#00d4ff] px-3.5 py-2 text-[13px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-[rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : id ? "Save" : "Create"}
          </button>
          {id && !published && (
            <button
              onClick={publishLevel}
              disabled={publishing}
              className="bg-[rgba(76,175,80,0.2)] border border-[rgba(76,175,80,0.3)] rounded-md text-[#4caf50] px-3.5 py-2 text-[13px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-[rgba(76,175,80,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
          {id ? (
            <Link
              to={`/play/${id}`}
              className="bg-[rgba(76,175,80,0.2)] border border-[rgba(76,175,80,0.3)] rounded-md text-[#4caf50] px-3.5 py-2 text-[13px] no-underline flex items-center gap-1.5 transition-all duration-150 hover:bg-[rgba(76,175,80,0.3)]"
            >
              <Play size={14} />
              Play
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white/[0.08] border border-white/10 rounded-md text-[#ccc] px-3.5 py-2 text-[13px] no-underline flex items-center gap-1.5 transition-all duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden max-[900px]:flex-col">
        {/* Sidebar */}
        <aside className="w-[220px] bg-black/30 border-r border-white/10 flex flex-col overflow-y-auto max-[900px]:w-full max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:border-white/10">
          {/* Tools */}
          <div className="p-4 border-b border-white/5 max-[900px]:flex-1 max-[900px]:min-w-[200px] max-[900px]:border-b-0 max-[900px]:border-r max-[900px]:border-white/5">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888] mb-3 flex items-center gap-1.5">
              <Crosshair size={12} />
              Tools
            </div>
            <div className="grid grid-cols-2 gap-2 max-[900px]:grid-cols-4">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={`${tool.name} (${tool.shortcut})`}
                  className={`relative bg-white/5 border-2 rounded-lg p-2 cursor-pointer transition-all duration-150 flex flex-col items-center gap-1.5 hover:bg-white/10 hover:border-white/20 ${activeTool === tool.id
                    ? "bg-[rgba(0,212,255,0.15)] border-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                    : "border-transparent"
                    }`}
                >
                  <tool.icon size={24} className={activeTool === tool.id ? "text-[#00d4ff]" : tool.color} />
                  <span
                    className={`text-[10px] text-center ${activeTool === tool.id ? "text-[#00d4ff]" : "text-[#aaa]"
                      }`}
                  >
                    {tool.name}
                  </span>
                  <span className="absolute top-1 right-1 text-[9px] text-[#666] bg-black/30 px-1 rounded-sm">
                    {tool.shortcut}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="p-4 border-b border-white/5 max-[900px]:flex-1 max-[900px]:min-w-[200px] max-[900px]:border-b-0 max-[900px]:border-r max-[900px]:border-white/5">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888] mb-3 flex items-center gap-1.5">
              <Palette size={12} />
              Theme
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {themeCanvases.map((src, i) => (
                <button
                  key={i}
                  onClick={() => selectTheme(i)}
                  title={`Theme ${i}`}
                  className={`w-full aspect-square border-2 rounded-md cursor-pointer overflow-hidden transition-all duration-150 relative hover:border-white/30 hover:scale-105 ${activeTheme === i
                    ? "border-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                    : "border-transparent"
                    }`}
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                    alt={`Theme ${i}`}
                  />
                  <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/70 text-white px-1 rounded-sm">
                    {i}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Load Level */}
          <div className="p-4 border-b border-white/5 max-[900px]:flex-1 max-[900px]:min-w-[200px] max-[900px]:border-b-0 max-[900px]:border-r max-[900px]:border-white/5">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888] mb-3 flex items-center gap-1.5">
              <FolderOpen size={12} />
              Load Template
            </div>
            <select
              onChange={(e) => loadLevel(parseInt(e.target.value))}
              onBlur={(e) => (e.target as HTMLSelectElement).blur()}
              className="w-full bg-black/30 border border-white/10 rounded-md text-[#e4e4e4] px-3 py-2.5 text-[13px] cursor-pointer transition-all duration-150 hover:border-white/20 focus:outline-none focus:border-[#00d4ff]"
              defaultValue="-1"
            >
              <option value="-1">Blank</option>
              {Array.from({ length: levelCount }, (_, i) => (
                <option key={i} value={i}>
                  Template {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Shortcuts */}
          <div className="p-4 max-[900px]:flex-1 max-[900px]:min-w-[200px]">
            <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888] mb-3 flex items-center gap-1.5">
              <Keyboard size={12} />
              Shortcuts
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {SHORTCUTS.map((s) => (
                <div key={s.key} className="flex justify-between items-center text-[11px]">
                  <span className="bg-white/10 px-1.5 py-0.5 rounded-sm font-mono text-[#aaa]">
                    {s.key}
                  </span>
                  <span className="text-[#666]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-black/20 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <button
                onClick={reloadLevel}
                title="Reload current level (R)"
                className="bg-white/[0.08] border border-white/10 rounded-md text-[#ccc] px-3.5 py-2 text-[13px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-white/[0.12] hover:text-white"
              >
                <RefreshCw size={14} />
                Reload
              </button>
              <button
                onClick={clearLevel}
                title="Clear all sprites"
                className="bg-[rgba(255,107,107,0.15)] border border-[rgba(255,107,107,0.2)] rounded-md text-[#ff6b6b] px-3.5 py-2 text-[13px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-[rgba(255,107,107,0.25)]"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Grid3x3 size={12} className="text-[#666]" />
              <span className="text-[#666] text-xs">21 x 15</span>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <CircleDot size={12} className="text-[#888]" />
              <span className="text-[#888] text-xs font-mono">{coords}</span>
            </div>
          </div>

          {/* Canvas */}
          <div
            className="flex-1 flex items-center justify-center p-5 overflow-auto"
            style={{
              background: `
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          >
            <div className="relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded overflow-hidden">
              <canvas
                id="canvas"
                height="480"
                width="672"
                className="block cursor-crosshair"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-black/50 border-t border-white/10 px-4 py-1.5 flex items-center justify-between text-[11px] text-[#666]">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${published ? "bg-[#4caf50]" : "bg-[#fbbf24]"}`} />
              <span>{id ? `${published ? "Published" : "Draft"} · ${id}` : "New Level"}</span>
            </div>
            <span>Sprites: {spriteCount}</span>
          </div>
        </main>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-20 left-1/2 bg-black/90 text-white px-5 py-3 rounded-lg text-[13px] pointer-events-none z-[1000] transition-all duration-300 ${toast.visible
          ? "opacity-100 -translate-x-1/2 translate-y-0"
          : "opacity-0 -translate-x-1/2 translate-y-[100px]"
          } ${toast.type === "success"
            ? "border-l-[3px] border-l-[#4caf50]"
            : toast.type === "info"
              ? "border-l-[3px] border-l-[#00d4ff]"
              : toast.type === "error"
                ? "border-l-[3px] border-l-[#ff6b6b]"
                : ""
          }`}
      >
        {toast.message}
      </div>

      {/* Hidden mobile control elements required by keyboard.js */}
      <div className="hidden">
        <span id="btn_left" />
        <span id="btn_right" />
        <span id="btn_action" />
        <span id="btn_select" />
        <span id="btn_up" />
        <span id="btn_down" />
      </div>
    </div>
  </MainContainer>;
}
