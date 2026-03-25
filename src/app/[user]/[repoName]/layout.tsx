import Header from "./_components/header";
import Sidebar from "./_components/sidebar";
import { getRepoPageData } from "./_lib/get-repo-data";

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ user: string; repoName: string }>;
}) {
  const { user, repoName } = await params;
  const { repo, contributors, contributorAvatars } =
    await getRepoPageData(user, repoName);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden lg:block w-80 shrink-0 border-r border-border-default p-6 overflow-y-auto">
          {repo ? (
            <Sidebar
              user={user}
              repoName={repoName}
              repo={repo}
              contributors={contributors}
              contributorAvatars={contributorAvatars}
            />
          ) : (
            <div className="text-muted text-sm">Repository not found in cache.</div>
          )}
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
