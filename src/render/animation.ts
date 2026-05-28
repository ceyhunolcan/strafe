// ─── src/render/animation.ts ──────────────────────────────────────────
//
// Timing constants and helpers for the animation.
// All animations sync to a single master clock.
//
// Phase 1 v2: the Guardian follows the Raider by GUARDIAN_LAG_CELLS cells.
// Cells are destroyed by the Raider, then restored by the Guardian.
// ──────────────────────────────────────────────────────────────────────

export const MS_PER_CELL = 80;
export const FLASH_DURATION_MS = 60;
export const FADE_DURATION_MS = 120;

// Guardian follows Raider by this many cells
export const GUARDIAN_LAG_CELLS = 3;
export const GUARDIAN_LAG_MS = GUARDIAN_LAG_CELLS * MS_PER_CELL; // 240ms

export const RESTORE_DURATION_MS = 120;

/**
 * Convert a step index into an SVG-friendly begin time string.
 */
export function stepToBeginTime(step: number): string {
  const milliseconds = step * MS_PER_CELL;
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

/**
 * Total milliseconds in one full loop, accounting for Guardian's lag
 * and the final cell's restoration completion.
 */
export function loopDurationMs(totalSteps: number): number {
  return (totalSteps - 1) * MS_PER_CELL
       + GUARDIAN_LAG_MS
       + FADE_DURATION_MS
       + 500; // small cleanup buffer
}

/**
 * Loop duration as an SVG-friendly time string ("30.26s").
 */
export function loopDuration(totalSteps: number): string {
  return ms(loopDurationMs(totalSteps));
}

/**
 * Convert milliseconds to an SVG-friendly seconds string.
 */
export function ms(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(3)}s`;
}
