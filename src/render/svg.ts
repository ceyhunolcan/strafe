// ─── src/render/svg.ts ────────────────────────────────────────────────
//
// Final animated SVG assembler.
// v2.4: renderLasers now takes the Grid directly so it can look up
// ship positions on the serpentine path.
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
import { renderExplosions } from "./explosions.js";

const STARFIELD: Array<[number, number, number, number]> = [
  [28, 4, 0.5, 0.7], [75, 12, 0.7, 0.5], [130, 6, 0.6, 0.75],
  [180, 14, 0.5, 0.55], [210, 3, 0.8, 0.5], [255, 9, 0.5, 0.7],
  [300, 16, 0.6, 0.55], [340, 5, 0.7, 0.65], [385, 11, 0.5, 0.65],
  [425, 17, 0.6, 0.45], [475, 4, 0.8, 0.6], [520, 13, 0.5, 0.7],
  [560, 7, 0.6, 0.55], [605, 15, 0.5, 0.65], [650, 9, 0.7, 0.6],
  [685, 3, 0.5, 0.7],
  [35, 87, 0.6, 0.55], [90, 82, 0.5, 0.7], [145, 88, 0.7, 0.45],
  [195, 83, 0.5, 0.65], [250, 89, 0.6, 0.5], [310, 84, 0.5, 0.6],
  [365, 87, 0.7, 0.55], [415, 81, 0.6, 0.7], [470, 88, 0.5, 0.45],
  [515, 83, 0.6, 0.6], [570, 86, 0.5, 0.55], [620, 82, 0.7, 0.6],
  [665, 89, 0.5, 0.6],
  [12, 25, 0.5, 0.5], [12, 55, 0.6, 0.55],
  [8, 40, 0.4, 0.4], [22, 70, 0.4, 0.5],
  [700, 28, 0.5, 0.55], [700, 50, 0.4, 0.45], [702, 65, 0.5, 0.5],
];

function renderStarfield(): string {
  const stars = STARFIELD
    .map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${o}" />`)
    .join("\n  ");
  return `<g class="stars">\n  ${stars}\n</g>`;
}

const NEBULA_DEFS = `<radialGradient id="nebula-purple" cx="85%" cy="20%" r="40%">
    <stop offset="0%" stop-color="#4B0E5E" stop-opacity="0.35" />
    <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
  </radialGradient>
  <radialGradient id="nebula-teal" cx="15%" cy="85%" r="35%">
    <stop offset="0%" stop-color="#0E5E5E" stop-opacity="0.3" />
    <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
  </radialGradient>`;

export function renderSvg(grid: Grid): string {
  const { width, height } = gridDimensions(grid);

  const cells = renderGrid(grid);
  const labels = renderDayLabels();
  const stars = renderStarfield();

  const main = buildMainSerpentine(grid);
  const loopMs = loopDurationMs(main.totalSteps);

  const plans = buildShipPlans(grid, main.svgPath, loopMs, GUARDIAN_LAG_MS);
  const ships = renderShips(plans, loopMs);
  const lasers = renderLasers(grid, loopMs);
  const explosions = renderExplosions(plans, loopMs);

  const allDefs = SPRITE_DEFS.replace("</defs>", `${NEBULA_DEFS}\n  </defs>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Animated contribution graph — cinematic space combat with ship destruction and permanent cell losses">
  ${allDefs}

  <rect width="${width}" height="${height}" fill="${COLORS.background}" />
  <rect width="${width}" height="${height}" fill="url(#nebula-purple)" />
  <rect width="${width}" height="${height}" fill="url(#nebula-teal)" />

  ${stars}

  ${labels}

  ${cells}

  ${ships}

  ${lasers}

  ${explosions}
</svg>`;
}
