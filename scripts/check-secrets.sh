#!/usr/bin/env bash
# Blocks the push if tracked/staged files look like they contain secrets.
set -e
PATTERN='(sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|(api[_-]?key|secret|token|password)[[:space:]]*[:=][[:space:]]*["'\'']?[A-Za-z0-9_\-]{16,})'
FILES=$(git ls-files --cached --others --exclude-standard 2>/dev/null || find . -type f -not -path './.git/*')
BAD=0
for f in $FILES; do
  case "$f" in .env|.env.*|*.pem|*.key|*.p12|*.pfx) [ "$f" = ".env.example" ] || { echo "BLOCKED: $f must not be committed"; BAD=1; }; continue;; esac
  if grep -InE "$PATTERN" "$f" >/tmp/secret_hits 2>/dev/null; then echo "POSSIBLE SECRET in $f:"; cat /tmp/secret_hits; BAD=1; fi
done
[ "$BAD" = 0 ] && echo "✅ No secrets detected." || { echo "❌ Fix the above before pushing."; exit 1; }
