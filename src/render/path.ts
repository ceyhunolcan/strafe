// ─── src/render/path.ts ───────────────────────────────────────────────
//
// Computes the path the fighter flies through the contribution grid.
// Serpentine sweep: left-right, drop, right-left, drop, ... covering
// every cell exactly once.
//
// Evening 4 update: adds `pathToSvgPath()` which converts the cell
// sequence into an SVG `d` attribute string for <animateMotion>.
// ──────────────────────────────────────────────────────────────────────

import { cellToPixel, CELL_SIZE } from "./grid.js";

/** A single cell position on the grid. */
export type CellCoord = { week: number; day: number };

/**
 * Build the serpentine path through every cell of the grid.
 */
export function serpentinePath(numWeeks: number, numDays: number): CellCoord[] {
  const path: CellCoord[] = [];

  for (let day = 0; day < numDays; day++) {
    if (day % 2 === 0) {
      for (let week = 0; week < numWeeks; week++) {
        path.push({ week, day });
      }
    } else {
      for (let week = numWeeks - 1; week >= 0; week--) {
        path.push({ week, day });
      }
    }
  }

  return path;
}

/**
 * Pixel coordinates of the center of a cell.
 */
export function cellCenter(week: number, day: number): { x: number; y: number } {
  const topLeft = cellToPixel(week, day);
  return {
    x: topLeft.x + CELL_SIZE / 2,
    y: topLeft.y + CELL_SIZE / 2,
  };
}

/**
 * Direction the fighter should face at a given step.
 * Even rows: 0° (right). Odd rows: 180° (left).
 */
export function angleForStep(step: number, numWeeks: number): number {
  const day = Math.floor(step / numWeeks);
  return day % 2 === 0 ? 0 : 180;
}

/**
 * Convert the path of cells into an SVG path `d` attribute string.
 * This is what <animateMotion> uses to know where to move the fighter.
 *
 * Format: "M x1,y1 L x2,y2 L x3,y3 ..."
 */
export function pathToSvgPath(path: CellCoord[]): string {
  if (path.length === 0) return "";

  const points = path.map(({ week, day }) => cellCenter(week, day));
  const [first, ...rest] = points;
  const parts = [`M ${first.x},${first.y}`];
  for (const p of rest) {
    parts.push(`L ${p.x},${p.y}`);
  }
  return parts.join(" ");
}
