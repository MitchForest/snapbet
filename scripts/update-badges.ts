#!/usr/bin/env bun

/**
 * Badge Update Script
 *
 * Updates badges for all active users in the system.
 * Designed to be run via cron job.
 *
 * Usage:
 *   bun run scripts/update-badges.ts
 *
 * Cron setup (runs every hour):
 *   0 * * * * cd /path/to/snapbet && bun run scripts/update-badges.ts
 *
 * Environment variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_ANON_KEY - Your Supabase anon key
 */

import { updateAllUserBadges } from '@/services/badges/badgeAutomation';
import fs from 'fs';
import path from 'path';

// Lock file location
const LOCK_FILE = path.join('/tmp', 'snapbet-badge-update.lock');

// Check if lock file exists and is recent (less than 30 minutes old)
function isLocked(): boolean {
  try {
    if (!fs.existsSync(LOCK_FILE)) {
      return false;
    }

    const stats = fs.statSync(LOCK_FILE);
    const ageInMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;

    // If lock is older than 30 minutes, consider it stale
    if (ageInMinutes > 30) {
      console.log('Removing stale lock file');
      fs.unlinkSync(LOCK_FILE);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking lock file:', error);
    return false;
  }
}

// Create lock file
function createLock(): void {
  try {
    fs.writeFileSync(LOCK_FILE, Date.now().toString());
  } catch (error) {
    console.error('Error creating lock file:', error);
    throw error;
  }
}

// Remove lock file
function removeLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    console.error('Error removing lock file:', error);
  }
}

// Main execution
async function main() {
  console.log('=== Badge Update Script ===');
  console.log(`Started at: ${new Date().toISOString()}`);

  // Check for lock
  if (isLocked()) {
    console.log('Another badge update is already running. Exiting.');
    process.exit(0);
  }

  // Create lock
  try {
    createLock();
  } catch {
    console.error('Failed to create lock file. Exiting.');
    process.exit(1);
  }

  try {
    // Run badge updates
    const result = await updateAllUserBadges();

    // Log summary
    console.log('\n=== Summary ===');
    console.log(`Users updated: ${result.updated}`);
    console.log(`Errors: ${result.errors}`);

    // Log significant changes
    const significantChanges = result.changes.filter(
      (change) => change.added.length > 0 || change.removed.length > 0
    );

    if (significantChanges.length > 0) {
      console.log(`\nBadge changes: ${significantChanges.length} users`);
      significantChanges.forEach((change) => {
        if (change.added.length > 0) {
          console.log(`  ${change.userId} earned: ${change.added.join(', ')}`);
        }
        if (change.removed.length > 0) {
          console.log(`  ${change.userId} lost: ${change.removed.join(', ')}`);
        }
      });
    }

    // Exit with appropriate code
    process.exit(result.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during badge update:', error);
    process.exit(1);
  } finally {
    // Always remove lock
    removeLock();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, cleaning up...');
  removeLock();
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  removeLock();
  process.exit(143);
});

// Run main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  removeLock();
  process.exit(1);
});
