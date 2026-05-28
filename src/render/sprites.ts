// ─── src/render/sprites.ts ────────────────────────────────────────────
//
// Defines the fighter ship sprite + the animation that flies it
// along the strafe path.
// ──────────────────────────────────────────────────────────────────────

import { loopDuration } from "./animation.js";

/**
 * SVG <defs> block containing the fighter symbol.
 */
export const SPRITE_DEFS = `<defs>
    <symbol id="fighter" overflow="visible">
      <!-- Engine glow trailing behind -->
      <path d="M -5,-1 L -8,0 L -5,1 Z" fill="#FFB347" opacity="0.75" />
      <!-- Main hull: delta-wing pointing right -->
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#C8D8E8"
        stroke="#7AA5C7"
        stroke-width="0.5"
        stroke-linejoin="round"
      />
      <!-- Cockpit detail -->
      <circle cx="2" cy="0" r="1.2" fill="#4A6FA5" />
    </symbol>
  </defs>`;

/**
 * Render the fighter with <animateMotion> driving it along the strafe path.
 *
 * @param svgPath - the path's `d` attribute string (from pathToSvgPath)
 * @param totalSteps - total cells in the path (for loop duration)
 * @returns SVG group with the fighter and its motion animation
 *
 * Notes:
 *   - `rotate="auto"` makes the fighter rotate to face its direction of travel
 *   - `repeatCount="indefinite"` loops the strafe forever
 *   - We wrap in <g> so the fighter can be styled or hidden as a group
 */
export function renderAnimatedFighter(svgPath: string, totalSteps: number): string {
  const duration = loopDuration(totalSteps);

  return `<g class="fighter">
    <use href="#fighter">
      <animateMotion
        dur="${duration}"
        repeatCount="indefinite"
        rotate="auto"
        path="${svgPath}"
      />
    </use>
  </g>`;
}
