---
name: release-protocol
description: Step-by-step release checklist for wiki-graph-explorer — finalize CHANGELOG, bump version, tag, push. Use when cutting a release or the user says "release", "cut a release", "ship vX.Y.Z", "tag a release".
---

**Prerequisites:** Must be on `master` with a clean working tree. There is no `develop`/`main`
split for this repo — all work branches off `master` and merges back into it directly, and
releases are cut and tagged on `master` too.

**Steps:**

1. **Finalize CHANGELOG** — In `CHANGELOG.md`, write a new dated section summarizing everything
   shipped since the last release (pull from the merged epics' commit messages / handoffs):
   ```markdown
   ## [X.Y.Z] — DD-MMM-YYYY

   ### Added
   - ...

   ### Fixed
   - ...
   ```
   Insert it directly below the existing `## [Unreleased]` header — leave that header's
   `### Added` / `### Changed` / `### Fixed` subsections empty, ready to accumulate the *next*
   cycle's changes. Do not rename or remove `[Unreleased]`.

2. **Bump `package.json`** — `"version": "X.Y.Z"` (this is the only place the version bump
   happens; there is no separate pre-bump to a "next dev version" placeholder — the version in
   `package.json` always reflects the most recently released version until the next release cuts).

3. **Sanity build** — `npm run build` (per CLAUDE.md's Verification Before Commit rule; a version
   bump touches nothing functional, but confirm the build still passes before committing).

4. **Commit** — stage `CHANGELOG.md` and `package.json`:
   ```bash
   git commit -m "chore: release vX.Y.Z"
   ```

5. **Tag the release** (on `master`)
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z - Brief description"
   ```

6. **Push** (ASK USER FIRST)
   ```bash
   git push origin master
   git push origin vX.Y.Z
   ```

7. **Publish to npm** (ASK USER FIRST — this is a real, public, irreversible publish) — from the
   clean `master` checkout just pushed (which now matches tag `vX.Y.Z`):
   ```bash
   npm whoami          # confirm logged in as the package owner before publishing
   npm publish
   ```
   There is no CI workflow that does this — `.github/workflows/deploy.yml` only builds and
   deploys the GitHub Pages site (see the Note below). Publishing to npm is a separate, manual
   step that is easy to forget after a release, silently leaving the registry version behind
   `package.json`/the git tag. Confirm afterward:
   ```bash
   npm view wiki-graph-explorer version   # should now equal X.Y.Z
   ```

**Note:** Deployment target is GitHub Pages via a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the static export and publishes it on every push to
`master` — pushing the release commit in step 6 triggers a real deploy automatically; no
separate publish step is needed for the site. Check `gh run list --limit 5` to confirm the run
succeeded. This is distinct from the npm publish in step 7, which does need a separate manual
step.
