// ─── src/render/sprites.ts ────────────────────────────────────────────
//
// Defines the fighter ship sprite as a reusable SVG <symbol>.
// The symbol is defined once in <defs>, then placed anywhere on the
// SVG with <use href="#fighter" />.
//
// Design intent:
//   - Generic delta-wing aesthetic — no specific franchise IP
//   - Top-down view, pointing right (+X) by default
//   - ~15px long, ~10px tall — slightly larger than a 10x10 grid cell
//
// Three layers (drawn back-to-front):
//   1. Engine glow (amber triangle behind the hull)
//   2. Hull (steel-blue delta wing)
//   3. Cockpit (dark blue dot toward the nose)
// ──────────────────────────────────────────────────────────────────────

/**
 * SVG <defs> block containing the fighter symbol.
 * Insert this once at the top of your SVG, then reference the symbol
 * with <use href="#fighter" /> anywhere you want a fighter to appear.
 */
export const SPRITE_DEFS = `<defs>
    <symbol id="fighter" overflow="visible">
      <!-- Engine glow trailing behind (drawn first, sits behind hull) -->
      <path d="M -5,-1 L -8,0 L -5,1 Z" fill="#FFB347" opacity="0.75" />
      <!-- Main hull: delta-wing shape pointing right -->
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#C8D8E8"
        stroke="#7AA5C7"
        stroke-width="0.5"
        stroke-linejoin="round"
      />
      <!-- Cockpit detail (small dot toward the front) -->
      <circle cx="2" cy="0" r="1.2" fill="#4A6FA5" />
    </symbol>
  </defs>`;

/**
 * Render a fighter at a given position and rotation.
 *
 * @param cx - center x in SVG pixel coordinates
 * @param cy - center y in SVG pixel coordinates
 * @param angle - rotation in degrees (0 = facing right, 180 = facing left)
 * @returns SVG <g> string that places the fighter at the requested spot
 */
export function renderFighter(cx: number, cy: number, angle: number = 0): string {
  return `<g class="fighter" transform="translate(${cx} ${cy}) rotate(${angle})">
    <use href="#fighter" />
  </g>`;
}
