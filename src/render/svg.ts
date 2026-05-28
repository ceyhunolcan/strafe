// ─── src/render/svg.ts ────────────────────────────────────────────────
//
// Final animated SVG assembler.
// Evening 8: now includes ship-to-ship laser tracers in addition to
// the multi-ship motion and per-cell destruction system.
//
// Render order (later = on top):
//   1. Background
//   2. Day labels
//   3. Cells (with their own per-cell laser beams)
//   4. Ships
//   5. Ship-to-ship laser tracers (on top of everything)
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import {
  renderGrid,
  renderDayLabels,
  gridDimensions,
  COLORS,
} from "./grid.js";
import { SPRITE_DEFS, renderShips } from "./sprites.js";
import { GUARDIAN_LAG_MS, loopDurationMs } from "./animation.js";
import { buildMainSerpentine, buildShipPlans } from "./paths.js";
import { renderLasers } from "./lasers.js";

export function renderSvg(grid: Grid): string {
  const { width, height } = gridDimensions(grid);

  const cells = renderGrid(grid);
  const labels = renderDayLabels();

  const main = buildMainSerpentine(grid);
  const loopMs = loopDurationMs(main.totalSteps);

  const plans = buildShipPlans(grid, main.svgPath, loopMs, GUARDIAN_LAG_MS);
  const ships = renderShips(plans, loopMs);
  const lasers = renderLasers(width, height, loopMs);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Animated contribution graph — fleet combat with laser fire">
  ${SPRITE_DEFS}

  <rect width="${width}" height="${height}" fill="${COLORS.background}" />

  ${labels}

  ${cells}

  ${ships}

  ${lasers}
</svg>`;
}
