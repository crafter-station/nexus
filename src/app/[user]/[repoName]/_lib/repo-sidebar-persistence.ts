export const REPO_SIDEBAR_COOKIE = "repo_sidebar_state";

export const DEFAULT_WIDTH = 340;
export const MIN_WIDTH = 200;
export const MAX_WIDTH = 400;
export const SNAP_THRESHOLD = 120;

export type RepoSidebarState = {
  collapsed: boolean;
  width: number;
};

export function clampSidebarWidth(width: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}
