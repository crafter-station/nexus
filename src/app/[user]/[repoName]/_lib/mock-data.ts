// Generate heatmap data: 7 rows (days) x 16 columns (weeks)
// Values 0-4 representing activity intensity
export const mockHeatmapData: number[][] = Array.from({ length: 16 }, () =>
  Array.from({ length: 7 }, () => {
    const rand = Math.random();
    if (rand < 0.2) return 0;
    if (rand < 0.4) return 1;
    if (rand < 0.6) return 2;
    if (rand < 0.8) return 3;
    return 4;
  })
);
