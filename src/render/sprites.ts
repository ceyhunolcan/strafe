// ─── src/render/sprites.ts ────────────────────────────────────────────
//
// Six detailed ship sprites for Fleet Combat v2.2 (Evening 9 — cinematic).
//
//   Raiders (attackers):
//     - raider        : standard delta-wing fighter (main combat)
//     - raider-wing   : slim interceptor (atmosphere)
//     - raider-strike : heavy Y-wing-style bomber (atmosphere)
//
//   Guardians (defenders):
//     - guardian            : standard delta-wing defender (main combat)
//     - guardian-intercept  : small UFO saucer (atmosphere)
//     - guardian-mothership : LARGE capital UFO (atmosphere, background drift)
//
// Each fighter gains: cockpit canopy, wing-tip lights, long engine glow.
// The mothership is ~3x the size of fighters and drifts slowly.
// ──────────────────────────────────────────────────────────────────────

import { ms } from "./animation.js";
import type { ShipPlan } from "./paths.js";

export const SPRITE_DEFS = `<defs>
    <symbol id="raider" overflow="visible">
      <path d="M -5,-1 L -13,0 L -5,1 Z" fill="#A02020" opacity="0.4" />
      <path d="M -5,-0.6 L -10,0 L -5,0.6 Z" fill="#FF8888" opacity="0.7" />
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#E04848" stroke="#FF6B6B" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="-2" cy="-5" r="0.5" fill="#FFCCCC" />
      <circle cx="-2" cy="5" r="0.5" fill="#FFCCCC" />
      <ellipse cx="2" cy="0" rx="2" ry="1" fill="#1A0303" stroke="#FFD0D0" stroke-width="0.3" />
      <circle cx="2.3" cy="-0.2" r="0.4" fill="#FFAAAA" opacity="0.8" />
    </symbol>

    <symbol id="raider-wing" overflow="visible">
      <path d="M -7,-1 L -14,0 L -7,1 Z" fill="#FF4040" opacity="0.4" />
      <path d="M -7,-0.5 L -11,0 L -7,0.5 Z" fill="#FFAAAA" opacity="0.75" />
      <path
        d="M -7,-1 L -3,-3 L 0,-1 L 9,0 L 0,1 L -3,3 L -7,1 Z"
        fill="#FF6B6B" stroke="#FFA0A0" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="-3" cy="-3" r="0.4" fill="#FFD0D0" />
      <circle cx="-3" cy="3" r="0.4" fill="#FFD0D0" />
      <ellipse cx="3" cy="0" rx="1.7" ry="0.7" fill="#1A0303" stroke="#FFD0D0" stroke-width="0.3" />
    </symbol>

    <symbol id="raider-strike" overflow="visible">
      <path d="M -6,-2 L -13,0 L -6,2 Z" fill="#700000" opacity="0.4" />
      <path d="M -6,-1 L -10,0 L -6,1 Z" fill="#C92020" opacity="0.7" />
      <path
        d="M -7,-2 L -4,-7 L 0,-3 L 4,-7 L 7,0 L 4,7 L 0,3 L -4,7 L -7,2 Z"
        fill="#C92020" stroke="#E84040" stroke-width="0.5" stroke-linejoin="round"
      />
      <rect x="-5" y="-7.5" width="2" height="1" fill="#E84040" />
      <rect x="-5" y="6.5" width="2" height="1" fill="#E84040" />
      <rect x="3" y="-7.5" width="2" height="1" fill="#E84040" />
      <rect x="3" y="6.5" width="2" height="1" fill="#E84040" />
      <ellipse cx="2" cy="0" rx="2" ry="1.2" fill="#1A0303" stroke="#FFAAAA" stroke-width="0.3" />
      <circle cx="2.5" cy="0" r="0.5" fill="#FF8888" />
    </symbol>

    <symbol id="guardian" overflow="visible">
      <path d="M -5,-1 L -13,0 L -5,1 Z" fill="#A0F0E4" opacity="0.35" />
      <path d="M -5,-0.6 L -10,0 L -5,0.6 Z" fill="#CCFFEE" opacity="0.7" />
      <path
        d="M -5,-1 L -2,-5 L 1,-1 L 7,0 L 1,1 L -2,5 L -5,1 Z"
        fill="#5EEAD4" stroke="#2DD4BF" stroke-width="0.5" stroke-linejoin="round"
      />
      <circle cx="-2" cy="-5" r="0.5" fill="#FFFFFF" />
      <circle cx="-2" cy="5" r="0.5" fill="#FFFFFF" />
      <ellipse cx="2" cy="0" rx="2" ry="1" fill="#04221E" stroke="#A0F0E4" stroke-width="0.3" />
      <circle cx="2.3" cy="-0.2" r="0.4" fill="#A0F0E4" opacity="0.9" />
    </symbol>

    <symbol id="guardian-intercept" overflow="visible">
      <ellipse cx="0" cy="2" rx="11" ry="3" fill="#5EEAD4" opacity="0.2" />
      <ellipse cx="0" cy="0.8" rx="9" ry="2.5" fill="#1F4E48" stroke="#0F766E" stroke-width="0.5" />
      <line x1="-7" y1="0.2" x2="7" y2="0.2" stroke="#5EEAD4" stroke-width="0.6" opacity="0.9" />
      <circle cx="-5" cy="0.2" r="0.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="-2" cy="0.2" r="0.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="2" cy="0.2" r="0.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="5" cy="0.2" r="0.5" fill="#FFFFFF" opacity="0.85" />
      <ellipse cx="0" cy="-0.5" rx="9" ry="2" fill="#5EEAD4" stroke="#2DD4BF" stroke-width="0.5" />
      <ellipse cx="0" cy="-2.5" rx="3.5" ry="2" fill="#A0F0E4" stroke="#FFFFFF" stroke-width="0.4" />
      <ellipse cx="0" cy="-2.5" rx="2" ry="1.1" fill="#E0FFF8" opacity="0.6" />
      <circle cx="0" cy="-2.5" r="0.8" fill="#FFFFFF" opacity="0.95" />
    </symbol>

    <symbol id="guardian-mothership" overflow="visible">
      <ellipse cx="0" cy="2" rx="22" ry="5" fill="#5EEAD4" opacity="0.1" />
      <ellipse cx="0" cy="2" rx="18" ry="3.5" fill="#5EEAD4" opacity="0.18" />
      <ellipse cx="0" cy="1.5" rx="17" ry="3.5" fill="#1F4E48" stroke="#0F766E" stroke-width="0.5" />
      <ellipse cx="0" cy="2.5" rx="13" ry="1.5" fill="none" stroke="#0F766E" stroke-width="0.3" opacity="0.6" />
      <line x1="-15" y1="0" x2="15" y2="0" stroke="#5EEAD4" stroke-width="0.7" opacity="0.95" />
      <line x1="-14" y1="0" x2="14" y2="0" stroke="#FFFFFF" stroke-width="0.3" opacity="0.5" />
      <circle cx="-12" cy="0" r="0.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="-9" cy="0" r="0.55" fill="#FFFFFF" opacity="0.85" />
      <circle cx="-6" cy="0" r="0.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="-3" cy="0" r="0.55" fill="#FFFFFF" opacity="0.85" />
      <circle cx="0" cy="0" r="0.65" fill="#FFFFFF" opacity="0.95" />
      <circle cx="3" cy="0" r="0.55" fill="#FFFFFF" opacity="0.85" />
      <circle cx="6" cy="0" r="0.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="9" cy="0" r="0.55" fill="#FFFFFF" opacity="0.85" />
      <circle cx="12" cy="0" r="0.5" fill="#FFFFFF" opacity="0.85" />
      <ellipse cx="0" cy="-1" rx="17" ry="2.5" fill="#3B8B82" stroke="#2DD4BF" stroke-width="0.5" />
      <ellipse cx="0" cy="-2.5" rx="12" ry="2" fill="#5EEAD4" stroke="#2DD4BF" stroke-width="0.5" />
      <ellipse cx="0" cy="-4.2" rx="6" ry="2" fill="#A0F0E4" stroke="#FFFFFF" stroke-width="0.4" />
      <ellipse cx="0" cy="-4.2" rx="4" ry="1.3" fill="#E0FFF8" opacity="0.7" />
      <circle cx="0" cy="-4.2" r="0.9" fill="#FFFFFF" opacity="0.95" />
      <line x1="0" y1="-6" x2="0" y2="-9" stroke="#5EEAD4" stroke-width="0.5" />
      <circle cx="0" cy="-9" r="1.3" fill="#5EEAD4" opacity="0.4" />
      <circle cx="0" cy="-9" r="0.7" fill="#FFFFFF" opacity="0.95" />
    </symbol>
  </defs>`;

function renderShipFromPlan(plan: ShipPlan, loopMs: number): string {
  const loopTime = ms(loopMs);
  const spriteId = plan.spriteId ?? plan.faction;
  const rotateAttr = plan.rotate ?? "auto";

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
