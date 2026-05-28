// ─── src/render/sprites.ts ────────────────────────────────────────────
//
// Sprite definitions + render function for Fleet Combat (v2).
//
// Renders any number of ships from ShipPlan objects. Two rendering modes:
//
//   "Full-loop" ships — fly the entire loop continuously. The main
//   raider (destroys cells) and main guardian (restores cells) use
//   this mode. Implementation: animateMotion with repeatCount=indefinite
//   and dur=loopDurationMs.
//
//   "Atmosphere" ships — appear during a partial window of the loop,
//   then disappear. Implementation: animateMotion with the same
//   loop-length dur, but using keyTimes/keyPoints to control WHEN
//   during the loop the ship actually moves. Paired with a discrete
//   opacity animation that hides the ship when inactive.
// ──────────────────────────────────────────────────────────────────────

import { ms } from "./animation.js";
import type { ShipPlan } from "./paths.js";

export const SPRITE_DEFS = `<defs>
    <symbol id="raider" overflow="visible">
      <path d="M -5,-1 L -8,0 L -5,1 Z" fill="#A02020" opacity="0.85" />
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#E04848"
        stroke="#FF6B6B"
        stroke-width="0.5"
        stroke-linejoin="round"
      />
      <circle cx="2" cy="0" r="1.2" fill="#5A0000" />
    </symbol>
    <symbol id="guardian" overflow="visible">
      <path d="M -5,-1 L -8,0 L -5,1 Z" fill="#A0F0E4" opacity="0.7" />
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#5EEAD4"
        stroke="#2DD4BF"
        stroke-width="0.5"
        stroke-linejoin="round"
      />
      <circle cx="2" cy="0" r="1.2" fill="#0F766E" />
    </symbol>
  </defs>`;

/**
 * Render a single ship.
 * - If durationMs >= loopMs the ship is treated as full-loop.
 * - Otherwise the ship is treated as an atmosphere combatant — visible
 *   only during its [beginMs, beginMs + durationMs] window each loop.
 */
function renderShipFromPlan(plan: ShipPlan, loopMs: number): string {
  const loopTime = ms(loopMs);

  // ─── Full-loop ship (main raider or main guardian) ─────────────────
  if (plan.durationMs >= loopMs) {
    if (plan.beginMs === 0) {
      return `<use href="#${plan.faction}" data-ship="${plan.id}">
      <animateMotion
        dur="${loopTime}"
        repeatCount="indefinite"
        rotate="auto"
        path="${plan.svgPath}"
      />
    </use>`;
    }
    const beginTime = ms(plan.beginMs);
    return `<use href="#${plan.faction}" opacity="0" data-ship="${plan.id}">
      <set attributeName="opacity" to="1" begin="${beginTime}" />
      <animateMotion
        dur="${loopTime}"
        begin="${beginTime}"
        repeatCount="indefinite"
        rotate="auto"
        path="${plan.svgPath}"
      />
    </use>`;
  }

  // ─── Atmosphere ship (partial window) ──────────────────────────────
  //
  // keyTimes / keyPoints semantics for animateMotion:
  //   keyTimes  give fractions of the animation duration
  //   keyPoints give corresponding fractions along the path (0..1)
  //
  // We use 4 keyTimes:
  //   0          → ship at keyPoint 0 (path start, off-screen)
  //   beginFrac  → still at keyPoint 0 (waiting to enter)
  //   endFrac    → at keyPoint 1 (path end, off-screen)
  //   1          → still at keyPoint 1 (idle until loop restarts)

  const safeBegin = Math.max(0.0005, plan.beginMs / loopMs);
  const safeEnd = Math.min(0.9995, (plan.beginMs + plan.durationMs) / loopMs);
  const begin = safeBegin.toFixed(4);
  const end = safeEnd.toFixed(4);

  return `<use href="#${plan.faction}" opacity="0" data-ship="${plan.id}">
      <animate
        attributeName="opacity"
        values="0;1;0;0"
        keyTimes="0;${begin};${end};1"
        dur="${loopTime}"
        calcMode="discrete"
        repeatCount="indefinite"
      />
      <animateMotion
        dur="${loopTime}"
        rotate="auto"
        path="${plan.svgPath}"
        keyTimes="0;${begin};${end};1"
        keyPoints="0;0;1;1"
        calcMode="linear"
        repeatCount="indefinite"
      />
    </use>`;
}

/**
 * Render all ships in the scene.
 */
export function renderShips(plans: ShipPlan[], loopMs: number): string {
  const ships = plans
    .map((plan) => renderShipFromPlan(plan, loopMs))
    .join("\n    ");

  return `<g class="ships">
    ${ships}
  </g>`;
}
