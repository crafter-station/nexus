import { getRepoPageData } from "./_lib/get-repo-data";
import { mockActivityFeed, mockHeatmapData } from "./_lib/mock-data";
import TabNavigation from "./_components/tab-navigation";
import StatsRow from "./_components/stats-row";
import HighlightedActivity from "./_components/highlighted-activity";
import ActivityHeatmap from "./_components/activity-heatmap";
import ActivityFeed from "./_components/activity-feed";
import OpenPRs from "./_components/open-prs";
import OpenIssues from "./_components/open-issues";
import type { Tab } from "./_lib/types";

export default async function RepoPage({
  params,
}: {
  params: Promise<{ user: string; repoName: string }>;
}) {
  const { user, repoName } = await params;
  const { repo, issues, pullRequests, navCounts } = await getRepoPageData(
    user,
    repoName
  );

  const prCount = navCounts?.pullRequests ?? pullRequests.length;
  const issueCount = navCounts?.issues ?? issues.length;

  const tabs: Tab[] = [
    { name: "Overview", active: true },
    { name: "Code" },
    { name: "Commits" },
    { name: "PRs", count: prCount },
    { name: "Issues", count: issueCount },
    { name: "Prompts" },
    { name: "People" },
    { name: "Actions" },
    { name: "Security" },
    { name: "Activity" },
    { name: "Insights" },
    { name: "Settings" },
  ];

  const statsData = {
    stars: repo?.stargazers_count ?? 0,
    forks: repo?.forks_count ?? 0,
    watchers: repo?.watchers_count ?? 0,
    openPRs: prCount,
    openIssues: issueCount,
  };

  // Use the first issue as highlighted activity if available
  const highlighted = issues[0] ?? null;

  return (
    <div className="flex-1 flex flex-col">
      <TabNavigation tabs={tabs} />

      <div className="p-6 space-y-6 flex-1">
        {/* Stats row */}
        <StatsRow data={statsData} />

        {/* Highlighted activity */}
        {highlighted && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <HighlightedActivity issue={highlighted} />
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <div className="w-6 h-1.5 rounded-full bg-foreground" />
              <div className="w-1.5 h-1.5 rounded-full bg-subtle" />
              <div className="w-1.5 h-1.5 rounded-full bg-subtle" />
              <div className="w-1.5 h-1.5 rounded-full bg-subtle" />
              <div className="w-1.5 h-1.5 rounded-full bg-subtle" />
            </div>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Activity */}
          <div className="space-y-6">
            <ActivityHeatmap data={mockHeatmapData} />
            <ActivityFeed items={mockActivityFeed} />
          </div>

          {/* Middle column: Open PRs */}
          <div>
            <OpenPRs pullRequests={pullRequests} />
          </div>

          {/* Right column: Open Issues */}
          <div>
            <OpenIssues issues={issues} />
          </div>
        </div>
      </div>
    </div>
  );
}
