// ─── src/render/grid.ts ───────────────────────────────────────────────
//
// Renders the contribution grid with two-stage cell animations:
//   1. Raider destroys cell (red flash, fade to invisible)
//   2. Guardian restores cell (teal flash, fade back to original)
//
// Uses a single <animate> per attribute with keyTimes spanning the
// full loop, so animations correctly repeat indefinitely (fixes the
// v1 bug where cells only animated during the first loop).
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import {
  MS_PER_CELL,
  FLASH_DURATION_MS,
  FADE_DURATION_MS,
  GUARDIAN_LAG_MS,
  loopDurationMs,
} from "./animation.js";
import { serpentinePath } from "./path.js";

// ─── Geometry constants ────────────────────────────────────────────────

export const CELL_SIZE = 10;
export const CELL_GAP = 3;
export const CELL_RADIUS = 2;
export const CELL_STRIDE = CELL_SIZE + CELL_GAP;

export const GRID_PAD_LEFT = 30;
export const GRID_PAD_TOP = 20;
export const GRID_PAD_RIGHT = 10;
export const GRID_PAD_BOTTOM = 10;

// ─── Color palette ─────────────────────────────────────────────────────

export const COLORS = {
  background: "#0D1117",
  level0: "#161B22",
  level1: "#0E4429",
  level2: "#006D32",
  level3: "#26A641",
  level4: "#39D353",
  text: "#7D8590",
  raiderLaser: "#FF6B6B",
  guardianBeam: "#5EEAD4",
} as const;

// ─── Coordinate helpers ────────────────────────────────────────────────

export function cellToPixel(week: number, day: number): { x: number; y: number } {
  return {
    x: GRID_PAD_LEFT + week * CELL_STRIDE,
    y: GRID_PAD_TOP + day * CELL_STRIDE,
  };
}

function maxWeeks(grid: Grid): number {
  let max = 0;
  for (const row of grid.cells) {
    if (row.length > max) max = row.length;
  }
  return max;
}

export function gridDimensions(grid: Grid): { width: number; height: number } {
  const weeks = maxWeeks(grid);
  const days = grid.cells.length;
  return {
    width: GRID_PAD_LEFT + weeks * CELL_STRIDE + GRID_PAD_RIGHT - CELL_GAP,
    height: GRID_PAD_TOP + days * CELL_STRIDE + GRID_PAD_BOTTOM - CELL_GAP,
  };
}

function fillForLevel(level: 0 | 1 | 2 | 3 | 4): string {
  return level === 0 ? COLORS.level0 :
         level === 1 ? COLORS.level1 :
         level === 2 ? COLORS.level2 :
         level === 3 ? COLORS.level3 :
                       COLORS.level4;
}

// ─── Cell rendering ────────────────────────────────────────────────────

function buildStepLookup(numWeeks: number, numDays: number): Map<string, number> {
  const path = serpentinePath(numWeeks, numDays);
  const lookup = new Map<string, number>();
  path.forEach((coord, step) => {
    lookup.set(`${coord.week}-${coord.day}`, step);
  });
  return lookup;
}

/**
 * Build the opacity animation values + keyTimes for a single cell.
 *
 * The cell timeline within one loop:
 *   t=0          → opacity 1 (alive)
 *   t=destroyAt  → opacity 1, about to fade
 *   t=destroyed  → opacity 0 (destroyed)
 *   t=restoreAt  → opacity 0, about to revive
 *   t=restored   → opacity 1 (revived)
 *   t=1 (loopEnd) → opacity 1
 *
 * Special case: when destroyAt = 0 (step 0 cell), we skip the initial
 * "1" since keyTimes can't have duplicates.
 */
function buildOpacityKeyframes(
  destroyAt: number,
  restoreAt: number,
  fade: number,
  loop: number
): { values: string; keyTimes: string } {
  const tDestroy = destroyAt / loop;
  const tDestroyed = (destroyAt + fade) / loop;
  const tRestore = restoreAt / loop;
  const tRestored = (restoreAt + fade) / loop;

  if (destroyAt === 0) {
    return {
      values: "1;0;0;1;1",
      keyTimes: `0;${tDestroyed.toFixed(4)};${tRestore.toFixed(4)};${tRestored.toFixed(4)};1`,
    };
  }

  return {
    values: "1;1;0;0;1;1",
    keyTimes: `0;${tDestroy.toFixed(4)};${tDestroyed.toFixed(4)};${tRestore.toFixed(4)};${tRestored.toFixed(4)};1`,
  };
}

