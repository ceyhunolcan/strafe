// ─── src/index.ts ─────────────────────────────────────────────────────
//
// The entry point. For Evening 1, all this does is fetch your
// contributions and print a summary to the terminal.
//
// To run it:
//   1. Make sure you've created a GitHub Personal Access Token with
//      `read:user` scope. Get one at: github.com/settings/tokens
//   2. Export it as an environment variable in your terminal:
//        export GITHUB_TOKEN=ghp_yourtokenhere
//   3. Run:
//        npm start ceyhunolcan
//      (replace ceyhunolcan with any GitHub username you want to fetch)
// ──────────────────────────────────────────────────────────────────────

import { fetchContributions } from "./github/fetch-contributions.js";

async function main() {
  // Read the username from the command line.
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: npm start <github-username>");
    process.exit(1);
  }

  // Read the GitHub token from environment.
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Error: set GITHUB_TOKEN environment variable.");
    console.error("Get a token at: https://github.com/settings/tokens");
    process.exit(1);
  }

  console.log(`Fetching contributions for @${username}...`);
  const grid = await fetchContributions(username, token);

  console.log(`\n✓ Found ${grid.totalContributions} contributions in the past year.`);
  console.log(`\nGrid shape: ${grid.cells.length} days × ${grid.cells[0].length} weeks\n`);

  // Print a tiny ASCII version of the grid so we can sanity-check the data.
  // Each row is a day of the week; each column is a week.
  // Cells are rendered as: ' ' (level 0), '·' (1), '▪' (2), '◼' (3), '█' (4)
  const symbols = [" ", "·", "▪", "◼", "█"];
  for (const row of grid.cells) {
    console.log(row.map(c => symbols[c.level]).join(""));
  }
  console.log();
}

main().catch(err => {
  console.error("Fetch failed:", err.message);
  process.exit(1);
});
