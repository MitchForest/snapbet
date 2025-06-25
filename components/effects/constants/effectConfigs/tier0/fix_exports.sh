#\!/bin/bash

# Function to convert snake_case to camelCase
to_camel_case() {
    echo "$1" | sed -E 's/_([a-z])/\U\1/g'
}

# Fix diamond_hands_preview
sed -i '' 's/export const diamond_hands_previewEffect:/export const diamondHandsPreviewEffect:/' diamond_hands_preview.ts

# Fix down_bad
sed -i '' 's/export const down_badEffect:/export const downBadEffect:/' down_bad.ts

# Fix f_in_chat
sed -i '' 's/export const f_in_chatEffect:/export const fInChatEffect:/' f_in_chat.ts

# Fix game_time
sed -i '' 's/export const game_timeEffect:/export const gameTimeEffect:/' game_time.ts

# Fix gg_ez
sed -i '' 's/export const gg_ezEffect:/export const ggEzEffect:/' gg_ez.ts

# Fix good_vibes
sed -i '' 's/export const good_vibesEffect:/export const goodVibesEffect:/' good_vibes.ts

# Fix mind_blown
sed -i '' 's/export const mind_blownEffect:/export const mindBlownEffect:/' mind_blown.ts

# Fix no_chill
sed -i '' 's/export const no_chillEffect:/export const noChillEffect:/' no_chill.ts

# Fix npc_mode
sed -i '' 's/export const npc_modeEffect:/export const npcModeEffect:/' npc_mode.ts

# Fix rage_quit
sed -i '' 's/export const rage_quitEffect:/export const rageQuitEffect:/' rage_quit.ts

# Fix rough_patch
sed -i '' 's/export const rough_patchEffect:/export const roughPatchEffect:/' rough_patch.ts

# Fix side_eye
sed -i '' 's/export const side_eyeEffect:/export const sideEyeEffect:/' side_eye.ts

# Fix stay_salty
sed -i '' 's/export const stay_saltyEffect:/export const staySaltyEffect:/' stay_salty.ts

# Fix sweating_bullets
sed -i '' 's/export const sweating_bulletsEffect:/export const sweatingBulletsEffect:/' sweating_bullets.ts

# Fix this_you
sed -i '' 's/export const this_youEffect:/export const thisYouEffect:/' this_you.ts

# Fix to_the_moon
sed -i '' 's/export const to_the_moonEffect:/export const toTheMoonEffect:/' to_the_moon.ts

echo "All tier0 files fixed\!"
