"use client";

import { useState } from "react";
import type { RepoActivityHeatmap } from "../_lib/build-heatmap";

const intensityClasses = [
  "bg-border-muted",
  "bg-success/25",
  "bg-success/45",
  "bg-success/70",
  "bg-success",
];

type ActivityScope = "all" | "mine";

export default function ActivityHeatmap({
  heatmap,
}: {
  heatmap: RepoActivityHeatmap;
}) {
  const { levels: data, dayCounts, cellDateLabels, totalCommits } = heatmap;
  const [scope, setScope] = useState<ActivityScope>("all");
  const [tooltip, setTooltip] = useState<{
    week: number;
    day: number;
    x: number;
    y: number;
  } | null>(null);

  const totalLabel =
    totalCommits >= 1000
      ? `${(totalCommits / 1000).toFixed(1)}k`
      : String(totalCommits);

  return (
    <div className="bg-surface rounded-xl border border-border-default p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
        <div
          className="flex items-center gap-1 text-xs"
          role="tablist"
          aria-label="Activity scope"
        >
          <button
            type="button"
            role="tab"
            aria-selected={scope === "all"}
            onClick={() => setScope("all")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              scope === "all"
                ? "text-foreground font-medium border-b border-accent pb-0.5 rounded-b-none"
                : "text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scope === "mine"}
            aria-disabled
            title="Coming soon: your commits only"
            onClick={() => {
              /* Mine: filter by signed-in user — not implemented yet */
            }}
            className="px-2 py-0.5 rounded-md text-muted opacity-70 hover:opacity-100 cursor-pointer"
          >
            Mine
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted mb-2">
        <span>Commits &middot; {data.length} weeks</span>
        <span>{totalLabel} total</span>
      </div>

      <div className="relative">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${data.length}, 1fr)`,
            gridTemplateRows: "repeat(7, 1fr)",
            gridAutoFlow: "column",
          }}
        >
          {data.map((week, wi) =>
            week.map((val, di) => (
              <div
                key={`${wi}-${di}`}
                className={`aspect-square rounded-sm ${intensityClasses[val]} cursor-pointer transition-opacity hover:opacity-80`}
                style={{ minWidth: "10px", minHeight: "10px" }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    week: wi,
                    day: di,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            )),
          )}
        </div>

        {tooltip && (
          <div
            className="fixed z-50 px-2 py-1.5 bg-foreground text-background text-xs rounded shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 max-w-[200px] text-center leading-snug"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className="block font-medium mt-0.5">
              {dayCounts[tooltip.week]?.[tooltip.day] ?? 0}{" "}
              {dayCounts[tooltip.week]?.[tooltip.day] === 1
                ? "commit"
                : "commits"}
            </span>
            <span className="block text-background/85">
              {cellDateLabels[tooltip.week]?.[tooltip.day] ?? "—"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted">
        <span>Less</span>
        {intensityClasses.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
