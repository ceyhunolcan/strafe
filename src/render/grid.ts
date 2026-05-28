// ─── src/render/grid.ts ───────────────────────────────────────────────
//
// Renders the contribution grid as SVG rectangles.
// Takes the Grid we fetched in Evening 1 and produces a string of
// <rect> elements representing every cell, plus geometry helpers
// the rest of the program will use for sprite positioning.
//
// Geometry note: we work in two coordinate spaces.
//   - "cell coordinates" — (week, day) integer pairs, useful for game logic
//   - "pixel coordinates" — actual SVG x/y in viewBox units
// The functions `cellToPixel` and `pixelToCell` bridge between them.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";

// ─── Geometry constants ────────────────────────────────────────────────
// These mirror GitHub's own contribution graph styling.

export const CELL_SIZE = 10;       // each cell is 10x10 px
export const CELL_GAP = 3;         // 3px between cells
export const CELL_RADIUS = 2;      // rounded corner radius
export const CELL_STRIDE = CELL_SIZE + CELL_GAP;  // 13px = how far the next cell sits

export const GRID_PAD_LEFT = 30;   // left padding (room for day labels later)
export const GRID_PAD_TOP = 20;    // top padding (room for month labels later)
export const GRID_PAD_RIGHT = 10;
export const GRID_PAD_BOTTOM = 10;

// ─── Color palette ─────────────────────────────────────────────────────
// GitHub's official dark-theme contribution colors.

export const COLORS = {
  background: "#0D1117",
  level0: "#161B22",   // empty cell
  level1: "#0E4429",
  level2: "#006D32",
  level3: "#26A641",
  level4: "#39D353",
  text: "#7D8590",     // for any labels
} as const;

/**
 * Convert a (week, day) cell index to its top-left pixel coordinate.
 * Used both for rendering and for sprite positioning later.
 */
export function cellToPixel(week: number, day: number): { x: number; y: number } {
  return {
    x: GRID_PAD_LEFT + week * CELL_STRIDE,
    y: GRID_PAD_TOP + day * CELL_STRIDE,
  };
}

/**
 * Compute the full SVG viewBox dimensions for a given grid.
 */
export function gridDimensions(grid: Grid): { width: number; height: number } {
  const weeks = grid.cells[0].length;
  const days = grid.cells.length;
  return {
    width: GRID_PAD_LEFT + weeks * CELL_STRIDE + GRID_PAD_RIGHT - CELL_GAP,
    height: GRID_PAD_TOP + days * CELL_STRIDE + GRID_PAD_BOTTOM - CELL_GAP,
  };
}

/**
 * Render a single cell as an SVG <rect> string.
 * The `id` lets us target individual cells with animations later.
 */
function renderCell(week: number, day: number, level: 0 | 1 | 2 | 3 | 4): string {
  const { x, y } = cellToPixel(week, day);
  const fill =
    level === 0 ? COLORS.level0 :
    level === 1 ? COLORS.level1 :
    level === 2 ? COLORS.level2 :
    level === 3 ? COLORS.level3 :
                  COLORS.level4;

  // The id format "cell-{week}-{day}" lets us address each cell uniquely.
  return `<rect id="cell-${week}-${day}" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${fill}" />`;
}

/**
 * Render the entire grid as a single string of <rect> elements.
 * Returns just the cells — the surrounding <svg> wrapper comes later.
 */
export function renderGrid(grid: Grid): string {
  const cells: string[] = [];

  for (let day = 0; day < grid.cells.length; day++) {
    for (let week = 0; week < grid.cells[day].length; week++) {
      const cell = grid.cells[day][week];
      cells.push(renderCell(week, day, cell.level));
    }
  }

  // Wrap in a <g> so the cells can be styled or targeted as a group.
  return `<g class="cells">\n  ${cells.join("\n  ")}\n</g>`;
}

/**
 * Render the day-of-week labels on the left side of the grid.
 * Only Mon, Wed, Fri are shown — matches GitHub's own labeling.
 */
export function renderDayLabels(): string {
  const labels = [
    { day: 1, text: "Mon" },
    { day: 3, text: "Wed" },
    { day: 5, text: "Fri" },
  ];

  return labels
    .map(({ day, text }) => {
      const { y } = cellToPixel(0, day);
      // Position labels just to the left of the first cell column.
      return `<text x="${GRID_PAD_LEFT - 6}" y="${y + CELL_SIZE - 1}" text-anchor="end" font-family="ui-monospace, monospace" font-size="9" fill="${COLORS.text}">${text}</text>`;
    })
    .join("\n  ");
}
