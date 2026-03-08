## 🐕 Dog-Care Tracker — "Paw Path"

### Overview

A playful, mobile-first dog-care tracker with a Candyland-style 30-day walking path, treat rewards system, and cloud-synced accounts via Supabase.

---

### 1. Authentication

- Simple email sign-up/login screen with a cute dog welcome illustration
- Profile stores dog name and chosen starting avatar

### 2. Database (Supabase)

- **profiles** — dog name, avatar selection, current path position, treat count, current month
- **activity_log** — timestamp, type (walk/pee/poop), weather (sun/rain), bonus earned
- **unlockables** — user's earned cosmetics and badges

### 3. Main Screen — The Paw Path

- **Calendar day space winding Candyland-style path** with colorful tiles, rendered as an SVG/illustrated trail (image updates every month)
- **Dog avatar** positioned on the current space, animated hop forward on walk log
- **Treat counter** displayed as a bone-shaped badge in the corner
- **Action buttons** at the bottom: 🐾 Walk, 💧 Pee, 💩 Poop, ☀️/🌧️ Weather toggle
- Logging a walk moves the dog forward 1 space
- Pee = +1 treat, Poop = +2 treats
- If pee/poop logged during a walk → +1 bonus treat
- **Rain overlay**: when weather is set to rain, animated rain drops fall over the path

### 4. Treat Shop & Achievements

- **Cosmetic unlocks**: Spend treats to unlock hats, bandanas, sunglasses, path themes for the dog avatar
- **Achievement badges**: Earned automatically — "7-Day Streak", "First Walk", "50 Treats", "Rainy Day Walker", "Path Complete" etc.
- Visual grid of locked/unlocked items

### 5. Activity History

- **Calendar view** showing which days had walks, pee, poop with small icons
- Tap a day to see detailed log entries
- Monthly summary stats (total walks, treats earned)

### 6. Design

- Warm pastel color palette (soft oranges, yellows, greens)
- Rounded cards and buttons with playful shadows
- Cute dog emoji/illustrations throughout
- Mobile-first layout, responsive for desktop
- Joyful micro-animations (avatar hop, treat sparkle, rain drops)