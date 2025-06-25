export const UI_CATEGORIES = {
  WINS: {
    name: 'Wins',
    icon: '🏆',
    effects: [
      // Tier 0
      'fire',
      'money',
      'confetti',
      'trending_up',
      'too_cool',
      'flex',
      // Tier 1
      'fire_level_2',
      'money_level_2',
      'celebration_level_2',
      'cool_level_2',
      'muscle_level_2',
      // Tier 2
      'fire_level_3',
      'money_level_3',
      'celebration_level_3',
      'cool_level_3',
    ],
  },
  LOSSES: {
    name: 'Losses',
    icon: '😭',
    effects: [
      // Tier 0
      'tears',
      'rough_patch',
      'mind_blown',
      'nervous',
      // Tier 1
      'tears_level_2',
      // Tier 2
      'tears_level_3',
    ],
  },
  VIBES: {
    name: 'Vibes',
    icon: '🎭',
    effects: [
      // Tier 0
      'skull',
      'crying_laughing',
      'no_cap',
      'clown_check',
      'vibing',
      'bussin',
      'sus',
      'big_w',
      'big_l',
      'side_eye',
      'chefs_kiss',
      'this_you',
      'npc_mode',
      // Tier 1
      'sheesh',
      'ratio',
      'touch_grass',
      'built_different',
      'caught_4k',
      // Tier 2
      'toxic',
      'rizz',
      'main_character',
    ],
  },
  HYPE: {
    name: 'Hype',
    icon: '⚡',
    effects: [
      // Tier 0
      'rocket',
      'gg_ez',
      'rage_quit',
      'poggers',
      'f_in_chat',
      'game_time',
      'menace',
      'no_chill',
      'stay_salty',
      // Tier 1
      'sports_level_2',
      // Tier 2
      'sports_level_3',
    ],
  },
  WILDCARDS: {
    name: 'Wild Cards',
    icon: '🎲',
    effects: [
      // Tier 0
      'good_vibes',
      'sparkle',
      'diamond_hands_preview',
      // Tier 1
      'dice_roll',
      'storm',
      'sparkle_level_2',
      'diamond_hands',
      // Tier 2
      'sparkle_level_3',
      'slot_machine',
    ],
  },
  BETTING: {
    name: 'Betting',
    icon: '💰',
    effects: [
      // Tier 0
      'sweating_bullets',
      'down_bad',
      'bet_slip_drop',
      'boosted',
      'to_the_moon',
      'bag_alert_preview',
      'buzzer_beater_preview',
      // Tier 1
      'buzzer_beater',
      // Tier 2
      'bag_alert',
    ],
  },
} as const;
