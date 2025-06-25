#\!/bin/bash

# Fix built_different
sed -i '' 's/export const built_different:/export const builtDifferentEffect:/' built_different.ts

# Fix buzzer_beater
sed -i '' 's/export const buzzer_beater:/export const buzzerBeaterEffect:/' buzzer_beater.ts

# Fix diamond_hands
sed -i '' 's/export const diamond_hands:/export const diamondHandsEffect:/' diamond_hands.ts

# Fix dice_roll
sed -i '' 's/export const dice_roll:/export const diceRollEffect:/' dice_roll.ts

# Fix ratio
sed -i '' 's/export const ratio:/export const ratioEffect:/' ratio.ts

# Fix sheesh
sed -i '' 's/export const sheesh:/export const sheeshEffect:/' sheesh.ts

# Fix storm
sed -i '' 's/export const storm:/export const stormEffect:/' storm.ts

# Fix touch_grass
sed -i '' 's/export const touch_grass:/export const touchGrassEffect:/' touch_grass.ts

echo "All tier1 files fixed\!"
