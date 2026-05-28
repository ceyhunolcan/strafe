// ─── src/render/paths.ts ──────────────────────────────────────────────
//
// Multi-ship flight paths for Fleet Combat (v2).
//
// Each ship has:
//   - id        : "raider-1", "guardian-1", etc.
//   - svgPath   : a "d" attribute string for <animateMotion path="...">
//   - beginMs   : when the ship enters the scene
//   - duration  : how long the ship is on screen (one traversal)
//   - faction   : "raider" or "guardian"
//
// The MAIN raider flies the serpentine path (the same one that
// destroys/restores cells in grid.ts). All other ships are
// "atmosphere combatants" — they fly through without altering cells.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import { gridDimensions } from "./grid.js";
import { serpentinePath, pathToSvgPath } from "./path.js";

export type Faction = "raider" | "guardian";

export type ShipPlan = {
  id: string;
  faction: Faction;
  svgPath: string;
  beginMs: number;
  durationMs: number;
};

/**
 * Build the full set of ship plans for the scene.
 *
 * Layout intent (looking at the grid in landscape):
 *   - "Main raider" flies the serpentine, destroys cells.
 *   - "Main guardian" flies the serpentine, trails main raider, restores cells.
 *   - "Raider wing" flies a high-altitude curve, left to right, near top.
 *   - "Raider strike" enters mid-right, swoops diagonally down-left.
 *   - "Guardian intercept" enters left, flies a curved interception path.
 *
 * Entry timing (waves):
 *   t=0s     main raider, main guardian (existing two) start
 *   t=4s     raider wing enters from right
 *   t=12s    raider strike enters from top-right
 *   t=16s    guardian intercept enters from left
 *
 * @param grid - the contribution grid (for dimensions)
 * @param mainSerpentinePath - the d-attribute for the main serpentine
 * @param mainDurationMs - how long the main ships take to traverse
 */
export function buildShipPlans(
  grid: Grid,
  mainSerpentinePath: string,
  mainDurationMs: number,
  guardianLagMs: number
): ShipPlan[] {
  const { width, height } = gridDimensions(grid);
  const plans: ShipPlan[] = [];

  // ─── Main combat (existing serpentine — unchanged) ──────────────────

  plans.push({
    id: "raider-main",
    faction: "raider",
    svgPath: mainSerpentinePath,
    beginMs: 0,
    durationMs: mainDurationMs,
  });

  plans.push({
    id: "guardian-main",
    faction: "guardian",
    svgPath: mainSerpentinePath,
    beginMs: guardianLagMs,
    durationMs: mainDurationMs,
  });

  // ─── Atmosphere combatants (decorative — don't alter cells) ─────────

  // RAIDER WING — high-altitude sweep, right to left, near top
  // Entry: t=4s, duration: 8s
  // Path: starts off-screen right, arcs across top of grid, exits off-screen left
  const wingY = height * 0.25;
  plans.push({
    id: "raider-wing",
    faction: "raider",
    svgPath: `M ${width + 30},${wingY} Q ${width * 0.6},${wingY - 18} ${width * 0.3},${wingY + 10} T -30,${wingY + 6}`,
    beginMs: 4000,
    durationMs: 8000,
  });

  // RAIDER STRIKE — diagonal swoop attack from top-right to bottom-left
  // Entry: t=12s, duration: 6s
  plans.push({
    id: "raider-strike",
    faction: "raider",
    svgPath: `M ${width + 20},-15 C ${width * 0.7},${height * 0.3} ${width * 0.4},${height * 0.7} -20,${height + 15}`,
    beginMs: 12000,
    durationMs: 6000,
  });

  // GUARDIAN INTERCEPT — comes from left, banks through middle, exits top-right
  // Entry: t=16s, duration: 7s
  plans.push({
    id: "guardian-intercept",
    faction: "guardian",
    svgPath: `M -25,${height * 0.7} C ${width * 0.3},${height * 0.4} ${width * 0.55},${height * 0.85} ${width + 25},${height * 0.2}`,
    beginMs: 16000,
    durationMs: 7000,
  });

  return plans;
}

/**
 * Convenience: build only the main serpentine path string + duration.
 * Used by svg.ts to set up the main combat thread.
 */
export function buildMainSerpentine(grid: Grid): {
  svgPath: string;
  totalSteps: number;
} {
  const numWeeks = grid.cells[0].length;
  const numDays = grid.cells.length;
  const path = serpentinePath(numWeeks, numDays);
  return {
    svgPath: pathToSvgPath(path),
    totalSteps: path.length,
  };
}
