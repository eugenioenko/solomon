import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Info,
  Trophy,
  RefreshCw,
  ArrowLeft,
  Pencil,
  Copy,
  Keyboard,
  Loader2,
  User,
  Calendar,
  LogIn,
  Medal,
  type LucideIcon,
} from "lucide-react";

interface LevelCompletion {
  username: string;
  completedAt: string;
}

interface LevelDetail {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  createdBy: { id: string; username: string };
  createdAt: string;
  completionCount: number;
  version: number;
  completions?: LevelCompletion[];
}

interface LevelSidePanelProps {
  level: LevelDetail;
  isOwner: boolean;
  isLoggedIn: boolean;
  onRestart: () => void;
  onFork: () => void;
  forking: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SideSection({
  icon: Icon,
  title,
  border = true,
  children,
}: {
  icon: LucideIcon;
  title: string;
  border?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`p-4 ${border ? "border-b border-white/5" : ""}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888] mb-3 flex items-center gap-1.5">
        <Icon size={12} />
        {title}
      </div>
      {children}
    </div>
  );
}

function BackLink() {
  return (
    <div className="px-4 pt-4">
      <Link
        to="/"
        className="bg-white/[0.08] border border-white/10 rounded-md text-[#ccc] px-3 py-2 text-[13px] no-underline cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-white/[0.12] hover:text-white w-full"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>
    </div>
  );
}

function LevelInfoSection({ level }: { level: LevelDetail }) {
  return (
    <SideSection icon={Info} title="Level Info">
      <h2
        className="text-base text-white m-0 mb-2 leading-snug"
        style={{ fontFamily: "var(--font-pixel)", fontSize: "12px" }}
      >
        {level.title}
      </h2>
      <div className="flex flex-col gap-1.5 text-[13px]">
        <div className="flex items-center gap-1.5 text-[#aaa]">
          <User size={12} className="text-[#666]" />
          <span>by <span className="text-[#ccc]">{level.createdBy.username}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-[#aaa]">
          <Calendar size={12} className="text-[#666]" />
          {formatDate(level.createdAt)}
        </div>
        <div className="mt-1">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-[10px] font-semibold uppercase tracking-wide ${level.published
              ? "bg-[rgba(76,175,80,0.2)] text-[#4caf50]"
              : "bg-[rgba(255,255,255,0.08)] text-[#888]"
              }`}
          >
            {level.published ? "Published" : "Draft"}
          </span>
        </div>
      </div>
      {level.description && (
        <p className="text-[12px] text-[#999] mt-2 mb-0 leading-relaxed">
          {level.description}
        </p>
      )}
    </SideSection>
  );
}

function StatisticsSection({ level }: { level: LevelDetail }) {
  return (
    <SideSection icon={Trophy} title="Statistics">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/30 rounded-md p-2.5 text-center">
          <div
            className="text-lg text-[#00d4ff] font-bold"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "16px" }}
          >
            {level.completionCount}
          </div>
          <div className="text-[10px] text-[#888] mt-1">Cleared</div>
        </div>
        <div className="bg-black/30 rounded-md p-2.5 text-center">
          <div
            className="text-lg text-[#ff6b9d] font-bold"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "16px" }}
          >
            v{level.version}
          </div>
          <div className="text-[10px] text-[#888] mt-1">Version</div>
        </div>
      </div>
    </SideSection>
  );
}

function ActionsSection({
  level,
  isOwner,
  isLoggedIn,
  onRestart,
  onFork,
  forking,
}: {
  level: LevelDetail;
  isOwner: boolean;
  isLoggedIn: boolean;
  onRestart: () => void;
  onFork: () => void;
  forking: boolean;
}) {
  return (
    <SideSection icon={Info} title="Actions">
      <div className="flex flex-col gap-2">
        <button
          onClick={onRestart}
          className="bg-white/[0.08] border border-white/10 rounded-md text-[#ccc] px-3 py-2 text-[13px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-white/[0.12] hover:text-white w-full"
        >
          <RefreshCw size={14} />
          Restart Level
        </button>

        {isOwner ? (
          <Link
            to={`/editor/${level.id}`}
            className="bg-[rgba(76,175,80,0.2)] border border-[rgba(76,175,80,0.3)] rounded-md text-[#4caf50] px-3 py-2 text-[13px] no-underline cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-[rgba(76,175,80,0.3)] w-full"
          >
            <Pencil size={14} />
            Edit Level
          </Link>
        ) : isLoggedIn ? (
          <button
            onClick={onFork}
            disabled={forking}
            className="bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.3)] rounded-md text-[#00d4ff] px-3 py-2 text-[13px] cursor-pointer transition-all duration-150 flex items-center gap-1.5 hover:bg-[rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {forking ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Copy size={14} />
            )}
            {forking ? "Forking..." : "Fork Level"}
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-white/[0.05] border border-white/10 rounded-md text-[#888] px-3 py-2 text-[13px] no-underline transition-all duration-150 flex items-center gap-1.5 hover:bg-white/[0.08] hover:text-[#aaa] w-full"
          >
            <LogIn size={14} />
            Login to Fork
          </Link>
        )}
      </div>
    </SideSection>
  );
}

function ControlsSection() {
  return (
    <SideSection icon={Keyboard} title="Controls">
      <div className="grid grid-cols-1 gap-1.5">
        {[
          { key: "← →", desc: "Move" },
          { key: "↓ SPACE", desc: "Create Ice" },
          { key: "ENTER", desc: "Restart" },
          { key: "ESC", desc: "Pause" },
        ].map((c) => (
          <div
            key={c.key}
            className="flex items-center justify-between bg-black/30 rounded px-2.5 py-1.5"
          >
            <span
              className="text-[#ffe17f] text-[10px]"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {c.key}
            </span>
            <span className="text-[11px] text-[#888]">{c.desc}</span>
          </div>
        ))}
      </div>
    </SideSection>
  );
}

function ScoreboardSection({ completions }: { completions: LevelCompletion[] }) {
  return (
    <SideSection icon={Medal} title="Scoreboard" border={false}>
      <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1">
        {completions.map((c, i) => (
          <div
            key={c.username}
            className="flex items-center justify-between bg-black/30 rounded px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] text-[#666] w-4 text-right"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                {i + 1}
              </span>
              <span className="text-[12px] text-[#ccc]">{c.username}</span>
            </div>
            <span className="text-[10px] text-[#666]">
              {formatDate(c.completedAt)}
            </span>
          </div>
        ))}
      </div>
    </SideSection>
  );
}

export function LevelSidePanel({
  level,
  isOwner,
  isLoggedIn,
  onRestart,
  onFork,
  forking,
}: LevelSidePanelProps) {
  return (
    <aside className="w-[260px] lg:w-[350px] bg-black/30 border-l border-white/10 flex flex-col overflow-y-auto max-[900px]:w-full max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:border-white/10">
      <BackLink />
      <LevelInfoSection level={level} />
      <StatisticsSection level={level} />
      <ActionsSection
        level={level}
        isOwner={isOwner}
        isLoggedIn={isLoggedIn}
        onRestart={onRestart}
        onFork={onFork}
        forking={forking}
      />
      <ControlsSection />
      {level.completions && level.completions.length > 0 && (
        <ScoreboardSection completions={level.completions} />
      )}
    </aside>
  );
}
