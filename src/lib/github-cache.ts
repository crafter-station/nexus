import type { RestEndpointMethodTypes } from "@octokit/rest";
import redis from "./redis";

// ----- Octokit-derived types -----

export type GitHubRepository =
  RestEndpointMethodTypes["repos"]["get"]["response"]["data"];

export type GitHubIssue =
  RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"][number];

export type GitHubPullRequest =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];

export type GitHubContributor =
  RestEndpointMethodTypes["repos"]["listContributors"]["response"]["data"][number];

export type GitHubLanguages =
  RestEndpointMethodTypes["repos"]["listLanguages"]["response"]["data"];

export type GitHubBranch =
  RestEndpointMethodTypes["repos"]["listBranches"]["response"]["data"][number];

export type GitHubTag =
  RestEndpointMethodTypes["repos"]["listTags"]["response"]["data"][number];

export type GitHubRelease =
  RestEndpointMethodTypes["repos"]["listReleases"]["response"]["data"][number];

// Workflows response has a nested `workflows` array
export type GitHubWorkflow =
  RestEndpointMethodTypes["actions"]["listRepoWorkflows"]["response"]["data"]["workflows"][number];

// ----- Custom types (not from Octokit) -----

export interface RepoNavCounts {
  pullRequests: number;
  issues: number;
  actions: number;
  projects: number;
  security: number;
}

export interface FileTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

export interface ContributorAvatarsData {
  contributors: { login: string; avatar_url: string }[];
  total: number;
}

// ----- Generic cache wrapper -----

export interface GithubCacheEntry<T> {
  data: T;
  syncedAt: string;
  etag: string | null;
}

// ----- Key normalization -----

function normalizeRepoKey(owner: string, repo: string): string {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

// ----- Cache key builders -----

function repoBranchesKey(owner: string, repo: string) {
  return `repo_branches:${normalizeRepoKey(owner, repo)}`;
}

function repoTagsKey(owner: string, repo: string) {
  return `repo_tags:${normalizeRepoKey(owner, repo)}`;
}

function repoLanguagesKey(owner: string, repo: string) {
  return `repo_languages:${normalizeRepoKey(owner, repo)}`;
}

function repoReleasesKey(owner: string, repo: string) {
  return `repo_releases:${normalizeRepoKey(owner, repo)}`;
}

function repoIssuesKey(owner: string, repo: string) {
  return `repo_issues:${normalizeRepoKey(owner, repo)}`;
}

function repoPullRequestsKey(owner: string, repo: string) {
  return `repo_pull_requests:${normalizeRepoKey(owner, repo)}`;
}

function repoContributorsKey(owner: string, repo: string) {
  return `repo_contributors:${normalizeRepoKey(owner, repo)}`;
}

function repoWorkflowsKey(owner: string, repo: string) {
  return `repo_workflows:${normalizeRepoKey(owner, repo)}`;
}

function repoNavCountsKey(owner: string, repo: string) {
  return `repo_nav_counts:${normalizeRepoKey(owner, repo)}`;
}

function repoFileTreeKey(owner: string, repo: string) {
  return `repo_file_tree:${normalizeRepoKey(owner, repo)}`;
}

function repoContributorAvatarsKey(owner: string, repo: string) {
  return `repo_contributor_avatars:${normalizeRepoKey(owner, repo)}`;
}

// ----- Generic read/write helpers -----

async function getCacheEntry<T>(key: string): Promise<GithubCacheEntry<T> | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as GithubCacheEntry<T>;
}

async function setCacheEntry<T>(
  key: string,
  data: T,
  ttlSeconds?: number,
  etag?: string | null
): Promise<void> {
  const entry: GithubCacheEntry<T> = {
    data,
    syncedAt: new Date().toISOString(),
    etag: etag ?? null,
  };
  if (ttlSeconds) {
    await redis.set(key, JSON.stringify(entry), "EX", ttlSeconds);
  } else {
    await redis.set(key, JSON.stringify(entry));
  }
}

// ----- Public API -----

/**
 * Fetch the repo object cached for a specific user.
 * Key: gh:<userId>:repo:owner/repo
 */
export async function getRepo(userId: string, owner: string, repo: string) {
  const key = `gh:${userId}:repo:${normalizeRepoKey(owner, repo)}`;
  return getCacheEntry<GitHubRepository>(key);
}

export async function getRepoBranches(owner: string, repo: string) {
  return getCacheEntry<GitHubBranch[]>(repoBranchesKey(owner, repo));
}

export async function getRepoTags(owner: string, repo: string) {
  return getCacheEntry<GitHubTag[]>(repoTagsKey(owner, repo));
}

export async function getRepoLanguages(owner: string, repo: string) {
  return getCacheEntry<GitHubLanguages>(repoLanguagesKey(owner, repo));
}

export async function getRepoReleases(owner: string, repo: string) {
  return getCacheEntry<GitHubRelease[]>(repoReleasesKey(owner, repo));
}

export async function getRepoIssues(owner: string, repo: string) {
  return getCacheEntry<GitHubIssue[]>(repoIssuesKey(owner, repo));
}

export async function getRepoPullRequests(owner: string, repo: string) {
  return getCacheEntry<GitHubPullRequest[]>(repoPullRequestsKey(owner, repo));
}

export async function getRepoContributors(owner: string, repo: string) {
  return getCacheEntry<GitHubContributor[]>(repoContributorsKey(owner, repo));
}

export async function getRepoWorkflows(owner: string, repo: string) {
  return getCacheEntry<GitHubWorkflow[]>(repoWorkflowsKey(owner, repo));
}

export async function getRepoNavCounts(owner: string, repo: string) {
  return getCacheEntry<RepoNavCounts>(repoNavCountsKey(owner, repo));
}

export async function getRepoFileTree(owner: string, repo: string) {
  return getCacheEntry<FileTreeEntry[]>(repoFileTreeKey(owner, repo));
}

export async function getRepoContributorAvatars(owner: string, repo: string) {
  return getCacheEntry<ContributorAvatarsData>(repoContributorAvatarsKey(owner, repo));
}

// ----- Public setters -----

export async function setRepo(
  userId: string,
  owner: string,
  repo: string,
  data: GitHubRepository
) {
  const key = `gh:${userId}:repo:${normalizeRepoKey(owner, repo)}`;
  return setCacheEntry(key, data);
}

export async function setRepoIssues(
  owner: string,
  repo: string,
  data: GitHubIssue[]
) {
  return setCacheEntry(repoIssuesKey(owner, repo), data, 300); // 5min TTL
}

export async function setRepoPullRequests(
  owner: string,
  repo: string,
  data: GitHubPullRequest[]
) {
  return setCacheEntry(repoPullRequestsKey(owner, repo), data, 300); // 5min TTL
}

export async function setRepoContributors(
  owner: string,
  repo: string,
  data: GitHubContributor[]
) {
  return setCacheEntry(repoContributorsKey(owner, repo), data);
}
