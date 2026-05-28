// ─── src/index.ts ─────────────────────────────────────────────────────
//
// The local CLI entry point. Writes the SVG to out/contributions.svg.
// (dist/ is now reserved for the bundled action — see package.json
//  scripts and .gitignore.)
//
// To run it:
//   export GITHUB_TOKEN=ghp_yourtokenhere
//   npm start ceyhunolcan
// ──────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from "node:fs";
import { fetchContributions } from "./github/fetch-contributions.js";
import { renderSvg } from "./render/svg.js";

async function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: npm start <github-username>");
    process.exit(1);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Error: set GITHUB_TOKEN environment variable.");
    console.error("Get a token at: https://github.com/settings/tokens");
    process.exit(1);
  }

  console.log(`Fetching contributions for @${username}...`);
  const grid = await fetchContributions(username, token);
  console.log(`✓ Found ${grid.totalContributions} contributions in the past year.`);

  console.log(`Rendering SVG...`);
  const svg = renderSvg(grid);

  mkdirSync("out", { recursive: true });
  const outputPath = "out/contributions.svg";
  writeFileSync(outputPath, svg, "utf-8");

  console.log(`✓ Wrote ${outputPath} (${svg.length} bytes)`);
  console.log(`\nOpen it: open ${outputPath}`);
}

main().catch(err => {
  console.error("Failed:", err.message);
  process.exit(1);
});
