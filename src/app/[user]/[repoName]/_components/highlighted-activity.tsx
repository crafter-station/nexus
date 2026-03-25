import type { GitHubIssue } from "@/lib/github-cache";

export default function HighlightedActivity({ issue }: { issue: GitHubIssue }) {
  return (
    <div className="bg-surface rounded-xl border border-border-default p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">
        Highlighted Activity
      </h3>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-success"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="text-accent font-medium">#{issue.number}</span>{" "}
            <span className="text-foreground">{issue.title}</span>
          </p>
          {issue.user && (
            <p className="text-xs text-muted mt-1">
              <span className="inline-flex items-center gap-1">
                {issue.user.avatar_url ? (
                  <img
                    src={issue.user.avatar_url}
                    alt={issue.user.login}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-teal-600 inline-flex items-center justify-center text-white text-[9px] font-bold">
                    {issue.user.login[0].toUpperCase()}
                  </span>
                )}
                {issue.user.login}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted text-xs shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {issue.comments}
        </div>
      </div>
    </div>
  );
}
