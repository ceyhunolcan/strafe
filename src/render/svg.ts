// ─── src/render/svg.ts ────────────────────────────────────────────────
//
// Assembles the final animated SVG document.
// Evening 7 (Fleet Combat v2 — Phase 1): renders five ships in waves.
//
// Main combat (raider + guardian on serpentine) drives cell destruction
// and restoration. Three additional atmosphere ships fly through during
// staggered windows for cinematic effect.
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

export function renderSvg(grid: Grid): string {
  const { width, height } = gridDimensions(grid);

  const cells = renderGrid(grid);
  const labels = renderDayLabels();

  // Main serpentine — the path that drives cell destruction/restoration
  const main = buildMainSerpentine(grid);
  const loopMs = loopDurationMs(main.totalSteps);

  // Build all 5 ship plans (2 main + 3 atmosphere combatants)
  const plans = buildShipPlans(grid, main.svgPath, loopMs, GUARDIAN_LAG_MS);
  const ships = renderShips(plans, loopMs);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Animated contribution graph — fleet combat scene">
  ${SPRITE_DEFS}

  <rect width="${width}" height="${height}" fill="${COLORS.background}" />

  ${labels}

  ${cells}

  ${ships}
</svg>`;
}
