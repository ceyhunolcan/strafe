// ─── src/render/grid.ts ───────────────────────────────────────────────
//
// Renders the contribution grid as SVG rectangles.
// Evening 4: each cell now includes destruction animations timed to
// when the fighter passes over it.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import {
  FLASH_DURATION_MS,
  FADE_DURATION_MS,
  loopDuration,
  ms,
  stepToBeginTime,
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
  flash: "#FFFFFF",
} as const;

// ─── Coordinate helpers ────────────────────────────────────────────────

export function cellToPixel(week: number, day: number): { x: number; y: number } {
  return {
    x: GRID_PAD_LEFT + week * CELL_STRIDE,
    y: GRID_PAD_TOP + day * CELL_STRIDE,
  };
}

export function gridDimensions(grid: Grid): { width: number; height: number } {
  const weeks = grid.cells[0].length;
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

/**
 * Build a lookup table: cell coordinate → step index on the strafe path.
 * We need this so each cell can find "when does the fighter hit me?"
 */
function buildStepLookup(
  numWeeks: number,
  numDays: number
): Map<string, number> {
  const path = serpentinePath(numWeeks, numDays);
  const lookup = new Map<string, number>();
  path.forEach((coord, step) => {
    lookup.set(`${coord.week}-${coord.day}`, step);
  });
  return lookup;
}

/**
 * Render a single cell with its destruction animations.
 *
 * Three animations attached:
 *   1. Fill flash: cell briefly turns white at the moment of impact
 *   2. Fill return: snaps back to its original color (so the next loop is clean)
 *   3. Opacity fade: cell fades to invisible after the flash
 *
 * All three sync to the same loop duration and reset together.
 */
function renderAnimatedCell(
  week: number,
  day: number,
  level: 0 | 1 | 2 | 3 | 4,
  step: number,
  totalSteps: number
): string {
  const { x, y } = cellToPixel(week, day);
  const originalFill = fillForLevel(level);
  const begin = stepToBeginTime(step);
  const fullLoop = loopDuration(totalSteps);

  // Cells with level 0 don't need destruction animation — they're already empty.
  // We render them statically.
  if (level === 0) {
    return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}" />`;
  }

  // Active cells: full destruction animation.
  return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${originalFill}">
    <animate
      attributeName="fill"
      values="${originalFill};${COLORS.flash};${originalFill}"
      keyTimes="0;0.5;1"
      dur="${ms(FLASH_DURATION_MS)}"
      begin="${begin}"
      fill="freeze"
      repeatCount="1"
    />
    <animate
      attributeName="opacity"
      values="1;0"
      dur="${ms(FADE_DURATION_MS)}"
      begin="${begin}"
      fill="freeze"
      repeatCount="1"
    />
    <animate
      attributeName="opacity"
      values="0;1"
      dur="0.01s"
      begin="${fullLoop}"
      fill="freeze"
      repeatCount="indefinite"
    />
  </rect>`;
}

/**
 * Render the full grid with all per-cell animations.
 */
export function renderGrid(grid: Grid): string {
  const numWeeks = grid.cells[0].length;
  const numDays = grid.cells.length;
  const stepLookup = buildStepLookup(numWeeks, numDays);
  const totalSteps = numWeeks * numDays;

  const cells: string[] = [];

  for (let day = 0; day < numDays; day++) {
    for (let week = 0; week < numWeeks; week++) {
      const cell = grid.cells[day][week];
      const step = stepLookup.get(`${week}-${day}`) ?? 0;
      cells.push(renderAnimatedCell(week, day, cell.level, step, totalSteps));
    }
  }

  return `<g class="cells">\n  ${cells.join("\n  ")}\n</g>`;
}

/**
 * Render Mon/Wed/Fri labels on the left side.
 */
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
