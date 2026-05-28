// ─── src/action.ts ────────────────────────────────────────────────────
//
// GitHub Action entry point. This is what runs when someone adds
// `uses: ceyhunolcan/strafe@v1` to their workflow.
//
// Different from src/index.ts (which is the local CLI). Both share
// the same rendering code — only the inputs and outputs differ.
//
// Inputs come from the action.yml definition, read via @actions/core.
// @actions/core handles logging, error reporting, and output values
// the GitHub Actions way.
// ──────────────────────────────────────────────────────────────────────

import * as core from "@actions/core";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fetchContributions } from "./github/fetch-contributions.js";
import { renderSvg } from "./render/svg.js";

async function main() {
  try {
    // Read inputs declared in action.yml
    const username = core.getInput("github_user_name", { required: true });
    const output = core.getInput("output") || "dist/strafe.svg";
    const token = core.getInput("github_token", { required: true });

    core.info(`Fetching contributions for @${username}...`);
    const grid = await fetchContributions(username, token);
    core.info(`✓ Found ${grid.totalContributions} contributions.`);

    core.info(`Rendering SVG...`);
    const svg = renderSvg(grid);

    // Ensure the output directory exists, then write the file.
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, svg, "utf-8");

    // Set the output so subsequent workflow steps can reference it.
    core.setOutput("output_path", output);
    core.info(`✓ Wrote ${output} (${svg.length} bytes)`);
  } catch (err: any) {
    // core.setFailed marks the workflow step as failed and surfaces
    // the error in the GitHub Actions UI.
    core.setFailed(err.message ?? String(err));
  }
}

main();
