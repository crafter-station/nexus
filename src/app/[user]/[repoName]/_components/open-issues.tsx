import type { GitHubIssue } from "@/lib/github-cache";
import { formatDate } from "../_lib/format";

export default function OpenIssues({ issues }: { issues: GitHubIssue[] }) {
  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
        <h3 className="text-sm font-medium text-foreground">Open Issues</h3>
        <span className="text-xs text-accent">Newest +</span>
      </div>
      <div className="divide-y divide-border-muted">
        {issues.map((issue) => (
          <div
            key={issue.id}
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
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  <span className="text-muted">#{issue.number}</span>{" "}
                  {issue.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {issue.user?.avatar_url ? (
                    <img
                      src={issue.user.avatar_url}
                      alt={issue.user.login}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-muted" />
                  )}
                  <span className="text-xs text-muted truncate">
                    {issue.user?.login ?? "unknown"}
                  </span>
                  <span className="text-xs text-subtle">&middot;</span>
                  <span className="text-xs text-subtle">
                    {formatDate(issue.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
