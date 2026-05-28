// ─── src/render/svg.ts ────────────────────────────────────────────────
//
// Assembles the final SVG document.
// Takes the inner content (grid + labels + future ship/lasers/effects)
// and wraps it in a proper <svg> tag with the right viewBox.
//
// Output is a complete, standalone SVG string you can write directly
// to a file and open in any browser.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import {
  renderGrid,
  renderDayLabels,
  gridDimensions,
  COLORS,
} from "./grid.js";

/**
 * Render a complete SVG document for the given contribution grid.
 *
 * @param grid - The contribution data fetched from GitHub
 * @returns A self-contained SVG string ready to write to disk
 */
export function renderSvg(grid: Grid): string {
  const { width, height } = gridDimensions(grid);
  const cells = renderGrid(grid);
  const labels = renderDayLabels();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Contribution graph">
  <rect width="${width}" height="${height}" fill="${COLORS.background}" />

  ${labels}

  ${cells}
</svg>`;
}
