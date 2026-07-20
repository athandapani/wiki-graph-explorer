---
name: release-protocol
description: Step-by-step release checklist for wiki-graph-explorer — finalize CHANGELOG, merge develop to main, tag, merge back, bump version. Use when cutting a release or the user says "release", "cut a release", "ship vX.Y.Z", "tag a release".
---

**Prerequisites:** Must be on `develop` branch with a clean working tree.

**Steps:**

1. **Finalize CHANGELOG** — Change `[X.Y.Z] - UNDER DEVELOPMENT` → `[X.Y.Z] - DD-MMM-YYYY` in `CHANGELOG.md`
   - Commit: `chore: release vX.Y.Z`

2. **Merge to main**
   ```bash
   git checkout main && git pull origin main
   git merge develop --no-ff -m "Merge branch 'develop' into main for release vX.Y.Z"
   ```

3. **Tag the release** (on main)
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z - Brief description"
   git push origin vX.Y.Z
   ```

4. **Merge back to develop**
   ```bash
   git checkout develop && git merge main --no-ff
   ```

5. **Post-release version bump** (on develop)
   - Bump `package.json`: `"version": "X.Y.Z"` → next version
   - Add `## [X.Y+1.0] - UNDER DEVELOPMENT` to `CHANGELOG.md`
   - Commit: `chore: bump version for next development cycle`

6. **Push** (ASK USER FIRST)
   ```bash
   git push origin main && git push origin develop
   ```

**Note:** Deployment target is GitHub Pages — a GitHub Actions workflow should build the static
export and publish `out/` to `gh-pages` on push to `main` (and on tag push).
