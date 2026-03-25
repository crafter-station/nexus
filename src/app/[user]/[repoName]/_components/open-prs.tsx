import type { GitHubPullRequest } from "@/lib/github-cache";
import { formatDate } from "../_lib/format";

export default function OpenPRs({ pullRequests }: { pullRequests: GitHubPullRequest[] }) {
  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
        <h3 className="text-sm font-medium text-foreground">Open PRs</h3>
        <span className="text-xs text-accent">Newest +</span>
      </div>
      <div className="divide-y divide-border-muted">
        {pullRequests.map((pr) => (
          <div
            key={pr.id}
            className="px-5 py-3 hover:bg-surface-raised transition-colors"
          >
            <div className="flex items-start gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success mt-0.5 shrink-0"
              >
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                <line x1="6" y1="9" x2="6" y2="21" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  <span className="text-muted">#{pr.number}</span>{" "}
                  {pr.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {pr.user?.avatar_url ? (
                    <img
                      src={pr.user.avatar_url}
                      alt={pr.user.login}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-muted" />
                  )}
                  <span className="text-xs text-muted truncate">
                    {pr.user?.login ?? "unknown"}
                  </span>
                  <span className="text-xs text-subtle">&middot;</span>
                  <span className="text-xs text-subtle">{formatDate(pr.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
