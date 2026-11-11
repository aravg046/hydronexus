#!/usr/bin/env sh
# Creates a NEW public GitHub repository called hydronexus-website and pushes this project to it.
# Requires: git and the GitHub CLI (https://cli.github.com), logged in once with `gh auth login`.
# It refuses to touch an existing repository.
set -e
REPO="hydronexus-website"
if gh repo view "$REPO" >/dev/null 2>&1; then echo "A repository named $REPO already exists for this account. Stopping so nothing is overwritten."; exit 1; fi
[ -d .git ] || git init -b main
git add -A
git commit -m "Initial commit: HydroNexus website (React + Vite + Three.js)"
gh repo create "$REPO" --public --source=. --remote=origin --push \
  --description "HydroNexus: student research website on sequentially triggered peptide hydrogels (conceptual 3D MixStix simulation)"
gh repo view --web
