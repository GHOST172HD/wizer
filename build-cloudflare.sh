#!/bin/sh
# Cloudflare Pages : repertoire public strict, aucune publication de .git.
set -eu
rm -rf dist
mkdir -p dist
for dir in assets css data js; do
  test -d "$dir" || { echo "Dossier manquant: $dir"; exit 1; }
  cp -R "$dir" "dist/$dir"
done
for file in ./*.html _headers robots.txt llms.txt; do
  if test -f "$file"; then cp "$file" dist/; fi
done
test -f dist/index.html
test -f dist/mentions-legales.html
test -f dist/confidentialite.html
test ! -e dist/.git
echo "Publication preparee : dist/ (sans .git)"
