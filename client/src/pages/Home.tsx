import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { LevelCard } from "../components/LevelCard";

interface Level {
  id: string;
  title: string;
  screenshot: string | null;
  createdBy: { id: string; username: string };
  completionCount: number;
}

export function Home() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Level[]>("/levels")
      .then(setLevels)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Community Levels</h1>
      <p className="text-surface-400 mb-6">
        Play levels created by the community
      </p>

      {loading ? (
        <p className="text-surface-400">Loading levels...</p>
      ) : levels.length === 0 ? (
        <p className="text-surface-500">
          No levels published yet. Be the first to create one!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <LevelCard key={level.id} {...level} />
          ))}
        </div>
      )}
    </div>
  );
}
