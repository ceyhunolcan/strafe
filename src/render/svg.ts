// ─── src/render/svg.ts ────────────────────────────────────────────────
//
// Assembles the final SVG document.
// Now includes:
//   - Background + grid cells (Evening 2)
//   - Day-of-week labels (Evening 2)
//   - Serpentine path visualization (Evening 3, debug — temporary)
//   - Fighter sprite at the starting position (Evening 3)
//
// Layering matters in SVG: things drawn later appear ON TOP.
// Order: background → labels → cells → path debug → fighter
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import {
  renderGrid,
  renderDayLabels,
  gridDimensions,
  COLORS,
} from "./grid.js";
import { SPRITE_DEFS, renderFighter } from "./sprites.js";
import {
  serpentinePath,
  cellCenter,
  angleForStep,
  renderPathDebug,
} from "./path.js";

/**
 * Render a complete SVG document for the given contribution grid.
 *
 * @param grid - The contribution data fetched from GitHub
 * @returns A self-contained SVG string ready to write to disk
 */
export function renderSvg(grid: Grid): string {
  const { width, height } = gridDimensions(grid);

  // Static pieces (unchanged from Evening 2)
  const cells = renderGrid(grid);
  const labels = renderDayLabels();

  // Compute the strafe path through the grid
  const numWeeks = grid.cells[0].length;
  const numDays = grid.cells.length;
  const path = serpentinePath(numWeeks, numDays);

  // Debug: visualize the path as a faint dashed polyline
  const pathDebug = renderPathDebug(path);

  // Place the fighter at the starting cell, facing right
  const start = path[0];
  const startPos = cellCenter(start.week, start.day);
  const startAngle = angleForStep(0, numWeeks);
  const fighter = renderFighter(startPos.x, startPos.y, startAngle);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Contribution graph with strafe path">
  ${SPRITE_DEFS}

  <rect width="${width}" height="${height}" fill="${COLORS.background}" />

  ${labels}

  ${cells}

  ${pathDebug}

  ${fighter}
</svg>`;
}
