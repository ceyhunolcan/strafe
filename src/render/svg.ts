// ─── src/render/svg.ts ────────────────────────────────────────────────
//
// Assembles the final animated SVG document.
// Evening 4: fighter now flies the path, cells explode on impact,
// debug polyline removed.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import {
  renderGrid,
  renderDayLabels,
  gridDimensions,
  COLORS,
} from "./grid.js";
import { SPRITE_DEFS, renderAnimatedFighter } from "./sprites.js";
import { serpentinePath, pathToSvgPath } from "./path.js";

export function renderSvg(grid: Grid): string {
  const { width, height } = gridDimensions(grid);

  const cells = renderGrid(grid);
  const labels = renderDayLabels();

  // Compute the strafe path
  const numWeeks = grid.cells[0].length;
  const numDays = grid.cells.length;
  const path = serpentinePath(numWeeks, numDays);
  const svgPath = pathToSvgPath(path);
  const totalSteps = path.length;

  // The fighter flies along the path automatically
  const fighter = renderAnimatedFighter(svgPath, totalSteps);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Animated contribution graph">
  ${SPRITE_DEFS}

  <rect width="${width}" height="${height}" fill="${COLORS.background}" />

  ${labels}

  ${cells}

  ${fighter}
</svg>`;
}
