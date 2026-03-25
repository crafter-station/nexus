import type {
  ActivityItem,
  Tab,
} from "./types";

export const mockActivityFeed: ActivityItem[] = [
  {
    id: 1,
    type: "comment",
    title: "ping-maxwell @crafter-station commented on",
    description: "feat: support drizzle relations v2",
    author: "ping-maxwell",
    authorAvatar: "",
    timeAgo: "7h ago",
    issueNumber: 6913,
  },
  {
    id: 2,
    type: "closed_issue",
    title: "ping-maxwell @crafter-station closed issue",
    description: "Raise APIError messages with codes, not j...",
    author: "ping-maxwell",
    authorAvatar: "",
    timeAgo: "4dh ago",
    issueNumber: 3269,
  },
  {
    id: 3,
    type: "comment_issue",
    title: "ping-maxwell @crafter-station commented on",
    description: "Raise APIError messages with codes, not j...",
    author: "ping-maxwell",
    authorAvatar: "",
    timeAgo: "4dh ago",
    issueNumber: 3269,
  },
  {
    id: 4,
    type: "reopened_issue",
    title: "ping-maxwell @crafter-station reopened issue",
    description: "Raise APIError messages with codes, not j...",
    author: "ping-maxwell",
    authorAvatar: "",
    timeAgo: "4dh ago",
    issueNumber: 3269,
  },
  {
    id: 5,
    type: "comment",
    title: "ping-maxwell @crafter-station commented on",
    description: "",
    author: "ping-maxwell",
    authorAvatar: "",
    timeAgo: "1h ago",
    issueNumber: 2446,
  },
];

export const mockTabs: Tab[] = [
  { name: "Overview", active: true },
  { name: "Code" },
  { name: "Commits" },
  { name: "PRs", count: 355 },
  { name: "Issues", count: 297 },
  { name: "Prompts", count: 4 },
  { name: "People" },
  { name: "Actions" },
  { name: "Security" },
  { name: "Activity" },
  { name: "Insights" },
  { name: "Settings" },
];

// Generate heatmap data: 7 rows (days) x 16 columns (weeks)
// Values 0-4 representing activity intensity
export const mockHeatmapData: number[][] = Array.from({ length: 16 }, () =>
  Array.from({ length: 7 }, () => {
    const rand = Math.random();
    if (rand < 0.2) return 0;
    if (rand < 0.4) return 1;
    if (rand < 0.6) return 2;
    if (rand < 0.8) return 3;
    return 4;
  })
);

export const mockHighlightedActivity = {
  number: 2446,
  title: "API Key owned by Organization",
  author: "anaclumos",
  type: "issue" as const,
  comments: 19,
};
