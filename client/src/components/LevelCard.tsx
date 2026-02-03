import { Link } from "react-router-dom";

interface LevelCardProps {
  id: string;
  title: string;
  screenshot?: string | null;
  createdBy: { id: string; username: string };
  completionCount: number;
}

export function LevelCard({
  id,
  title,
  screenshot,
  createdBy,
  completionCount,
}: LevelCardProps) {
  return (
    <Link
      to={`/play/${id}`}
      className="block bg-surface-800 rounded-lg overflow-hidden border border-surface-700 hover:border-primary-500 transition-colors"
    >
      <div className="aspect-[7/5] bg-surface-700 flex items-center justify-center">
        {screenshot ? (
          <img
            src={screenshot}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-surface-500 text-sm">No preview</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{title}</h3>
        <div className="flex items-center justify-between mt-1 text-sm text-surface-400">
          <span>by {createdBy.username}</span>
          <span>{completionCount} cleared</span>
        </div>
      </div>
    </Link>
  );
}
