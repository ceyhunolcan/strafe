// ─── src/render/paths.ts ──────────────────────────────────────────────
//
// Multi-ship flight paths for Fleet Combat v2.1.
//
// Each ShipPlan now carries:
//   - spriteId : which <symbol> to use (e.g. "raider-wing", "guardian-intercept")
//   - rotate   : how the ship aligns to its path ("auto" or fixed angle)
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import { gridDimensions } from "./grid.js";
import { serpentinePath, pathToSvgPath } from "./path.js";

export type Faction = "raider" | "guardian";

export type ShipPlan = {
  id: string;
  faction: Faction;
  spriteId: string;
  svgPath: string;
  beginMs: number;
  durationMs: number;
  rotate?: "auto" | "0";
};

export function buildShipPlans(
  grid: Grid,
  mainSerpentinePath: string,
  mainDurationMs: number,
  guardianLagMs: number
): ShipPlan[] {
  const { width, height } = gridDimensions(grid);
  const plans: ShipPlan[] = [];

  // Main raider — destroys cells along serpentine
  plans.push({
    id: "raider-main",
    faction: "raider",
    spriteId: "raider",
    svgPath: mainSerpentinePath,
    beginMs: 0,
    durationMs: mainDurationMs,
    rotate: "auto",
  });

  // Main guardian — restores cells, trails raider
  plans.push({
    id: "guardian-main",
    faction: "guardian",
    spriteId: "guardian",
    svgPath: mainSerpentinePath,
    beginMs: guardianLagMs,
    durationMs: mainDurationMs,
    rotate: "auto",
  });

  // Atmosphere combatants — different sprites, different paths, staggered entries

  // RAIDER WING (slim interceptor) — high-altitude sweep, right to left
  const wingY = height * 0.25;
  plans.push({
    id: "raider-wing",
    faction: "raider",
    spriteId: "raider-wing",
    svgPath: `M ${width + 30},${wingY} Q ${width * 0.6},${wingY - 18} ${width * 0.3},${wingY + 10} T -30,${wingY + 6}`,
    beginMs: 4000,
    durationMs: 8000,
    rotate: "auto",
  });

  // RAIDER STRIKE (heavy bomber) — diagonal dive attack
  plans.push({
    id: "raider-strike",
    faction: "raider",
    spriteId: "raider-strike",
    svgPath: `M ${width + 20},-15 C ${width * 0.7},${height * 0.3} ${width * 0.4},${height * 0.7} -20,${height + 15}`,
    beginMs: 12000,
    durationMs: 6000,
    rotate: "auto",
  });

  // GUARDIAN INTERCEPT (UFO saucer) — slow majestic banking interception
  // rotate="0" keeps the saucer horizontal regardless of path direction
  plans.push({
    id: "guardian-intercept",
    faction: "guardian",
    spriteId: "guardian-intercept",
    svgPath: `M -25,${height * 0.7} C ${width * 0.3},${height * 0.4} ${width * 0.55},${height * 0.85} ${width + 25},${height * 0.2}`,
    beginMs: 16000,
    durationMs: 7000,
    rotate: "0",
  });

  return plans;
}

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
