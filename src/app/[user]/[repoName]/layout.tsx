import Header from "./_components/header";
import RepoLayoutWrapper from "./_components/repo-layout-wrapper";
import Sidebar from "./_components/sidebar";
import { getRepoPageData } from "./_lib/get-repo-data";
import {
  clampSidebarWidth,
  DEFAULT_WIDTH,
  REPO_SIDEBAR_COOKIE,
} from "./_lib/repo-sidebar-persistence";
import { cookies } from "next/headers";

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ user: string; repoName: string }>;
}) {
  const { user, repoName } = await params;
  const cookieStore = await cookies();
  const rawSidebarState = cookieStore.get(REPO_SIDEBAR_COOKIE)?.value;
  let initialCollapsed = false;
  let initialWidth = DEFAULT_WIDTH;

  if (rawSidebarState) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawSidebarState)) as {
        collapsed?: boolean;
        width?: number;
      };
      initialCollapsed = Boolean(parsed.collapsed);
      if (typeof parsed.width === "number" && Number.isFinite(parsed.width)) {
        initialWidth = clampSidebarWidth(parsed.width);
      }
    } catch {
      initialCollapsed = false;
      initialWidth = DEFAULT_WIDTH;
    }
  }

  const { repo, contributors, contributorAvatars, latestCommit } =
    await getRepoPageData(user, repoName);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RepoLayoutWrapper
        initialCollapsed={initialCollapsed}
        initialWidth={initialWidth}
        sidebar={
          repo ? (
            <Sidebar
              user={user}
              repoName={repoName}
              repo={repo}
              contributors={contributors}
              contributorAvatars={contributorAvatars}
              latestCommit={latestCommit}
            />
          ) : (
            <div className="text-muted text-sm">Repository not found in cache.</div>
          )
        }
      >
        {children}
      </RepoLayoutWrapper>
    </div>
  );
}
