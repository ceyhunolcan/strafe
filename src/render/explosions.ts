// ─── src/render/explosions.ts ─────────────────────────────────────────
//
// Ship-destruction explosions.
//
// Each destroyed ship gets an explosion at its destruction position.
// Three layered animated circles:
//   1. Inner flash      : bright white-yellow, quick burst (peaks at 80ms)
//   2. Fireball         : orange-red core, grows and fades (220ms peak)
//   3. Shockwave ring   : expanding bright ring, biggest radius (600ms total)
//
// Timing creates the classic explosion feel:
//   t=0     : bright white burst appears
//   t=80    : flash peaks (brightest moment)
//   t=220   : fireball at full size, shockwave expanded
//   t=600   : all faded
// ──────────────────────────────────────────────────────────────────────

import { ms } from "./animation.js";
import type { ShipPlan } from "./paths.js";

type ExplosionEvent = {
  timeMs: number;
  x: number;
  y: number;
};

const EXPLOSION_DURATION_MS = 600;

function renderExplosion(event: ExplosionEvent, loopMs: number): string {
  const tBegin = Math.max(0.0005, event.timeMs / loopMs);
  const tFlash = Math.min(0.9995, (event.timeMs + 80) / loopMs);
  const tPeak = Math.min(0.9995, (event.timeMs + 220) / loopMs);
  const tEnd = Math.min(0.9995, (event.timeMs + EXPLOSION_DURATION_MS) / loopMs);

  const begin = tBegin.toFixed(4);
  const flash = tFlash.toFixed(4);
  const peak = tPeak.toFixed(4);
  const end = tEnd.toFixed(4);
  const loopTime = ms(loopMs);

  const cx = event.x.toFixed(1);
  const cy = event.y.toFixed(1);

  // Inner flash — bright white-yellow burst, fastest and brightest
  const innerFlash = `<circle cx="${cx}" cy="${cy}" r="0" fill="#FFFFE0" opacity="0">
      <animate
        attributeName="r"
        values="0;0;5;7;7;7"
        keyTimes="0;${begin};${flash};${peak};${end};1"
        dur="${loopTime}" repeatCount="indefinite" />
      <animate
        attributeName="opacity"
        values="0;0;1;0;0;0"
        keyTimes="0;${begin};${flash};${peak};${end};1"
        dur="${loopTime}" repeatCount="indefinite" />
    </circle>`;

  // Fireball — orange-red, grows continuously, fades slower
  const fireball = `<circle cx="${cx}" cy="${cy}" r="0" fill="#FF6622" opacity="0">
      <animate
        attributeName="r"
        values="0;0;4;9;11;11"
        keyTimes="0;${begin};${flash};${peak};${end};1"
        dur="${loopTime}" repeatCount="indefinite" />
      <animate
        attributeName="opacity"
        values="0;0;0.9;0.6;0;0"
        keyTimes="0;${begin};${flash};${peak};${end};1"
        dur="${loopTime}" repeatCount="indefinite" />
    </circle>`;

  // Shockwave — expanding outline ring, biggest, fades to 0
  const shockwave = `<circle cx="${cx}" cy="${cy}" r="0" fill="none" stroke="#FFCC66" stroke-width="1.5" opacity="0">
      <animate
        attributeName="r"
        values="0;0;6;14;20;20"
        keyTimes="0;${begin};${flash};${peak};${end};1"
        dur="${loopTime}" repeatCount="indefinite" />
      <animate
        attributeName="opacity"
        values="0;0;1;0.5;0;0"
        keyTimes="0;${begin};${flash};${peak};${end};1"
        dur="${loopTime}" repeatCount="indefinite" />
    </circle>`;

  return `<g class="explosion">
    ${shockwave}
    ${fireball}
    ${innerFlash}
  </g>`;
}

/**
 * Collect destruction events from all ship plans and render their explosions.
 */
export function renderExplosions(plans: ShipPlan[], loopMs: number): string {
  const events: ExplosionEvent[] = [];
  for (const plan of plans) {
    if (
      plan.destroyedAtMs != null &&
      plan.destroyedAtX != null &&
      plan.destroyedAtY != null
    ) {
      events.push({
        timeMs: plan.beginMs + plan.destroyedAtMs,
        x: plan.destroyedAtX,
        y: plan.destroyedAtY,
      });
    }
  }

  if (events.length === 0) return "";

  const explosions = events.map((e) => renderExplosion(e, loopMs)).join("\n  ");
  return `<g class="explosions">\n  ${explosions}\n</g>`;
}