/**
 * Build the fill flash animation for a single cell.
 * Discrete (instant) transitions for the laser flashes.
 */
function buildFillKeyframes(
  destroyAt: number,
  restoreAt: number,
  flash: number,
  loop: number,
  original: string
): { values: string; keyTimes: string } {
  const tDestroy = destroyAt / loop;
  const tDestroyFlashEnd = (destroyAt + flash) / loop;
  const tRestore = restoreAt / loop;
  const tRestoreFlashEnd = (restoreAt + flash) / loop;

  if (destroyAt === 0) {
    return {
      values: `${COLORS.raiderLaser};${original};${COLORS.guardianBeam};${original};${original}`,
      keyTimes: `0;${tDestroyFlashEnd.toFixed(4)};${tRestore.toFixed(4)};${tRestoreFlashEnd.toFixed(4)};1`,
    };
  }

  return {
    values: `${original};${COLORS.raiderLaser};${original};${COLORS.guardianBeam};${original};${original}`,
    keyTimes: `0;${tDestroy.toFixed(4)};${tDestroyFlashEnd.toFixed(4)};${tRestore.toFixed(4)};${tRestoreFlashEnd.toFixed(4)};1`,
  };
}

function renderAnimatedCell(
  week: number,
  day: number,
  level: 0 | 1 | 2 | 3 | 4,
  step: number,
  totalSteps: number
): string {
  const { x, y } = cellToPixel(week, day);
  const originalFill = fillForLevel(level);

  // Level 0 cells are static — no contribution to defend
  if (level === 0) {
    return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}" />`;
  }

  const loopMs = loopDurationMs(totalSteps);
  const destroyAt = step * MS_PER_CELL;
  const restoreAt = destroyAt + GUARDIAN_LAG_MS;

  const opacity = buildOpacityKeyframes(destroyAt, restoreAt, FADE_DURATION_MS, loopMs);
  const fill = buildFillKeyframes(destroyAt, restoreAt, FLASH_DURATION_MS, loopMs, originalFill);

  return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}">
    <animate
      attributeName="opacity"
      values="${opacity.values}"
      keyTimes="${opacity.keyTimes}"
      dur="${loopMs}ms"
      repeatCount="indefinite"
    />
    <animate
      attributeName="fill"
      values="${fill.values}"
      keyTimes="${fill.keyTimes}"
      dur="${loopMs}ms"
      calcMode="discrete"
      repeatCount="indefinite"
    />
  </rect>`;
}

/**
 * Render the full grid with all per-cell animations.
 * Tolerant of uneven rows (partial weeks at year boundaries).
 */
export function renderGrid(grid: Grid): string {
  const numWeeks = maxWeeks(grid);
  const numDays = grid.cells.length;
  const stepLookup = buildStepLookup(numWeeks, numDays);
  const totalSteps = numWeeks * numDays;

  const cells: string[] = [];

  for (let day = 0; day < numDays; day++) {
    for (let week = 0; week < numWeeks; week++) {
      const cell = grid.cells[day][week];
      if (!cell) continue;
      const step = stepLookup.get(`${week}-${day}`) ?? 0;
      cells.push(renderAnimatedCell(week, day, cell.level, step, totalSteps));
    }
  }

  return `<g class="cells">\n  ${cells.join("\n  ")}\n</g>`;
}

export function renderDayLabels(): string {
  const labels = [
    { day: 1, text: "Mon" },
    { day: 3, text: "Wed" },
    { day: 5, text: "Fri" },
  ];

  return labels
    .map(({ day, text }) => {
      const { y } = cellToPixel(0, day);
      return `<text x="${GRID_PAD_LEFT - 6}" y="${y + CELL_SIZE - 1}" text-anchor="end" font-family="ui-monospace, monospace" font-size="9" fill="${COLORS.text}">${text}</text>`;
    })
    .join("\n  ");
}
