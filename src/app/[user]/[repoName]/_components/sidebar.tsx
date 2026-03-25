import type {
  GitHubRepository,
  GitHubContributor,
  ContributorAvatarsData,
} from "@/lib/github-cache";
import {
  formatNumber,
  formatRelativeTime,
  formatSize,
  getLanguageColor,
} from "../_lib/format";

export default function Sidebar({
  user,
  repoName,
  repo,
  contributors,
  contributorAvatars,
}: {
  user: string;
  repoName: string;
  repo: GitHubRepository;
  contributors: GitHubContributor[];
  contributorAvatars: ContributorAvatarsData | null;
}) {
  const displayContributors =
    contributorAvatars?.contributors ?? contributors.slice(0, 12);
  const totalContributors =
    contributorAvatars?.total ?? contributors.length;

  return (
    <div className="space-y-6">
      {/* Repo avatar + name */}
      <div className="space-y-3">
        {repo.owner.avatar_url ? (
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="w-16 h-16 rounded-xl"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
            </svg>
          </div>
        )}
        <div>
          <h1 className="text-lg">
            <span className="text-muted">{user}</span>
            <span className="text-muted mx-1">/</span>
            <span className="font-semibold text-foreground">{repoName}</span>
          </h1>
          {repo.description && (
            <p className="text-sm text-muted mt-1">{repo.description}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-border-default text-xs text-muted">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
          </svg>
          {repo.private ? "Private" : "Public"}
        </span>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="px-2.5 py-0.5 rounded-full bg-accent-emphasis/15 text-accent text-xs font-medium hover:bg-accent-emphasis/25 transition-colors cursor-pointer"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-surface-raised hover:bg-surface text-sm font-medium transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-warning">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Starred</span>
          <span className="text-muted">{formatNumber(repo.stargazers_count)}</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-surface-raised hover:bg-surface text-sm transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          Go to file
        </button>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-surface-raised hover:bg-surface text-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          Open on GitHub
        </a>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-surface-raised hover:bg-surface text-sm transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
            <path d="M12 12v3" />
          </svg>
          Fork
        </button>
      </div>

      {/* Info section */}
      <div className="space-y-3 text-sm border-t border-border-default pt-4">
        <p className="text-xs text-subtle uppercase tracking-wider font-medium">Info</p>
        <div className="space-y-2.5">
          {repo.language && (
            <div className="flex items-center justify-between">
              <span className="text-muted">Language</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                />
                {repo.language}
              </span>
            </div>
          )}
          {repo.license && (
            <div className="flex items-center justify-between">
              <span className="text-muted">License</span>
              <span>{repo.license.spdx_id}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted">Branch</span>
            <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded">
              {repo.default_branch}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Last push</span>
            <span>{repo.pushed_at ? formatRelativeTime(repo.pushed_at) : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Size</span>
            <span>{formatSize(repo.size)}</span>
          </div>
          {repo.homepage && (
            <div className="flex items-center justify-between">
              <span className="text-muted">Homepage</span>
              <a
                href={repo.homepage.startsWith("http") ? repo.homepage : `https://${repo.homepage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent truncate ml-4"
              >
                {repo.homepage}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Contributors */}
      {displayContributors.length > 0 && (
        <div className="space-y-3 border-t border-border-default pt-4">
          <p className="text-xs text-subtle uppercase tracking-wider font-medium">
            Contributors <span className="text-muted">{totalContributors}</span>
          </p>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {displayContributors.slice(0, 10).map((c) => (
                <img
                  key={c.login}
                  src={c.avatar_url}
                  alt={c.login}
                  title={c.login}
                  className="w-7 h-7 rounded-full ring-2 ring-background"
                />
              ))}
            </div>
            {totalContributors > 10 && (
              <span className="ml-2 text-xs text-muted">
                +{totalContributors - 10}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
