#!/bin/bash

# Snapbet Architecture Migration Script
# Step 1: Create New Directory Structure

echo "🏗️  Creating new architecture directory structure..."

# Create main src directory
mkdir -p src

# Create module directories
echo "📦 Creating feature modules..."
mkdir -p src/modules/auth/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/betting/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/messaging/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/social/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/profile/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/settings/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/search/{components,screens,hooks,services,store,types,utils,__tests__}
mkdir -p src/modules/media/{components,services,hooks,types,utils,__tests__}
mkdir -p src/modules/shared/{components,hooks,services,types,utils,__tests__}

# Create core directories
echo "🎯 Creating core layer..."
mkdir -p src/core/{entities,repositories,use-cases,types,errors}

# Create infrastructure directories
echo "🔧 Creating infrastructure layer..."
mkdir -p src/infrastructure/api/{client,interceptors,resources}
mkdir -p src/infrastructure/database/{repositories,migrations}
mkdir -p src/infrastructure/storage
mkdir -p src/infrastructure/analytics
mkdir -p src/infrastructure/monitoring
mkdir -p src/infrastructure/di
mkdir -p src/infrastructure/config

# Create design system directories
echo "🎨 Creating design system..."
mkdir -p src/design-system/components/{Button,Card,Modal,Form,Feedback,Layout}
mkdir -p src/design-system/tokens
mkdir -p src/design-system/themes
mkdir -p src/design-system/utils

# Create navigation directory
echo "🧭 Creating navigation structure..."
mkdir -p src/navigation/{config,guards,utils}

# Create global directories
echo "🌍 Creating global directories..."
mkdir -p src/config
mkdir -p src/utils
mkdir -p src/__tests__/{fixtures,mocks,utils}

# Create index files for all modules
echo "📝 Creating index files..."
for module in auth betting messaging social profile settings search media shared; do
  echo "// Public API for $module module
export * from './components';
export * from './hooks';
export * from './types';
export * from './services';" > "src/modules/$module/index.ts"
done

# Create root index files
echo "// Core exports
export * from './entities';
export * from './repositories';
export * from './use-cases';
export * from './types';" > "src/core/index.ts"

echo "// Infrastructure exports
export * from './api';
export * from './database';
export * from './storage';
export * from './monitoring';
export * from './di';" > "src/infrastructure/index.ts"

# Create README files for documentation
echo "📚 Creating documentation files..."
echo "# Auth Module

This module handles all authentication-related functionality including:
- User login/logout
- Session management
- OAuth integration
- Password reset" > "src/modules/auth/README.md"

echo "# Core Layer

This layer contains the business logic and domain entities that are independent of any external frameworks or libraries." > "src/core/README.md"

echo "# Infrastructure Layer

This layer handles all external integrations and technical implementations including:
- API client and communication
- Database repositories
- Storage solutions
- Monitoring and analytics" > "src/infrastructure/README.md"

echo "✅ Directory structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Run migration scripts to move existing code"
echo "2. Update imports to use new structure"
echo "3. Configure TypeScript paths"
echo "4. Update build configuration"