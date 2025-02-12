#!/bin/bash

echo "🔄 Installing npm dependencies in all codespaces..."

# Loop through each directory inside ./codespaces
for dir in ./codespaces/*/; do
  if [ -f "$dir/package.json" ]; then
    echo "📦 Installing dependencies for $(basename "$dir")..."
    (cd "$dir" && npm install)
  else
    echo "⚠️ Skipping $(basename "$dir") (no package.json found)"
  fi
done

echo "✅ All dependencies installed successfully!"