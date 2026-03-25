import { Octokit } from "@octokit/rest";
import type { CommitActivityWeek } from "./github-cache";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function fetchRepo(owner: string, repo: string) {
  const { data } = await octokit.repos.get({ owner, repo });
  return data;
}

export async function fetchIssues(owner: string, repo: string) {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "open",
    per_page: 30,
    sort: "created",
    direction: "desc",
  });
  // Filter out pull requests (GitHub API returns PRs in issues endpoint)
  return data.filter((issue) => !issue.pull_request);
}

export async function fetchPullRequests(owner: string, repo: string) {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 30,
    sort: "created",
    direction: "desc",
  });
  return data;
}

export async function fetchContributors(owner: string, repo: string) {
  const { data } = await octokit.repos.listContributors({
    owner,
    repo,
    per_page: 30,
  });
  return data;
}

export async function fetchEvents(owner: string, repo: string) {
  const { data } = await octokit.activity.listRepoEvents({
    owner,
    repo,
    per_page: 30,
  });
  return data;
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function statsErrorStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "status" in e) {
    const s = (e as { status?: number }).status;
    return typeof s === "number" ? s : undefined;
  }
  return undefined;
}

/**
 * Last ~52 weeks of per-day commit counts (GitHub: `days` are Sun–Sat).
 * Often returns 202 or [] while stats are computed — retry, then use listCommits fallback.
 */
export async function fetchCommitActivityStats(
  owner: string,
  repo: string,
): Promise<CommitActivityWeek[] | null> {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await octokit.request(
        "GET /repos/{owner}/{repo}/stats/commit_activity",
        { owner, repo },
      );
      if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
        return res.data as CommitActivityWeek[];
      }
      await delay(2500);
    } catch (e) {
      const st = statsErrorStatus(e);
      if (st === 202) {
        await delay(2500);
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Commits since `sinceWeeksAgo` (author/committer dates) for heatmap fallback.
 */
export async function fetchCommitAuthorDatesForHeatmap(
  owner: string,
  repo: string,
  sinceWeeksAgo: number,
): Promise<string[]> {
  const since = new Date(
    Date.now() - sinceWeeksAgo * 7 * 86_400_000,
  ).toISOString();
  const dates: string[] = [];
  let page = 1;
  try {
    for (;;) {
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 100,
        page,
        since,
      });
      if (!data.length) break;
      for (const c of data) {
        const d = c.commit.author?.date ?? c.commit.committer?.date;
        if (typeof d === "string") dates.push(d);
      }
      if (data.length < 100) break;
      page += 1;
      if (page > 40) break;
    }
  } catch {
    return dates;
  }
  return dates;
}
