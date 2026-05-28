# strafe

> Your GitHub contributions, on patrol.

`strafe` turns your GitHub contribution graph into an animated SVG where a fighter ship strafes across the grid, clearing each contribution cell with brief laser blasts. Drop it in your profile README for an alternative to the [snake](https://github.com/Platane/snk) animation.

```
[ animated demo gif coming here ]
```

## Usage

Add this workflow to your GitHub profile repository (the one named the same as your username) at `.github/workflows/strafe.yml`:

```yaml
name: Generate Strafe Animation

on:
  schedule:
    - cron: "0 */12 * * *"
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest

    steps:
      - uses: ceyhunolcan/strafe@v1
        with:
          github_user_name: ${{ github.repository_owner }}
          output: dist/strafe.svg

      - uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then reference the SVG in your README:

```markdown
![strafe](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_USERNAME/output/strafe.svg)
```

## Inputs

| Name | Required | Default | Description |
|---|---|---|---|
| `github_user_name` | ✓ | — | GitHub username to fetch contributions for |
| `output` | | `dist/strafe.svg` | Where to write the rendered SVG |
| `github_token` | | `${{ github.token }}` | Token with read access to user contributions |

## Status

🚧 **In development.** Not yet published to npm. Action usable from this repo.

- [x] GitHub GraphQL contribution fetcher
- [x] Static SVG grid renderer
- [x] Fighter sprite + serpentine path planning
- [x] Animated strafe with laser blasts and cell explosions
- [x] GitHub Action wrapper
- [ ] Themes & customization (light/dark, custom colors)
- [ ] Multiple ship formations
- [ ] npm package + standalone CLI

## Local development

```bash
# Install dependencies
npm install

# Generate a GitHub Personal Access Token at:
# https://github.com/settings/tokens (needs `read:user` scope)
export GITHUB_TOKEN=ghp_your_token_here

# Run the local CLI
npm start ceyhunolcan
# → writes dist/contributions.svg

# Build the action bundle (for publishing)
npm run package
# → writes dist/action.js
```

## Why?

Most GitHub profile contribution animations stop at the snake. `strafe` aims to be the second one people reach for — same visual mechanic, different aesthetic. Built deliberately as a clean-room space-combat aesthetic with no franchise IP.

## License

MIT
