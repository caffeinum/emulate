#!/usr/bin/env bash
# Builds packages/emulate and commits it, alone at the repo root, to an install branch
# so consumers can `bun add github:<owner>/emulate#<dist-sha>` without building.
set -euo pipefail

BRANCH="${DIST_BRANCH:-dist}"
REMOTE="${DIST_REMOTE:-origin}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree is dirty; commit first so the dist commit maps to a source sha" >&2
  exit 1
fi

SOURCE_SHA="$(git rev-parse HEAD)"
git fetch --quiet "$REMOTE" "$BRANCH" 2>/dev/null || true
if git rev-parse --verify --quiet "$REMOTE/$BRANCH" >/dev/null &&
  git log "$REMOTE/$BRANCH" --format=%B | grep -q "source: $SOURCE_SHA"; then
  echo "dist for $SOURCE_SHA already on $REMOTE/$BRANCH"
  git log "$REMOTE/$BRANCH" --format="%H %s" --grep "source: $SOURCE_SHA" | head -1
  exit 0
fi

pnpm turbo build --filter=emulate... >/dev/null

WORKTREE="$(mktemp -d)"
trap 'git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true' EXIT
if git rev-parse --verify --quiet "$REMOTE/$BRANCH" >/dev/null; then
  git worktree add --quiet -B "$BRANCH" "$WORKTREE" "$REMOTE/$BRANCH"
else
  git worktree add --quiet --detach "$WORKTREE"
  git -C "$WORKTREE" checkout --quiet --orphan "$BRANCH"
fi
git -C "$WORKTREE" rm -r --quiet --force --ignore-unmatch . >/dev/null
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

cp -R packages/emulate/dist "$WORKTREE/dist"
cp LICENSE THIRD_PARTY_NOTICES.md README.md "$WORKTREE/"
SOURCE_SHA="$SOURCE_SHA" node -e '
  const fs = require("node:fs");
  const pkg = JSON.parse(fs.readFileSync("packages/emulate/package.json", "utf8"));
  const root = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const out = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    license: pkg.license,
    type: pkg.type,
    exports: pkg.exports,
    main: pkg.main,
    types: pkg.types,
    bin: pkg.bin,
    engines: { node: root.engines.node },
    dependencies: pkg.dependencies,
    emulateSourceSha: process.env.SOURCE_SHA,
  };
  fs.writeFileSync(process.argv[1], JSON.stringify(out, null, 2) + "\n");
' "$WORKTREE/package.json"

if grep -rq "workspace:" "$WORKTREE/package.json"; then
  echo "error: dist package.json still has workspace references" >&2
  exit 1
fi

git -C "$WORKTREE" add -A
git -C "$WORKTREE" commit --quiet -m "dist: emulate $(node -p 'require("./packages/emulate/package.json").version') from ${SOURCE_SHA:0:12}

source: $SOURCE_SHA"
git -C "$WORKTREE" push --quiet "$REMOTE" "$BRANCH"
echo "$(git -C "$WORKTREE" rev-parse HEAD) dist for $SOURCE_SHA"
