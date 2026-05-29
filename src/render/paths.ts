// ─── src/render/paths.ts ──────────────────────────────────────────────
//
// Multi-ship flight paths for Fleet Combat v2.3 (Evening 9 — stakes).
//
// New ShipPlan fields:
//   destroyedAtMs : time offset (relative to beginMs) when ship is destroyed
//   destroyedAtX  : x position where explosion plays
//   destroyedAtY  : y position where explosion plays
//
// Raider-strike is now marked destroyed mid-flight. Its destruction
// position is the cubic Bezier curve evaluated at t=0.75 of its path.
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
  // Optional destruction:
  destroyedAtMs?: number;
  destroyedAtX?: number;
  destroyedAtY?: number;
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

  // GUARDIAN MOTHERSHIP — large capital UFO, slow upper drift
  plans.push({
    id: "guardian-mothership",
    faction: "guardian",
    spriteId: "guardian-mothership",
    svgPath: `M ${width + 50},${height * 0.15} L -50,${height * 0.18}`,
    beginMs: 500,
    durationMs: 25000,
    rotate: "0",
  });

  // RAIDER WING (slim interceptor) — high-altitude sweep
  const wingY = height * 0.3;
  plans.push({
    id: "raider-wing",
    faction: "raider",
    spriteId: "raider-wing",
    svgPath: `M ${width + 30},${wingY} Q ${width * 0.6},${wingY - 18} ${width * 0.3},${wingY + 10} T -30,${wingY + 6}`,
    beginMs: 4000,
    durationMs: 8000,
    rotate: "auto",
  });

  // RAIDER STRIKE (heavy bomber) — diagonal dive attack, gets SHOT DOWN mid-flight
  //
  // Cubic Bezier from (w+20, -15) via (0.7w, 0.3h) and (0.4w, 0.7h) to (-20, h+15)
  // At t=0.75 the ship is at approximately:
  //   x = 0.2828 * w - 8.13
  //   y = 0.7594 * h + 6.09
  const destX = width * 0.2828 - 8.13;
  const destY = height * 0.7594 + 6.09;
  plans.push({
    id: "raider-strike",
    faction: "raider",
    spriteId: "raider-strike",
    svgPath: `M ${width + 20},-15 C ${width * 0.7},${height * 0.3} ${width * 0.4},${height * 0.7} -20,${height + 15}`,
    beginMs: 12000,
    durationMs: 6000,
    rotate: "auto",
    destroyedAtMs: 4500, // 4.5s into 6s flight = t=0.75 of path
    destroyedAtX: destX,
    destroyedAtY: destY,
  });

  // GUARDIAN INTERCEPT (small UFO saucer) — banking interception
  plans.push({
    id: "guardian-intercept",
    faction: "guardian",
    spriteId: "guardian-intercept",
    svgPath: `M -25,${height * 0.75} C ${width * 0.3},${height * 0.45} ${width * 0.55},${height * 0.85} ${width + 25},${height * 0.25}`,
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
