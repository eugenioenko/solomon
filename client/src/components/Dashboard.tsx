import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { MainContainer } from "./MainContainer";

interface UserLevel {
  id: string;
  title: string;
  published: boolean;
  completionCount: number;
  locked: boolean;
  createdAt: string;
}

export function Dashboard() {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserLevel[]>("/users/me/levels")
      .then(setLevels)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function handlePublish(id: string) {
    try {
      await apiFetch(`/levels/${id}/publish`, { method: "POST" });
      setLevels((prev) =>
        prev.map((l) => (l.id === id ? { ...l, published: true } : l))
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this level?")) return;
    try {
      await apiFetch(`/levels/${id}`, { method: "DELETE" });
      setLevels((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <MainContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Levels</h1>
        <Link
          to="/editor"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium"
        >
          Create Level
        </Link>
      </div>

      {loading ? (
        <p className="text-surface-400">Loading...</p>
      ) : levels.length === 0 ? (
        <p className="text-surface-500">
          You haven't created any levels yet.
        </p>
      ) : (
        <div className="space-y-3">
          {levels.map((level) => (
            <div
              key={level.id}
              className="flex items-center justify-between bg-surface-800 rounded-lg p-4 border border-surface-700"
            >
              <div>
                <h3 className="font-medium text-white">{level.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-surface-400">
                  {level.published ? (
                    <span className="text-primary-400">Published</span>
                  ) : (
                    <span className="text-secondary-400">Draft</span>
                  )}
                  <span>{level.completionCount} cleared</span>
                  {level.locked && (
                    <span className="text-danger-400">Locked</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!level.locked && (
                  <Link
                    to={`/editor/${level.id}`}
                    className="text-sm text-surface-300 hover:text-white px-3 py-1.5 rounded border border-surface-600 hover:border-surface-500"
                  >
                    Edit
                  </Link>
                )}
                {!level.published && (
                  <button
                    onClick={() => handlePublish(level.id)}
                    className="text-sm text-primary-400 hover:text-primary-300 px-3 py-1.5 rounded border border-primary-700 hover:border-primary-600"
                  >
                    Publish
                  </button>
                )}
                {!level.locked && (
                  <button
                    onClick={() => handleDelete(level.id)}
                    className="text-sm text-danger-400 hover:text-danger-300 px-3 py-1.5 rounded border border-danger-800 hover:border-danger-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainContainer>
  );
}
