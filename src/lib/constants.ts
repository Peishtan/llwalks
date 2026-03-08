export const COSMETIC_ITEMS = [
  { id: 'hat-party', name: 'Party Hat', emoji: '🎉', cost: 10, type: 'cosmetic' as const },
  { id: 'hat-cowboy', name: 'Cowboy Hat', emoji: '🤠', cost: 15, type: 'cosmetic' as const },
  { id: 'bandana-red', name: 'Red Bandana', emoji: '🟥', cost: 8, type: 'cosmetic' as const },
  { id: 'sunglasses', name: 'Cool Shades', emoji: '😎', cost: 12, type: 'cosmetic' as const },
  { id: 'bow-tie', name: 'Bow Tie', emoji: '🎀', cost: 10, type: 'cosmetic' as const },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', cost: 25, type: 'cosmetic' as const },
  { id: 'cape', name: 'Super Cape', emoji: '🦸', cost: 20, type: 'cosmetic' as const },
  { id: 'scarf', name: 'Cozy Scarf', emoji: '🧣', cost: 12, type: 'cosmetic' as const },
];

export const BADGE_DEFINITIONS = [
  { id: 'first-walk', name: 'First Walk', emoji: '🐾', description: 'Complete your first walk', condition: 'first_walk' },
  { id: 'streak-7', name: '7-Day Streak', emoji: '🔥', description: 'Walk 7 days in a row', condition: 'streak_7' },
  { id: 'treats-50', name: 'Treat Collector', emoji: '🦴', description: 'Earn 50 treats total', condition: 'treats_50' },
  { id: 'rainy-walker', name: 'Rainy Day Walker', emoji: '🌧️', description: 'Walk in the rain', condition: 'rainy_walk' },
  { id: 'path-complete', name: 'Path Complete!', emoji: '🏆', description: 'Complete the 30-day path', condition: 'path_complete' },
  { id: 'treats-100', name: 'Treat Master', emoji: '💎', description: 'Earn 100 treats total', condition: 'treats_100' },
];

export const PATH_COLORS = [
  'bg-paw-green', 'bg-paw-yellow', 'bg-paw-pink', 'bg-paw-blue', 'bg-paw-purple',
  'bg-paw-green', 'bg-paw-yellow', 'bg-paw-pink', 'bg-paw-blue', 'bg-paw-purple',
  'bg-paw-green', 'bg-paw-yellow', 'bg-paw-pink', 'bg-paw-blue', 'bg-paw-purple',
  'bg-paw-green', 'bg-paw-yellow', 'bg-paw-pink', 'bg-paw-blue', 'bg-paw-purple',
  'bg-paw-green', 'bg-paw-yellow', 'bg-paw-pink', 'bg-paw-blue', 'bg-paw-purple',
  'bg-paw-green', 'bg-paw-yellow', 'bg-paw-pink', 'bg-paw-blue', 'bg-paw-purple',
];
