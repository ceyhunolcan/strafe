// ─── src/render/grid.ts ───────────────────────────────────────────────
//
// Contribution grid with per-cell impact effects.
// v2.3 (Evening 9 — stakes):
//   ~15% of contribution cells are "doomed" — they get destroyed but
//   NEVER restored during the loop. They settle into a dim scorched-red
//   state for the rest of the cycle, then reset at loop boundary.
//   Doomed selection is deterministic (FNV-style hash of week/day) so
//   the same cells die every loop — visually random pattern but stable.
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

const IMPACT_BURST_MS = 240;
const IMPACT_MAX_RADIUS = 8;

// Doomed cells: ~15% of contributions stay destroyed each loop
const DOOMED_PERCENT = 15;
const SCORCHED_COLOR = "#5A1010";
const SCORCHED_OPACITY = 0.4;

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

// ─── Doomed cell selection ─────────────────────────────────────────────

/**
 * Deterministic ~15% selection of cells that won't be restored.
 * FNV-style hash gives a visually random but stable pattern.
 */
function isDoomed(week: number, day: number): boolean {
  let hash = 2166136261;
  hash = Math.imul(hash ^ week, 16777619);
  hash = Math.imul(hash ^ day, 16777619);
  hash = Math.imul(hash ^ (week * 31 + day * 17), 16777619);
  return (hash >>> 0) % 100 < DOOMED_PERCENT;
}

// ─── Step lookup ───────────────────────────────────────────────────────

function buildStepLookup(numWeeks: number, numDays: number): Map<string, number> {
  const path = serpentinePath(numWeeks, numDays);
  const lookup = new Map<string, number>();
  path.forEach((coord, step) => {
    lookup.set(`${coord.week}-${coord.day}`, step);
  });
  return lookup;
}

// ─── Keyframe builders — NORMAL (looping) cells ───────────────────────

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

// ─── Keyframe builders — DOOMED cells (destroyed, never restored) ─────

function buildDoomedOpacityKeyframes(
  destroyAt: number,
  fade: number,
  loop: number
): { values: string; keyTimes: string } {
  const tDestroy = destroyAt / loop;
  const tDestroyed = (destroyAt + fade) / loop;
  // Full opacity until destruction, fade to scorched, hold scorched
  return {
    values: `1;1;${SCORCHED_OPACITY};${SCORCHED_OPACITY}`,
    keyTimes: `0;${tDestroy.toFixed(4)};${tDestroyed.toFixed(4)};1`,
  };
}

function buildDoomedFillKeyframes(
  destroyAt: number,
  flash: number,
  loop: number,
  original: string
): { values: string; keyTimes: string } {
  const tDestroy = destroyAt / loop;
  const tFlashEnd = (destroyAt + flash) / loop;
  // Original → red flash → settle to scorched red, hold
  return {
    values: `${original};${COLORS.raiderLaser};${SCORCHED_COLOR};${SCORCHED_COLOR}`,
    keyTimes: `0;${tDestroy.toFixed(4)};${tFlashEnd.toFixed(4)};1`,
  };
}

// ─── Impact ring ───────────────────────────────────────────────────────

function buildImpactRing(
  cx: number,
  cy: number,
  impactAt: number,
  color: string,
  loop: number
): string {
  const tStart = Math.max(0.0005, impactAt / loop);
  const tEnd = Math.min(0.9995, (impactAt + IMPACT_BURST_MS) / loop);

  return `<circle cx="${cx}" cy="${cy}" r="0" fill="none" stroke="${color}" stroke-width="1.2" opacity="0">
      <animate
        attributeName="r"
        values="0;0;${IMPACT_MAX_RADIUS};${IMPACT_MAX_RADIUS}"
        keyTimes="0;${tStart.toFixed(4)};${tEnd.toFixed(4)};1"
        dur="${loop}ms"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0;0;0.9;0;0"
        keyTimes="0;${Math.max(0.0001, tStart - 0.0002).toFixed(4)};${tStart.toFixed(4)};${tEnd.toFixed(4)};1"
        dur="${loop}ms"
        repeatCount="indefinite"
      />
    </circle>`;
}

// ─── Cell renderer ─────────────────────────────────────────────────────

function renderAnimatedCell(
  week: number,
  day: number,
  level: 0 | 1 | 2 | 3 | 4,
  step: number,
  totalSteps: number
): string {
  const { x, y } = cellToPixel(week, day);
  const originalFill = fillForLevel(level);

  if (level === 0) {
    return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}" />`;
  }

  const loopMs = loopDurationMs(totalSteps);
  const destroyAt = step * MS_PER_CELL;
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  // Doomed status: deterministic ~15%, skip step=0 to avoid loop boundary edge case
  const doomed = step > 0 && isDoomed(week, day);

  if (doomed) {
    const opacity = buildDoomedOpacityKeyframes(destroyAt, FADE_DURATION_MS, loopMs);
    const fill = buildDoomedFillKeyframes(destroyAt, FLASH_DURATION_MS, loopMs, originalFill);
    const destroyBurst = buildImpactRing(cx, cy, destroyAt, COLORS.raiderLaser, loopMs);

    return `<g class="cell doomed">
    <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}">
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
    </rect>
    ${destroyBurst}
  </g>`;
  }

  // Normal looping cell
  const restoreAt = destroyAt + GUARDIAN_LAG_MS;
  const opacity = buildOpacityKeyframes(destroyAt, restoreAt, FADE_DURATION_MS, loopMs);
  const fill = buildFillKeyframes(destroyAt, restoreAt, FLASH_DURATION_MS, loopMs, originalFill);
  const destroyBurst = buildImpactRing(cx, cy, destroyAt, COLORS.raiderLaser, loopMs);
  const restoreBurst = buildImpactRing(cx, cy, restoreAt, COLORS.guardianBeam, loopMs);

  return `<g class="cell">
    <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}">
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
    </rect>
    ${destroyBurst}
    ${restoreBurst}
  </g>`;
}

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
