// ─── src/render/lasers.ts ─────────────────────────────────────────────
//
// Ship-to-ship laser tracers — now firing FROM actual ship positions
// TO actual ship positions, computed via positions.ts.
//
// v2.3 had random hardcoded screen coordinates so most lasers crossed
// empty space. v2.4 fixes that: each TracerEvent declares which ship
// fires and which ship is the target, and endpoints are computed.
// ──────────────────────────────────────────────────────────────────────

import { ms } from "./animation.js";
import type { Grid } from "../github/fetch-contributions.js";
import { gridDimensions } from "./grid.js";
import {
  raiderMainPositionAt,
  guardianMainPositionAt,
  raiderWingPositionAt,
  raiderStrikePositionAt,
  guardianInterceptPositionAt,
  type Point,
} from "./positions.js";

const RAIDER_LASER = "#FF6B6B";
const GUARDIAN_LASER = "#5EEAD4";
const TRACER_RAMP_IN_MS = 40;
const TRACER_FADE_OUT_MS = 160;

type TracerEvent = {
  timeMs: number;
  from: Point;
  to: Point;
  color: "raider" | "guardian";
};

/**
 * Build the choreographed combat sequence. Each event captures a real
 * ship-firing-at-real-ship moment.
 *
 * Narrative:
 *   t=2.0s   guardian-main fires at raider-main on serpentine (opening)
 *   t=5.5s   raider-wing engages guardian-main
 *   t=7.0s   guardian-main returns fire on raider-wing
 *   t=9.0s   raider-wing presses attack
 *   t=10.5s  guardian-main last shot before raider-wing exits
 *   t=13.0s  raider-strike dives, fires at guardian-main
 *   t=14.5s  guardian-main fires back at raider-strike
 *   t=16.0s  raider-strike fires at guardian-main (turning toward intercept)
 *   t=16.4s  KILL SHOT — guardian-intercept fires at raider-strike
 *   t=16.5s  EXPLOSION (handled by explosions.ts)
 *   t=17.5s  guardian-intercept turns on raider-main
 *   t=19.0s  raider-main returns fire at guardian-intercept
 *   t=20.5s  guardian-intercept last shot before exiting
 *   t=24.0s  late main combat — raider-main vs guardian-main
 *   t=26.5s  late main combat — guardian-main vs raider-main
 */
function buildTracerEvents(grid: Grid, width: number, height: number): TracerEvent[] {
  return [
    // Opening
    {
      timeMs: 2000,
      from: guardianMainPositionAt(2000, grid),
      to: raiderMainPositionAt(2000, grid),
      color: "guardian",
    },

    // Raider-Wing engagement
    {
      timeMs: 5500,
      from: raiderWingPositionAt(5500, width, height),
      to: guardianMainPositionAt(5500, grid),
      color: "raider",
    },
    {
      timeMs: 7000,
      from: guardianMainPositionAt(7000, grid),
      to: raiderWingPositionAt(7000, width, height),
      color: "guardian",
    },
    {
      timeMs: 9000,
      from: raiderWingPositionAt(9000, width, height),
      to: guardianMainPositionAt(9000, grid),
      color: "raider",
    },
    {
      timeMs: 10500,
      from: guardianMainPositionAt(10500, grid),
      to: raiderWingPositionAt(10500, width, height),
      color: "guardian",
    },

    // Raider-Strike dive
    {
      timeMs: 13000,
      from: raiderStrikePositionAt(13000, width, height),
      to: guardianMainPositionAt(13000, grid),
      color: "raider",
    },
    {
      timeMs: 14500,
      from: guardianMainPositionAt(14500, grid),
      to: raiderStrikePositionAt(14500, width, height),
      color: "guardian",
    },
    {
      timeMs: 16000,
      from: raiderStrikePositionAt(16000, width, height),
      to: guardianMainPositionAt(16000, grid),
      color: "raider",
    },

    // KILL SHOT — laser endpoint matches the destruction position used
    // by explosions.ts (because raiderStrikePositionAt(16500) returns
    // the same point that paths.ts captured as destroyedAtX/Y).
    {
      timeMs: 16400,
      from: guardianInterceptPositionAt(16400, width, height),
      to: raiderStrikePositionAt(16500, width, height),
      color: "guardian",
    },

    // Guardian-Intercept turns on main raider
    {
      timeMs: 17500,
      from: guardianInterceptPositionAt(17500, width, height),
      to: raiderMainPositionAt(17500, grid),
      color: "guardian",
    },
    {
      timeMs: 19000,
      from: raiderMainPositionAt(19000, grid),
      to: guardianInterceptPositionAt(19000, width, height),
      color: "raider",
    },
    {
      timeMs: 20500,
      from: guardianInterceptPositionAt(20500, width, height),
      to: raiderMainPositionAt(20500, grid),
      color: "guardian",
    },

    // Late main combat
    {
      timeMs: 24000,
      from: raiderMainPositionAt(24000, grid),
      to: guardianMainPositionAt(24000, grid),
      color: "raider",
    },
    {
      timeMs: 26500,
      from: guardianMainPositionAt(26500, grid),
      to: raiderMainPositionAt(26500, grid),
      color: "guardian",
    },
  ];
}

function renderTracer(event: TracerEvent, loopMs: number): string {
  const tStart = Math.max(0.0005, event.timeMs / loopMs);
  const tPeak = Math.max(tStart + 0.0001, (event.timeMs + TRACER_RAMP_IN_MS) / loopMs);
  const tEnd = Math.min(
    0.9995,
    (event.timeMs + TRACER_RAMP_IN_MS + TRACER_FADE_OUT_MS) / loopMs
  );
  const begin = tStart.toFixed(4);
  const peak = tPeak.toFixed(4);
  const end = tEnd.toFixed(4);
  const loopTime = ms(loopMs);

  const color = event.color === "raider" ? RAIDER_LASER : GUARDIAN_LASER;
  const x1 = event.from.x.toFixed(1);
  const y1 = event.from.y.toFixed(1);
  const x2 = event.to.x.toFixed(1);
  const y2 = event.to.y.toFixed(1);

  const halo = `<line
      x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${color}"
      stroke-width="4"
      stroke-linecap="round"
      opacity="0"
    >
      <animate
        attributeName="opacity"
        values="0;0;0.35;0;0"
        keyTimes="0;${begin};${peak};${end};1"
        dur="${loopTime}"
        repeatCount="indefinite"
      />
    </line>`;

  const core = `<line
      x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${color}"
      stroke-width="1.5"
      stroke-linecap="round"
      opacity="0"
    >
      <animate
        attributeName="opacity"
        values="0;0;1;0;0"
        keyTimes="0;${begin};${peak};${end};1"
        dur="${loopTime}"
        repeatCount="indefinite"
      />
    </line>`;

  return halo + "\n    " + core;
}

export function renderLasers(grid: Grid, loopMs: number): string {
  const { width, height } = gridDimensions(grid);
  const events = buildTracerEvents(grid, width, height);
  const tracers = events.map((e) => renderTracer(e, loopMs)).join("\n    ");
  return `<g class="lasers">
    ${tracers}
  </g>`;
}
