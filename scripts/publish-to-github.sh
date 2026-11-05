#!/usr/bin/env bash
# Creates a PRIVATE repo under your GitHub account and pushes this project.
# Usage:  bash scripts/publish-to-github.sh [repo-name]
set -e
OWNER="ahmedhalima"
REPO="${1:-kids-world}"
cd "$(dirname "$0")/.."

command -v git >/dev/null || { echo "Install git first: https://git-scm.com/downloads"; exit 1; }
command -v gh  >/dev/null || { echo "Install GitHub CLI first: https://cli.github.com"; exit 1; }

if ! gh auth status >/dev/null 2>&1; then
  echo "You are not logged in to GitHub. Starting login..."
  gh auth login --hostname github.com --git-protocol https --web
fi
LOGGED=$(gh api user --jq .login)
if [ "$LOGGED" != "$OWNER" ]; then
  echo "Logged in as '$LOGGED' but expected '$OWNER'."
  echo "Run: gh auth logout   then   gh auth login   and choose the $OWNER account."
  exit 1
fi

bash scripts/check-secrets.sh

[ -d .git ] || git init -b main
git add .
git diff --cached --quiet || git commit -m "Initial commit: Kids World learning site"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "Repo $OWNER/$REPO already exists; pushing to it."
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
  git push -u origin main
else
  gh repo create "$OWNER/$REPO" --private --source=. --remote=origin --push \
    --description "Arabic learning games site for kids"
fi
echo "Visibility: $(gh repo view "$OWNER/$REPO" --json visibility --jq .visibility)"
echo "Done: https://github.com/$OWNER/$REPO"
