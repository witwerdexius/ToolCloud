#!/bin/bash
# Sets up Git hooks for this project.
# Run via: npm run setup-hooks

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
# Bump patch version in package.json before every push.

cd "$(git rev-parse --show-toplevel)"

echo "Bumping patch version..."
npm version patch --no-git-tag-version

git add package.json
git commit -m "chore: bump patch version [skip ci]"
EOF

chmod +x "$HOOKS_DIR/pre-push"
echo "Git hooks installed successfully."
