// ─── src/render/sprites.ts ────────────────────────────────────────────
//
// Five distinct ship sprites for Fleet Combat v2.1 (Evening 8).
//
//   Raiders (attackers):
//     - raider        : standard delta-wing fighter (main combat ship)
//     - raider-wing   : slim interceptor (atmosphere combatant)
//     - raider-strike : heavy bomber, Y-wing style (atmosphere combatant)
//
//   Guardians (defenders):
//     - guardian           : standard delta-wing defender (main combat ship)
//     - guardian-intercept : UFO saucer (atmosphere combatant)
//
// Each sprite is a reusable <symbol> centered at origin, pointing right (+X).
// ──────────────────────────────────────────────────────────────────────

import { ms } from "./animation.js";
import type { ShipPlan } from "./paths.js";

export const SPRITE_DEFS = `<defs>
    <symbol id="raider" overflow="visible">
      <path d="M -5,-1 L -8,0 L -5,1 Z" fill="#A02020" opacity="0.85" />
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#E04848" stroke="#FF6B6B" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="2" cy="0" r="1.2" fill="#5A0000" />
    </symbol>

    <symbol id="raider-wing" overflow="visible">
      <path d="M -7,-1 L -10,0 L -7,1 Z" fill="#FF4040" opacity="0.9" />
      <path
        d="M -7,-1 L -3,-3 L 0,-1 L 9,0 L 0,1 L -3,3 L -7,1 Z"
        fill="#FF6B6B" stroke="#FFA0A0" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="3" cy="0" r="1" fill="#600000" />
    </symbol>

    <symbol id="raider-strike" overflow="visible">
      <path d="M -6,-2 L -10,0 L -6,2 Z" fill="#700000" opacity="0.85" />
      <path
        d="M -7,-2 L -4,-7 L 0,-3 L 4,-7 L 7,0 L 4,7 L 0,3 L -4,7 L -7,2 Z"
        fill="#C92020" stroke="#E84040" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="2" cy="0" r="1.5" fill="#3A0000" />
    </symbol>

    <symbol id="guardian" overflow="visible">
      <path d="M -5,-1 L -8,0 L -5,1 Z" fill="#A0F0E4" opacity="0.7" />
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#5EEAD4" stroke="#2DD4BF" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="2" cy="0" r="1.2" fill="#0F766E" />
    </symbol>

    <symbol id="guardian-intercept" overflow="visible">
      <ellipse cx="0" cy="0.5" rx="9" ry="2.5"
        fill="#3B8B82" stroke="#0F766E" stroke-width="0.5" />
      <ellipse cx="0" cy="-0.5" rx="9" ry="2"
        fill="#5EEAD4" stroke="#2DD4BF" stroke-width="0.5" />
      <ellipse cx="0" cy="-2.5" rx="3.5" ry="2"
        fill="#A0F0E4" stroke="#FFFFFF" stroke-width="0.4" opacity="0.95" />
      <circle cx="0" cy="-2.5" r="1" fill="#FFFFFF" opacity="0.8" />
    </symbol>
  </defs>`;

function renderShipFromPlan(plan: ShipPlan, loopMs: number): string {
  const loopTime = ms(loopMs);
  const spriteId = plan.spriteId ?? plan.faction;
  const rotateAttr = plan.rotate ?? "auto";

  // ─── Full-loop ship (main raider or main guardian) ─────────────────
  if (plan.durationMs >= loopMs) {
    if (plan.beginMs === 0) {
      return `<use href="#${spriteId}" data-ship="${plan.id}">
      <animateMotion
        dur="${loopTime}"
        repeatCount="indefinite"
        rotate="${rotateAttr}"
        path="${plan.svgPath}"
      />
    </use>`;
    }
    const beginTime = ms(plan.beginMs);
    return `<use href="#${spriteId}" opacity="0" data-ship="${plan.id}">
      <set attributeName="opacity" to="1" begin="${beginTime}" />
      <animateMotion
        dur="${loopTime}"
        begin="${beginTime}"
        repeatCount="indefinite"
        rotate="${rotateAttr}"
        path="${plan.svgPath}"
      />
    </use>`;
  }

  // ─── Atmosphere ship (partial window) ──────────────────────────────
  const safeBegin = Math.max(0.0005, plan.beginMs / loopMs);
  const safeEnd = Math.min(0.9995, (plan.beginMs + plan.durationMs) / loopMs);
  const begin = safeBegin.toFixed(4);
  const end = safeEnd.toFixed(4);

  return `<use href="#${spriteId}" opacity="0" data-ship="${plan.id}">
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
        rotate="${rotateAttr}"
        path="${plan.svgPath}"
        keyTimes="0;${begin};${end};1"
        keyPoints="0;0;1;1"
        calcMode="linear"
        repeatCount="indefinite"
      />
    </use>`;
}

export function renderShips(plans: ShipPlan[], loopMs: number): string {
  const ships = plans
    .map((plan) => renderShipFromPlan(plan, loopMs))
    .join("\n    ");

  return `<g class="ships">
    ${ships}
  </g>`;
}
