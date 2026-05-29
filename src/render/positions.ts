// ─── src/render/positions.ts ──────────────────────────────────────────
//
// Position evaluators for each ship at a given moment in the loop.
//
// Used by lasers.ts to compute tracer endpoints from REAL ship positions,
// so laser fire originates at the shooter ship and lands on the target
// ship (instead of hitting empty space at hardcoded percentages, which
// was the v2.3 bug).
//
// IMPORTANT: the path constants here MUST stay in sync with paths.ts.
// If a ship's flight path changes in paths.ts, update its position
// function here to match.
// ──────────────────────────────────────────────────────────────────────

import type { Grid } from "../github/fetch-contributions.js";
import { CELL_SIZE, cellToPixel } from "./grid.js";
import { serpentinePath } from "./path.js";
import { MS_PER_CELL, GUARDIAN_LAG_MS } from "./animation.js";

export type Point = { x: number; y: number };

// ─── Path-evaluation primitives ────────────────────────────────────────

function evalLinear(p0: Point, p1: Point, t: number): Point {
  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t,
  };
}

function evalQuadratic(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function evalCubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const b0 = u * u * u;
  const b1 = 3 * u * u * t;
  const b2 = 3 * u * t * t;
  const b3 = t * t * t;
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
  };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

// ─── Ship position evaluators ──────────────────────────────────────────

/** Main Raider — flies the serpentine path, one cell every MS_PER_CELL. */
export function raiderMainPositionAt(timeMs: number, grid: Grid): Point {
  const numWeeks = grid.cells[0].length;
  const numDays = grid.cells.length;
  const path = serpentinePath(numWeeks, numDays);
  const step = Math.max(0, Math.min(Math.floor(timeMs / MS_PER_CELL), path.length - 1));
  const coord = path[step];
  const { x, y } = cellToPixel(coord.week, coord.day);
  return { x: x + CELL_SIZE / 2, y: y + CELL_SIZE / 2 };
}

/** Main Guardian — same path, trails Raider by GUARDIAN_LAG_MS. */
export function guardianMainPositionAt(timeMs: number, grid: Grid): Point {
  return raiderMainPositionAt(Math.max(0, timeMs - GUARDIAN_LAG_MS), grid);
}

/** Mothership — slow linear drift across upper background. */
export function mothershipPositionAt(timeMs: number, width: number, height: number): Point {
  const t = clamp01((timeMs - 500) / 25000);
  return evalLinear(
    { x: width + 50, y: height * 0.15 },
    { x: -50, y: height * 0.18 },
    t
  );
}

/** Raider-Wing (slim interceptor) — quadratic + smooth quadratic sweep. */
export function raiderWingPositionAt(timeMs: number, width: number, height: number): Point {
  const t = clamp01((timeMs - 4000) / 8000);
  const wingY = height * 0.3;
  const p0 = { x: width + 30, y: wingY };
  const p1 = { x: width * 0.6, y: wingY - 18 };
  const p2 = { x: width * 0.3, y: wingY + 10 };
  const p3 = { x: -30, y: wingY + 6 };

  // First half: Q (quadratic from p0 to p2 via p1)
  // Second half: T (smooth quadratic; control = reflection of p1 about p2)
  if (t < 0.5) {
    return evalQuadratic(p0, p1, p2, t * 2);
  }
  const reflected = { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };
  return evalQuadratic(p2, reflected, p3, (t - 0.5) * 2);
}

/** Raider-Strike (heavy bomber) — cubic Bezier diagonal dive. */
export function raiderStrikePositionAt(timeMs: number, width: number, height: number): Point {
  const t = clamp01((timeMs - 12000) / 6000);
  return evalCubic(
    { x: width + 20, y: -15 },
    { x: width * 0.7, y: height * 0.3 },
    { x: width * 0.4, y: height * 0.7 },
    { x: -20, y: height + 15 },
    t
  );
}

/** Guardian-Intercept (UFO saucer) — cubic Bezier banking pass. */
export function guardianInterceptPositionAt(timeMs: number, width: number, height: number): Point {
  const t = clamp01((timeMs - 16000) / 7000);
  return evalCubic(
    { x: -25, y: height * 0.75 },
    { x: width * 0.3, y: height * 0.45 },
    { x: width * 0.55, y: height * 0.85 },
    { x: width + 25, y: height * 0.25 },
    t
  );
}
