// ─── src/render/lasers.ts ─────────────────────────────────────────────
//
// Ship-to-ship laser tracer system with glow halos.
// v2.3 adds the KILL SHOT — a guardian laser fired at the raider-strike's
// destruction position, immediately before the explosion plays.
// ──────────────────────────────────────────────────────────────────────

import { ms } from "./animation.js";

const RAIDER_LASER = "#FF6B6B";
const GUARDIAN_LASER = "#5EEAD4";
const TRACER_RAMP_IN_MS = 40;
const TRACER_FADE_OUT_MS = 160;

type TracerEvent = {
  timeMs: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: "raider" | "guardian";
};

function buildTracerEvents(width: number, height: number): TracerEvent[] {
  // Raider-strike destruction position (must match paths.ts calculation)
  const killX = width * 0.2828 - 8.13;
  const killY = height * 0.7594 + 6.09;

  return [
    { timeMs: 2000, x1: width * 0.05, y1: height * 0.3, x2: width * 0.25, y2: height * 0.4, color: "raider" },

    // Raider-wing engages
    { timeMs: 5500, x1: width * 0.85, y1: height * 0.18, x2: width * 0.25, y2: height * 0.65, color: "raider" },
    { timeMs: 7000, x1: width * 0.15, y1: height * 0.55, x2: width * 0.7, y2: height * 0.2, color: "guardian" },
    { timeMs: 9000, x1: width * 0.6, y1: height * 0.22, x2: width * 0.15, y2: height * 0.7, color: "raider" },
    { timeMs: 10500, x1: width * 0.2, y1: height * 0.45, x2: width * 0.5, y2: height * 0.2, color: "guardian" },

    // Raider-strike dive
    { timeMs: 13000, x1: width * 0.95, y1: height * 0.08, x2: width * 0.45, y2: height * 0.8, color: "raider" },
    { timeMs: 14500, x1: width * 0.78, y1: height * 0.3, x2: width * 0.3, y2: height * 0.85, color: "raider" },
    { timeMs: 16000, x1: width * 0.6, y1: height * 0.5, x2: width * 0.15, y2: height * 0.85, color: "raider" },

    // THE KILL SHOT — guardian-intercept (entering at t=16000) fires on raider-strike
    // raider-strike destroyed at t=12000+4500=16500. Laser fires at t=16400.
    // From guardian-intercept's entry position (lower-left) to raider-strike position.
    { timeMs: 16400, x1: width * 0.06, y1: height * 0.73, x2: killX, y2: killY, color: "guardian" },

    // Guardian-intercept continues counter-attack
    { timeMs: 17500, x1: width * 0.1, y1: height * 0.7, x2: width * 0.6, y2: height * 0.4, color: "guardian" },
    { timeMs: 19000, x1: width * 0.25, y1: height * 0.6, x2: width * 0.75, y2: height * 0.25, color: "guardian" },
    { timeMs: 20500, x1: width * 0.4, y1: height * 0.5, x2: width * 0.85, y2: height * 0.2, color: "guardian" },

    // Final exchange
    { timeMs: 24000, x1: width * 0.7, y1: height * 0.35, x2: width * 0.2, y2: height * 0.6, color: "raider" },
    { timeMs: 26500, x1: width * 0.3, y1: height * 0.55, x2: width * 0.8, y2: height * 0.25, color: "guardian" },
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
  const x1 = event.x1.toFixed(1);
  const y1 = event.y1.toFixed(1);
  const x2 = event.x2.toFixed(1);
  const y2 = event.y2.toFixed(1);

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

export function renderLasers(width: number, height: number, loopMs: number): string {
  const events = buildTracerEvents(width, height);
  const tracers = events.map((e) => renderTracer(e, loopMs)).join("\n    ");
  return `<g class="lasers">
    ${tracers}
  </g>`;
}
