#!/usr/bin/env bun

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const TEST_GIFS = [
  {
    url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif',
    name: 'celebration.gif',
  },
  {
    url: 'https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif',
    name: 'excited.gif',
  },
  {
    url: 'https://media.giphy.com/media/12XMGIWtrHBl5e/giphy.gif',
    name: 'disappointed.gif',
  },
  {
    url: 'https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif',
    name: 'nervous.gif',
  },
  {
    url: 'https://media.giphy.com/media/xT0GqI5uUiCa3PufTi/giphy.gif',
    name: 'frustration.gif',
  },
];

async function downloadGif(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Downloaded: ${path.basename(filepath)}`);
}

async function getActiveSimulator(): Promise<string | null> {
  try {
    const output = execSync('xcrun simctl list devices booted', { encoding: 'utf8' });
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/\s+(.+?)\s+\(([A-F0-9-]+)\)\s+\(Booted\)/);
      if (match) {
        return match[2]; // Return the UUID
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting active simulator:', error);
    return null;
  }
}

async function addToSimulator(deviceId: string, filepath: string): Promise<void> {
  try {
    execSync(`xcrun simctl addmedia "${deviceId}" "${filepath}"`, { encoding: 'utf8' });
    console.log(`✅ Added to simulator: ${path.basename(filepath)}`);
  } catch (error) {
    console.error(`❌ Failed to add ${path.basename(filepath)}:`, error);
  }
}

async function main() {
  console.log('🎬 iOS Simulator GIF Loader\n');

  // Get active simulator
  const deviceId = await getActiveSimulator();

  if (!deviceId) {
    console.error('❌ No active iOS simulator found. Please start a simulator first.');
    process.exit(1);
  }

  console.log(`📱 Found active simulator: ${deviceId}\n`);

  // Create temp directory
  const tempDir = path.join(process.cwd(), '.temp-gifs');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  try {
    // Download GIFs
    console.log('📥 Downloading test GIFs...\n');
    for (const gif of TEST_GIFS) {
      const filepath = path.join(tempDir, gif.name);
      await downloadGif(gif.url, filepath);
    }

    console.log('\n📲 Adding GIFs to simulator...\n');

    // Add to simulator
    for (const gif of TEST_GIFS) {
      const filepath = path.join(tempDir, gif.name);
      await addToSimulator(deviceId, filepath);
    }

    console.log('\n✨ All done! Check your Photos app in the simulator.');
    console.log('💡 Tip: You may need to refresh the Photos app to see the new images.');
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up temp files...');
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// Run the script
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
