// ─── src/render/animation.ts ──────────────────────────────────────────
//
// Timing constants and helpers for the animation.
// All animations sync to this master clock.
//
// Why this file exists: by centralizing all timing here, we can tune
// the speed feel of the entire animation by changing a single number.
// ──────────────────────────────────────────────────────────────────────

/**
 * Time in milliseconds the fighter spends traveling over each cell.
 * 80ms feels brisk but readable — fast enough that the 371-cell
 * strafe completes in ~30 seconds, slow enough that you can see
 * each cell get destroyed.
 */
export const MS_PER_CELL = 80;

/**
 * Brief flash before the cell disappears (white-hot impact frame).
 */
export const FLASH_DURATION_MS = 60;

/**
 * Fade duration after the flash.
 */
export const FADE_DURATION_MS = 120;

/**
 * Convert a step index (which cell number in the path) into a delay
 * in seconds, formatted as an SVG-friendly string ("1.6s", "23.84s").
 */
export function stepToBeginTime(step: number): string {
  const ms = step * MS_PER_CELL;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Total duration of one strafe loop, formatted as SVG time string.
 * Includes a small tail buffer after the last cell so the final
 * explosion finishes before the loop resets.
 */
export function loopDuration(totalSteps: number): string {
  const ms = totalSteps * MS_PER_CELL + FLASH_DURATION_MS + FADE_DURATION_MS + 500;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Convert milliseconds to seconds string.
 */
export function ms(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(3)}s`;
}
