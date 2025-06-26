#!/bin/bash

# Snapbet Architecture Migration Script
# Step 2: Migrate Components to Modules

echo "🚀 Starting component migration..."

# Function to migrate files
migrate_files() {
  local source_pattern=$1
  local destination=$2
  
  if ls $source_pattern 1> /dev/null 2>&1; then
    echo "  Moving $source_pattern to $destination"
    mkdir -p $destination
    mv $source_pattern $destination/
  fi
}

# Migrate Auth Components
echo "🔐 Migrating auth components..."
migrate_files "components/auth/*" "src/modules/auth/components/"
migrate_files "app/(auth)/*" "src/modules/auth/screens/"
migrate_files "hooks/useAuth*.ts" "src/modules/auth/hooks/"
migrate_files "services/auth/*" "src/modules/auth/services/"
migrate_files "stores/authStore.ts" "src/modules/auth/store/"

# Migrate Betting Components
echo "🎲 Migrating betting components..."
migrate_files "components/betting/*" "src/modules/betting/components/"
migrate_files "app/(drawer)/(tabs)/games.tsx" "src/modules/betting/screens/"
migrate_files "app/(drawer)/game/*" "src/modules/betting/screens/"
migrate_files "hooks/useBet*.ts" "src/modules/betting/hooks/"
migrate_files "hooks/useGame*.ts" "src/modules/betting/hooks/"
migrate_files "services/bets/*" "src/modules/betting/services/"
migrate_files "stores/betSlipStore.ts" "src/modules/betting/store/"

# Migrate Messaging Components
echo "💬 Migrating messaging components..."
migrate_files "components/messaging/*" "src/modules/messaging/components/"
migrate_files "app/(drawer)/chat/*" "src/modules/messaging/screens/"
migrate_files "app/(drawer)/(tabs)/messages.tsx" "src/modules/messaging/screens/"
migrate_files "hooks/useChat*.ts" "src/modules/messaging/hooks/"
migrate_files "hooks/useMessage*.ts" "src/modules/messaging/hooks/"
migrate_files "services/messaging/*" "src/modules/messaging/services/"

# Migrate Social Components
echo "👥 Migrating social components..."
migrate_files "components/social/*" "src/modules/social/components/"
migrate_files "components/engagement/*" "src/modules/social/components/engagement/"
migrate_files "hooks/useFriend*.ts" "src/modules/social/hooks/"
migrate_files "hooks/useEngagement*.ts" "src/modules/social/hooks/"
migrate_files "services/social/*" "src/modules/social/services/"

# Migrate Profile Components
echo "👤 Migrating profile components..."
migrate_files "components/profile/*" "src/modules/profile/components/"
migrate_files "app/(drawer)/profile/*" "src/modules/profile/screens/"
migrate_files "hooks/useProfile*.ts" "src/modules/profile/hooks/"
migrate_files "services/profile/*" "src/modules/profile/services/"

# Migrate Settings Components
echo "⚙️ Migrating settings components..."
migrate_files "components/settings/*" "src/modules/settings/components/"
migrate_files "app/(drawer)/settings/*" "src/modules/settings/screens/"
migrate_files "hooks/useSetting*.ts" "src/modules/settings/hooks/"
migrate_files "services/settings/*" "src/modules/settings/services/"

# Migrate Search Components
echo "🔍 Migrating search components..."
migrate_files "components/search/*" "src/modules/search/components/"
migrate_files "app/(drawer)/(tabs)/search.tsx" "src/modules/search/screens/"
migrate_files "hooks/useSearch*.ts" "src/modules/search/hooks/"
migrate_files "services/search/*" "src/modules/search/services/"

# Migrate Media Components
echo "📸 Migrating media components..."
migrate_files "components/camera/*" "src/modules/media/components/camera/"
migrate_files "components/media/*" "src/modules/media/components/"
migrate_files "hooks/useCamera*.ts" "src/modules/media/hooks/"
migrate_files "hooks/useMedia*.ts" "src/modules/media/hooks/"
migrate_files "services/media/*" "src/modules/media/services/"

# Migrate Shared Components
echo "🔄 Migrating shared components..."
migrate_files "components/ui/*" "src/modules/shared/components/"
migrate_files "components/common/*" "src/modules/shared/components/"
migrate_files "hooks/use*.ts" "src/modules/shared/hooks/"
migrate_files "utils/*" "src/modules/shared/utils/"

# Migrate Core Types
echo "📝 Migrating core types..."
migrate_files "types/*.ts" "src/core/types/"

# Migrate Infrastructure
echo "🏗️ Migrating infrastructure..."
migrate_files "services/api/*" "src/infrastructure/api/"
migrate_files "services/supabase/*" "src/infrastructure/database/"
migrate_files "services/storage/*" "src/infrastructure/storage/"
migrate_files "services/analytics/*" "src/infrastructure/analytics/"

# Create migration report
echo "📊 Creating migration report..."
cat > migration-report.md << EOF
# Component Migration Report

## Migration Summary
- Date: $(date)
- Components migrated to new module structure

## Module Status
- [ ] Auth module components migrated
- [ ] Betting module components migrated
- [ ] Messaging module components migrated
- [ ] Social module components migrated
- [ ] Profile module components migrated
- [ ] Settings module components migrated
- [ ] Search module components migrated
- [ ] Media module components migrated
- [ ] Shared module components migrated

## Next Steps
1. Update all import statements
2. Fix any broken references
3. Run tests to verify functionality
4. Update component documentation

## Files Requiring Manual Review
EOF

# Find any remaining component files
echo "🔍 Checking for remaining files..."
find components -type f -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
  echo "- $file" >> migration-report.md
done

echo "✅ Component migration completed!"
echo "📋 See migration-report.md for details"