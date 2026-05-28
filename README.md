# strafe

> Your GitHub contributions, on patrol.

`strafe` turns your GitHub contribution graph into an animated SVG where a fighter ship strafes across the grid, clearing each contribution cell with brief laser blasts. Drop it in your profile README for an alternative to the [snake](https://github.com/Platane/snk) animation.

```
[ animated demo gif coming here ]
```

## Status

🚧 **In development.** Not yet published to npm or available as a GitHub Action.

Currently working on:
- [x] GitHub GraphQL contribution fetcher
- [ ] Static SVG grid renderer
- [ ] Fighter sprite + strafe path animation
- [ ] Laser fire + cell explosion effects
- [ ] GitHub Action wrapper
- [ ] npm package + CLI

## Local development

```bash
# Install dependencies
npm install

# Generate a GitHub Personal Access Token at:
# https://github.com/settings/tokens (needs `read:user` scope)
export GITHUB_TOKEN=ghp_your_token_here

# Run the fetcher on any GitHub username
npm start ceyhunolcan
```

Expected output: an ASCII version of the user's contribution grid printed to your terminal, plus a count of total contributions for the year.

## Roadmap

**v0.1** — fetch & static render
Fetch contribution data, render the grid as a static SVG matching GitHub's color palette.

**v0.2** — animated strafe
A single fighter flies a serpentine path across the grid, firing lasers that destroy cells in order.

**v0.3** — GitHub Action
Package the renderer as a GitHub Action so anyone can use it on their own profile.

**v0.4** — themes & customization
Light/dark themes, custom palettes, configurable fighter style.

**v1.0** — npm publish, docs site, examples

## Why?

Most GitHub profile contribution animations stop at the snake. `strafe` aims to be the second one people reach for — same visual mechanic, different aesthetic. Built deliberately as a clean-room space-combat aesthetic with no franchise IP.

## License

MIT
