import type { GitHubEvent } from "@/lib/github-cache";
import { formatRelativeTime } from "../_lib/format";

type EventType =
  | "IssueCommentEvent"
  | "IssuesEvent"
  | "PushEvent"
  | "PullRequestEvent"
  | "PullRequestReviewEvent"
  | "PullRequestReviewCommentEvent"
  | "CreateEvent"
  | "DeleteEvent"
  | "WatchEvent"
  | "ForkEvent"
  | "ReleaseEvent";

const eventIcons: Partial<Record<EventType, React.ReactNode>> = {
  IssueCommentEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  IssuesEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  PushEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="1.05" y1="12" x2="7" y2="12" />
      <line x1="17.01" y1="12" x2="22.96" y2="12" />
    </svg>
  ),
  PullRequestEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  ),
  PullRequestReviewEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  PullRequestReviewCommentEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  CreateEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  WatchEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  ForkEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
      <path d="M12 12v3" />
    </svg>
  ),
  ReleaseEvent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

const eventColors: Partial<Record<EventType, string>> = {
  IssueCommentEvent: "text-accent",
  IssuesEvent: "text-success",
  PushEvent: "text-muted",
  PullRequestEvent: "text-success",
  PullRequestReviewEvent: "text-accent",
  PullRequestReviewCommentEvent: "text-accent",
  CreateEvent: "text-success",
  WatchEvent: "text-warning",
  ForkEvent: "text-muted",
  ReleaseEvent: "text-accent",
};

function getEventDescription(event: GitHubEvent): {
  action: string;
  detail: string;
  number?: number;
} {
  const payload = event.payload as Record<string, unknown>;
  const type = event.type as EventType;

  switch (type) {
    case "IssueCommentEvent": {
      const issue = payload.issue as { number: number; title: string } | undefined;
      return {
        action: "commented on",
        detail: issue?.title ?? "",
        number: issue?.number,
      };
    }
    case "IssuesEvent": {
      const action = payload.action as string;
      const issue = payload.issue as { number: number; title: string } | undefined;
      return {
        action: `${action} issue`,
        detail: issue?.title ?? "",
        number: issue?.number,
      };
    }
    case "PushEvent": {
      const commits = payload.commits as { message: string }[] | undefined;
      const count =
        (payload.distinct_size as number) ||
        commits?.length ||
        (payload.size as number) ||
        0;
      const ref = (payload.ref as string)?.replace("refs/heads/", "") ?? "";
      if (count === 0) {
        return {
          action: `pushed to ${ref}`,
          detail: "",
        };
      }
      return {
        action: `pushed ${count} commit${count !== 1 ? "s" : ""} to ${ref}`,
        detail: commits?.[0]?.message ?? "",
      };
    }
    case "PullRequestEvent": {
      const action = payload.action as string;
      const pr = payload.pull_request as { number: number; title: string } | undefined;
      return {
        action: `${action} pull request`,
        detail: pr?.title ?? "",
        number: pr?.number,
      };
    }
    case "PullRequestReviewEvent": {
      const pr = payload.pull_request as { number: number; title: string } | undefined;
      return {
        action: "reviewed",
        detail: pr?.title ?? "",
        number: pr?.number,
      };
    }
    case "PullRequestReviewCommentEvent": {
      const pr = payload.pull_request as { number: number; title: string } | undefined;
      return {
        action: "commented on review",
        detail: pr?.title ?? "",
        number: pr?.number,
      };
    }
    case "CreateEvent": {
      const refType = payload.ref_type as string;
      const ref = payload.ref as string | null;
      return {
        action: `created ${refType}`,
        detail: ref ?? "",
      };
    }
    case "WatchEvent":
      return { action: "starred the repository", detail: "" };
    case "ForkEvent":
      return { action: "forked the repository", detail: "" };
    case "ReleaseEvent": {
      const release = payload.release as { tag_name: string; name: string } | undefined;
      return {
        action: "published release",
        detail: release?.name ?? release?.tag_name ?? "",
      };
    }
    default:
      return { action: event.type ?? "performed an action", detail: "" };
  }
}

const defaultIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default function ActivityFeed({ events }: { events: GitHubEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted py-4">No recent activity.</p>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border-muted">
      {events.map((event) => {
        const type = event.type as EventType;
        const { action, detail, number } = getEventDescription(event);
        const actor = event.actor;

        return (
          <div key={event.id} className="flex gap-3 py-3 first:pt-0">
            <div className="mt-1 shrink-0">
              <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center">
                <span className={eventColors[type] ?? "text-muted"}>
                  {eventIcons[type] ?? defaultIcon}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  {actor.avatar_url && (
                    <img
                      src={actor.avatar_url}
                      alt={actor.login}
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <span className="font-medium text-foreground">
                    {actor.login}
                  </span>
                </span>{" "}
                {action}
              </p>
              {number && (
                <p className="text-sm text-accent">#{number}</p>
              )}
              {detail && (
                <p className="text-xs text-muted mt-0.5 truncate">
                  {detail}
                </p>
              )}
            </div>
            <span className="text-xs text-subtle shrink-0 mt-1">
              {event.created_at
                ? formatRelativeTime(event.created_at)
                : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
