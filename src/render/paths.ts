// ─── src/render/paths.ts ──────────────────────────────────────────────
//
// Multi-ship flight paths.
// v2.4: destruction position now computed from positions.ts (single
// source of truth) so the kill-shot laser and explosion line up exactly.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import { gridDimensions } from "./grid.js";
import { serpentinePath, pathToSvgPath } from "./path.js";
import { raiderStrikePositionAt } from "./positions.js";

export type Faction = "raider" | "guardian";

export type ShipPlan = {
  id: string;
  faction: Faction;
  spriteId: string;
  svgPath: string;
  beginMs: number;
  durationMs: number;
  rotate?: "auto" | "0";
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

  plans.push({
    id: "raider-main",
    faction: "raider",
    spriteId: "raider",
    svgPath: mainSerpentinePath,
    beginMs: 0,
    durationMs: mainDurationMs,
    rotate: "auto",
  });

  plans.push({
    id: "guardian-main",
    faction: "guardian",
    spriteId: "guardian",
    svgPath: mainSerpentinePath,
    beginMs: guardianLagMs,
    durationMs: mainDurationMs,
    rotate: "auto",
  });

  plans.push({
    id: "guardian-mothership",
    faction: "guardian",
    spriteId: "guardian-mothership",
    svgPath: `M ${width + 50},${height * 0.15} L -50,${height * 0.18}`,
    beginMs: 500,
    durationMs: 25000,
    rotate: "0",
  });

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

  // Raider-Strike — gets shot down at 4.5s into its 6s flight.
  // Destruction position from positions.ts (single source of truth so
  // the kill-shot laser and explosion render at the same coordinates).
  const destroyAtMs = 4500;
  const destroyPos = raiderStrikePositionAt(12000 + destroyAtMs, width, height);
  plans.push({
    id: "raider-strike",
    faction: "raider",
    spriteId: "raider-strike",
    svgPath: `M ${width + 20},-15 C ${width * 0.7},${height * 0.3} ${width * 0.4},${height * 0.7} -20,${height + 15}`,
    beginMs: 12000,
    durationMs: 6000,
    rotate: "auto",
    destroyedAtMs: destroyAtMs,
    destroyedAtX: destroyPos.x,
    destroyedAtY: destroyPos.y,
  });

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
