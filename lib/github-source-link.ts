// This is a static export with no server runtime, so the repository location can't be read from
// `git remote` at request time — matches the existing precedent of hardcoding the public vault
// path in the GitHub Actions deploy workflow (docs/design-notes.md §10).
const GITHUB_OWNER = "athandapani";
const GITHUB_REPO = "wiki-graph-explorer";
const GITHUB_BRANCH = "master";
const VAULT_SUBPATH = "public-vault/wiki";

export function getGithubSourceUrl(nodePath: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${VAULT_SUBPATH}/${nodePath}`;
}
