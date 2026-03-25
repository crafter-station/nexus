import { cache } from "react";
import {
  fetchCommitActivityStats,
  fetchCommitAuthorDatesForHeatmap,
  fetchContributors,
  fetchEvents,
  fetchIssues,
  fetchPullRequests,
  fetchRepo,
} from "@/lib/github";
import {
  getRepo,
  getRepoCommitActivity,
  getRepoContributorAvatars,
  getRepoContributors,
  getRepoEvents,
  getRepoIssues,
  getRepoNavCounts,
  getRepoPullRequests,
  setRepo,
  setRepoCommitActivity,
  setRepoContributors,
  setRepoEvents,
  setRepoIssues,
  setRepoPullRequests,
  type CommitActivityWeek,
  type ContributorAvatarsData,
  type GitHubContributor,
  type GitHubEvent,
  type GitHubIssue,
  type GitHubPullRequest,
  type GitHubRepository,
  type RepoNavCounts,
} from "@/lib/github-cache";
import {
  HEATMAP_WEEKS,
  buildRepoActivityHeatmap,
  commitActivityWeeksFromAuthorDates,
  type RepoActivityHeatmap,
} from "./build-heatmap";

export interface RepoPageData {
  repo: GitHubRepository | null;
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  contributors: GitHubContributor[];
  contributorAvatars: ContributorAvatarsData | null;
  navCounts: RepoNavCounts | null;
  events: GitHubEvent[];
  activityHeatmap: RepoActivityHeatmap;
}

/**
 * Fetch all data needed for the repo overview page.
 * Reads from Redis first; on cache miss, fetches from GitHub API
 * and writes back to Redis in the background.
 *
 * Wrapped in `cache()` so layout + page in the same request share one run.
 */
export const getRepoPageData = cache(async function getRepoPageData(
  owner: string,
  repoName: string,
): Promise<RepoPageData> {
  // TODO: get userId from auth session
  const userId = "default";

  // 1. Read from Redis cache
  const [
    repoEntry,
    issuesEntry,
    prsEntry,
    contributorsEntry,
    avatarsEntry,
    navCountsEntry,
    eventsEntry,
    commitActivityEntry,
  ] = await Promise.all([
    getRepo(userId, owner, repoName),
    getRepoIssues(owner, repoName),
    getRepoPullRequests(owner, repoName),
    getRepoContributors(owner, repoName),
    getRepoContributorAvatars(owner, repoName),
    getRepoNavCounts(owner, repoName),
    getRepoEvents(owner, repoName),
    getRepoCommitActivity(owner, repoName),
  ]);

  let repo = repoEntry?.data ?? null;
  let issues = issuesEntry?.data ?? [];
  let pullRequests = prsEntry?.data ?? [];
  let contributors = contributorsEntry?.data ?? [];
  let events = eventsEntry?.data ?? [];
  let commitActivity = commitActivityEntry?.data ?? null;
  const hasUsableCommitCache =
    Array.isArray(commitActivity) && commitActivity.length > 0;
  const contributorAvatars = avatarsEntry?.data ?? null;
  const navCounts = navCountsEntry?.data ?? null;

  // 2. Fetch from GitHub API on cache miss
  const fetches: Promise<void>[] = [];

  // Always refresh repo metadata (stargazers_count, forks, etc.); stale Redis
  // would otherwise show 0 stars after the repo gains stars.
  fetches.push(
    fetchRepo(owner, repoName)
      .then((data) => {
        repo = data;
        setRepo(userId, owner, repoName, data).catch(() => {});
      })
      .catch(() => {}),
  );

  if (issues.length === 0 && !issuesEntry) {
    fetches.push(
      fetchIssues(owner, repoName)
        .then((data) => {
          issues = data;
          setRepoIssues(owner, repoName, data).catch(() => {});
        })
        .catch(() => {}),
    );
  }

  if (pullRequests.length === 0 && !prsEntry) {
    fetches.push(
      fetchPullRequests(owner, repoName)
        .then((data) => {
          pullRequests = data;
          setRepoPullRequests(owner, repoName, data).catch(() => {});
        })
        .catch(() => {}),
    );
  }

  if (contributors.length === 0 && !contributorsEntry) {
    fetches.push(
      fetchContributors(owner, repoName)
        .then((data) => {
          contributors = data;
          setRepoContributors(owner, repoName, data).catch(() => {});
        })
        .catch(() => {}),
    );
  }

  if (events.length === 0 && !eventsEntry) {
    fetches.push(
      fetchEvents(owner, repoName)
        .then((data) => {
          events = data;
          setRepoEvents(owner, repoName, data).catch(() => {});
        })
        .catch(() => {}),
    );
  }

  if (!commitActivityEntry || !hasUsableCommitCache) {
    fetches.push(
      (async () => {
        let rows: CommitActivityWeek[] | null =
          await fetchCommitActivityStats(owner, repoName);
        if (!rows?.length) {
          const dates = await fetchCommitAuthorDatesForHeatmap(
            owner,
            repoName,
            HEATMAP_WEEKS + 2,
          );
          rows = commitActivityWeeksFromAuthorDates(dates);
        }
        const finalRows = rows ?? [];
        commitActivity = finalRows;
        await setRepoCommitActivity(owner, repoName, finalRows).catch(() => {});
      })().catch(() => {}),
    );
  }

  // Wait for all API fetches to complete before rendering
  if (fetches.length > 0) {
    await Promise.all(fetches);
  }

  console.log("repo", repo);
  console.log("issues", issues);
  console.log("pullRequests", pullRequests);
  console.log("contributors", contributors);
  console.log("contributorAvatars", contributorAvatars);
  console.log("navCounts", navCounts);
  console.log("events", events);

  const activityHeatmap = buildRepoActivityHeatmap(commitActivity);

  return {
    repo,
    issues,
    pullRequests,
    contributors,
    contributorAvatars,
    navCounts,
    events,
    activityHeatmap,
  };
});
