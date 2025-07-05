#!/bin/bash

# Git Override Script - Push current code to upstream repository
# This will override any existing upstream content

echo "🔄 Git Override Script - Tailscale Network Dashboard"
echo "=================================================="
echo "This script will override upstream repository with current code"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install git first."
    exit 1
fi

# Add your repository URL here
read -p "Enter your Git repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL is required"
    exit 1
fi

echo "📁 Initializing git repository..."
git init

echo "📝 Adding all files..."
git add .

echo "💾 Creating initial commit..."
git commit -m "Initial commit: Tailscale Network Dashboard

- Real-time network topology visualization
- Tailscale API integration
- Dark mode as default
- Grafana integration support
- Docker deployment ready
- Complete monitoring stack"

echo "🔗 Adding remote origin..."
git remote add origin "$REPO_URL"

echo "🚀 Force pushing to override upstream..."
git push -f origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully overridden upstream repository!"
    echo "📍 Repository URL: $REPO_URL"
    echo "🌟 Your code is now the authoritative source"
else
    echo "❌ Failed to push to upstream. Check your credentials and repository access."
    echo "💡 You may need to:"
    echo "   - Set up SSH keys or personal access token"
    echo "   - Verify repository URL is correct"
    echo "   - Check repository permissions"
fi

echo ""
echo "📋 Next steps:"
echo "1. Clone repository: git clone $REPO_URL"
echo "2. Make changes and commit: git add . && git commit -m 'Update'"
echo "3. Push changes: git push origin main"