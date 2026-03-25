import {
  getRepo,
  getRepoIssues,
  getRepoPullRequests,
  getRepoContributors,
  getRepoContributorAvatars,
  getRepoNavCounts,
  setRepo,
  setRepoIssues,
  setRepoPullRequests,
  setRepoContributors,
  type GitHubRepository,
  type GitHubIssue,
  type GitHubPullRequest,
  type GitHubContributor,
  type ContributorAvatarsData,
  type RepoNavCounts,
} from "@/lib/github-cache";
import {
  fetchRepo,
  fetchIssues,
  fetchPullRequests,
  fetchContributors,
} from "@/lib/github";

export interface RepoPageData {
  repo: GitHubRepository | null;
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  contributors: GitHubContributor[];
  contributorAvatars: ContributorAvatarsData | null;
  navCounts: RepoNavCounts | null;
}

/**
 * Fetch all data needed for the repo overview page.
 * Reads from Redis first; on cache miss, fetches from GitHub API
 * and writes back to Redis in the background.
 */
export async function getRepoPageData(
  owner: string,
  repoName: string
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
  ] = await Promise.all([
    getRepo(userId, owner, repoName),
    getRepoIssues(owner, repoName),
    getRepoPullRequests(owner, repoName),
    getRepoContributors(owner, repoName),
    getRepoContributorAvatars(owner, repoName),
    getRepoNavCounts(owner, repoName),
  ]);

  let repo = repoEntry?.data ?? null;
  let issues = issuesEntry?.data ?? [];
  let pullRequests = prsEntry?.data ?? [];
  let contributors = contributorsEntry?.data ?? [];
  const contributorAvatars = avatarsEntry?.data ?? null;
  const navCounts = navCountsEntry?.data ?? null;

  // 2. Fetch from GitHub API on cache miss
  const fetches: Promise<void>[] = [];

  if (!repo) {
    fetches.push(
      fetchRepo(owner, repoName)
        .then((data) => {
          repo = data;
          // Fire-and-forget: cache in background
          setRepo(userId, owner, repoName, data).catch(() => {});
        })
        .catch(() => {})
    );
  }

  if (issues.length === 0 && !issuesEntry) {
    fetches.push(
      fetchIssues(owner, repoName)
        .then((data) => {
          issues = data;
          setRepoIssues(owner, repoName, data).catch(() => {});
        })
        .catch(() => {})
    );
  }

  if (pullRequests.length === 0 && !prsEntry) {
    fetches.push(
      fetchPullRequests(owner, repoName)
        .then((data) => {
          pullRequests = data;
          setRepoPullRequests(owner, repoName, data).catch(() => {});
        })
        .catch(() => {})
    );
  }

  if (contributors.length === 0 && !contributorsEntry) {
    fetches.push(
      fetchContributors(owner, repoName)
        .then((data) => {
          contributors = data;
          setRepoContributors(owner, repoName, data).catch(() => {});
        })
        .catch(() => {})
    );
  }

  // Wait for all API fetches to complete before rendering
  if (fetches.length > 0) {
    await Promise.all(fetches);
  }

  return {
    repo,
    issues,
    pullRequests,
    contributors,
    contributorAvatars,
    navCounts,
  };
}
