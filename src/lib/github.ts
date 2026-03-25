import { Octokit } from "@octokit/rest";

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
