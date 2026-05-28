// ─── src/render/path.ts ───────────────────────────────────────────────
//
// Computes the path the fighter flies through the contribution grid.
// "Serpentine" means we sweep left-to-right across the first row,
// drop down one row, sweep right-to-left, drop down again, sweep
// left-to-right ... covering every cell exactly once.
//
// Also called "boustrophedon" (Greek for "as the ox plows"), if you
// want a fancy word for your README.
//
// This file is pure logic — no SVG output except the debug polyline
// at the bottom. We'll use the path data here in Evening 4 to drive
// the actual animation.
// ──────────────────────────────────────────────────────────────────────

import { cellToPixel, CELL_SIZE } from "./grid.js";

/** A single cell position on the grid. */
export type CellCoord = { week: number; day: number };

/**
 * Build the serpentine path through every cell of the grid.
 *
 * @param numWeeks - how many columns (52 or 53 depending on the year)
 * @param numDays - how many rows (always 7)
 * @returns ordered array of cells the fighter visits, start to end
 */
export function serpentinePath(numWeeks: number, numDays: number): CellCoord[] {
  const path: CellCoord[] = [];

  for (let day = 0; day < numDays; day++) {
    if (day % 2 === 0) {
      // Even rows: sweep left to right.
      for (let week = 0; week < numWeeks; week++) {
        path.push({ week, day });
      }
    } else {
      // Odd rows: sweep right to left.
      for (let week = numWeeks - 1; week >= 0; week--) {
        path.push({ week, day });
      }
    }
  }

  return path;
}

/**
 * Pixel coordinates of the center of a cell.
 * Used to position the fighter so it sits centered over the cell
 * rather than the top-left corner.
 */
export function cellCenter(week: number, day: number): { x: number; y: number } {
  const topLeft = cellToPixel(week, day);
  return {
    x: topLeft.x + CELL_SIZE / 2,
    y: topLeft.y + CELL_SIZE / 2,
  };
}

/**
 * Direction the fighter should face at a given step in the path.
 * Even-numbered rows fly right (0°), odd-numbered rows fly left (180°).
 */
export function angleForStep(step: number, numWeeks: number): number {
  const day = Math.floor(step / numWeeks);
  return day % 2 === 0 ? 0 : 180;
}

/**
 * Debug visualization: render the path as a faint dashed polyline.
 * Lets you visually verify the path is correct before adding animation.
 * Remove this from the final SVG once the animation works.
 */
export function renderPathDebug(path: CellCoord[]): string {
  const points = path
    .map(({ week, day }) => {
      const { x, y } = cellCenter(week, day);
      return `${x},${y}`;
    })
    .join(" ");

  return `<polyline
    class="debug-path"
    points="${points}"
    fill="none"
    stroke="#7AA5C7"
    stroke-width="0.5"
    stroke-dasharray="2,2"
    opacity="0.25"
  />`;
}
