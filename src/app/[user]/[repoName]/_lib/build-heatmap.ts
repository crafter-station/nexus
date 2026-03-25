import type { CommitActivityWeek } from "@/lib/github-cache";

export const HEATMAP_WEEKS = 16;

const MS_DAY = 86_400_000;

function utcDayStartMs(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function startOfWeekSundayMs(t: number): number {
  const day = utcDayStartMs(t);
  const dow = new Date(day).getUTCDay();
  return day - dow * MS_DAY;
}

function countsToIntensityLevels(counts: number[]): number[] {
  const max = Math.max(...counts, 0);
  if (max === 0) return counts.map(() => 0);
  return counts.map((c) => {
    if (c === 0) return 0;
    const level = Math.ceil((c / max) * 4);
    return Math.min(4, Math.max(1, level));
  });
}

function emptyWeek(): number[] {
  return [0, 0, 0, 0, 0, 0, 0];
}

/** Row index 0–6 = GitHub day index Sun–Sat; week is Sunday 00:00 UTC. */
function formatHeatmapCellDateUtc(weekStartSec: number, rowSunFirst: number): string {
  if (weekStartSec <= 0 || rowSunFirst < 0 || rowSunFirst > 6) {
    return "—";
  }
  const ms = weekStartSec * 1000 + rowSunFirst * MS_DAY;
  return new Date(ms).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function buildCellDateLabels(padded: CommitActivityWeek[]): string[][] {
  const out: string[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const week = padded[w];
    const sec = week?.week ?? 0;
    const row: string[] = [];
    for (let di = 0; di < 7; di++) {
      row.push(formatHeatmapCellDateUtc(sec, di));
    }
    out.push(row);
  }
  return out;
}

/** Same 16-week window as the heatmap, for empty-data case (still show calendar in tooltips). */
function syntheticPaddedWeeksForLabels(): CommitActivityWeek[] {
  const now = Date.now();
  const currentSunday = startOfWeekSundayMs(now);
  const oldestSunday = currentSunday - (HEATMAP_WEEKS - 1) * 7 * MS_DAY;
  return Array.from({ length: HEATMAP_WEEKS }, (_, i) => {
    const weekStart = oldestSunday + i * 7 * MS_DAY;
    return {
      week: Math.floor(weekStart / 1000),
      total: 0,
      days: [0, 0, 0, 0, 0, 0, 0],
    };
  });
}

/**
 * Builds weekly buckets (GitHub shape: days Sun–Sat) for the last HEATMAP_WEEKS
 * from commit author/committer timestamps. Used when /stats/commit_activity is empty.
 */
export function commitActivityWeeksFromAuthorDates(
  isoDates: string[],
): CommitActivityWeek[] {
  const now = Date.now();
  const currentSunday = startOfWeekSundayMs(now);
  const oldestSunday = currentSunday - (HEATMAP_WEEKS - 1) * 7 * MS_DAY;

  const weeks: CommitActivityWeek[] = [];
  for (let i = 0; i < HEATMAP_WEEKS; i++) {
    const weekStart = oldestSunday + i * 7 * MS_DAY;
    weeks.push({
      week: Math.floor(weekStart / 1000),
      total: 0,
      days: [0, 0, 0, 0, 0, 0, 0],
    });
  }

  for (const iso of isoDates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) continue;
    const ws = startOfWeekSundayMs(t);
    if (ws < oldestSunday || ws > currentSunday) continue;
    const idx = Math.floor((ws - oldestSunday) / (7 * MS_DAY) + 1e-9);
    if (idx < 0 || idx >= HEATMAP_WEEKS) continue;
    const dayIdx = (utcDayStartMs(t) - ws) / MS_DAY;
    if (dayIdx < 0 || dayIdx > 6 || !Number.isInteger(dayIdx)) continue;
    const w = weeks[idx]!;
    w.days[dayIdx]++;
    w.total++;
  }

  return weeks;
}

export interface RepoActivityHeatmap {
  levels: number[][];
  dayCounts: number[][];
  /** Same shape as levels: día + mes (UTC) per cell for tooltips */
  cellDateLabels: string[][];
  totalCommits: number;
}

/**
 * Builds a 16×7 grid: each column is a week, rows Sun–Sat (top to bottom, GitHub order).
 */
export function buildRepoActivityHeatmap(
  stats: CommitActivityWeek[] | null,
): RepoActivityHeatmap {
  if (!stats?.length) {
    const padded = syntheticPaddedWeeksForLabels();
    return {
      levels: Array.from({ length: HEATMAP_WEEKS }, () => emptyWeek()),
      dayCounts: Array.from({ length: HEATMAP_WEEKS }, () => emptyWeek()),
      cellDateLabels: buildCellDateLabels(padded),
      totalCommits: 0,
    };
  }

  const windowStats = stats.slice(-HEATMAP_WEEKS);
  const totalCommits = windowStats.reduce((sum, w) => sum + w.total, 0);

  const pad = HEATMAP_WEEKS - windowStats.length;
  const padded: CommitActivityWeek[] =
    pad > 0
      ? [
          ...Array.from({ length: pad }, () => ({
            week: 0,
            total: 0,
            days: [0, 0, 0, 0, 0, 0, 0],
          })),
          ...windowStats,
        ]
      : windowStats;

  const flatCounts = padded.flatMap((w) => [...w.days]);
  const levelsFlat = countsToIntensityLevels(flatCounts);

  const levels: number[][] = [];
  const dayCounts: number[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const start = w * 7;
    dayCounts.push(flatCounts.slice(start, start + 7));
    levels.push(levelsFlat.slice(start, start + 7));
  }

  const cellDateLabels = buildCellDateLabels(padded);

  return { levels, dayCounts, cellDateLabels, totalCommits };
}
