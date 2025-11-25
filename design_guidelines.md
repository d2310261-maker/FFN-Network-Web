# NFL Fan Hub - Design Guidelines

## Design Approach
**Hybrid Approach**: Drawing inspiration from sports platforms (ESPN, TheScore, NFL.com) combined with Material Design principles for data-dense applications. Focus on scannable information hierarchy, real-time updates, and clear admin controls.

## Typography System
- **Display/Headers**: Bold sans-serif (Roboto Condensed or similar) - weights 700-900
  - Page titles: text-5xl md:text-6xl font-bold
  - Section headers: text-3xl md:text-4xl font-bold
  - Game scores: text-4xl md:text-5xl font-black
- **Body/Data**: Clean sans-serif (Inter or Roboto)
  - Game details: text-base md:text-lg font-medium
  - Chat messages: text-sm
  - Timestamps: text-xs font-normal
  - News articles: text-base leading-relaxed

## Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: py-8 md:py-12
- Card gaps: gap-4 md:gap-6
- Container max-width: max-w-7xl mx-auto

## Core Pages & Layouts

### Navigation
Sticky header with horizontal nav bar
- Logo/site name on left
- Main nav items centered: Scores | Schedule | Previous Weeks | News | Pick'ems
- Admin login/dashboard button on right (when authenticated)
- Mobile: Hamburger menu with full-screen overlay

### Live Scores Page
**Hero Section**: Compact banner (h-32 to h-40) with current week number and live indicator
**Game Cards Grid**: 
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each card shows: Team names (large, bold), scores (huge, centered), quarter/time status, clickable for details
- Live games: pulsing indicator, bold treatment
- Final games: subdued treatment

**Individual Game Detail View** (when clicked):
- Split layout: 60% game stats | 40% live chat sidebar
- Game section: Team matchup, quarter-by-quarter scores, game status
- Chat section: Fixed height (h-96), scrollable messages, input at bottom
- Mobile: Stacked layout with tabbed interface (Game Stats | Chat)

### Chat Component (Reusable)
- Message container: h-96 overflow-y-auto with smooth scrolling
- Messages: Stacked bubbles with username, timestamp, message text
- Input area: Fixed at bottom with send button (always visible)
- Auto-scroll to latest messages
- No authentication required for viewing/posting

### Previous Weeks Page
Accordion or tab-based layout organized by week
- Week selector at top: Pills/buttons for Week 1-18
- Game results in card grid (same style as live scores but all final)
- Final scores prominent with winner emphasized

### Schedule Page
Timeline/calendar view
- Week-by-week breakdown with date headers
- Each game: Teams, date/time, location info
- Upcoming games: Clean card layout with time remaining badge
- Past games: Link to final score

### News Page
Blog-style layout
- Featured post at top: Large card with excerpt (if exists)
- Grid of news cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each card: Title, date, excerpt, read more link
- Admin controls (add/edit/delete) visible only when authenticated

### Pick'ems Page
Two-column layout (single column on mobile)
- Left: Current week's pick'em link (large CTA card)
- Right: Official rules (expandable sections or simple scrollable text)
- Archive: Dropdown to access previous weeks' pick'ems

### Admin Dashboard
Card-based control panel
- Game management: Add game form, edit existing games table
- Score updates: Live score input fields with update buttons
- Mark final: Toggle switches or buttons per game
- News management: Create/edit posts with simple form
- Pick'ems management: URL input for weekly links, rules editor

## Component Library

### Game Card
Elevated card with hover lift effect
- Border for status emphasis (live/final)
- Team names: Full width, centered, font-bold text-lg
- Scores: Centered, massive text (text-5xl), font-black
- Status badge: Top-right corner (LIVE, FINAL, time remaining)
- Click target: Full card interactive

### Chat Message Bubble
Left-aligned layout
- Username: font-semibold text-sm
- Timestamp: text-xs opacity-70
- Message: text-sm in contained bubble with rounded corners
- Spacing: mb-2 between messages

### Admin Control Cards
Grouped form sections with clear labels
- Form inputs: Full-width with labels, border focus states
- Action buttons: Primary (save/submit), secondary (cancel)
- Tables: Striped rows, hover states, action column on right

### Buttons
- Primary CTA: Rounded, font-semibold, px-6 py-3
- Secondary: Outlined variant
- Icon buttons: Square/circular for actions

## Responsive Breakpoints
- Mobile: Single column, stacked layouts
- Tablet (md): 2-column grids, side-by-side layouts
- Desktop (lg): 3-column grids, optimal reading widths

## Images
No hero images needed - this is a data-focused application. Use:
- Team logos/icons via placeholders or icon fonts (avoid actual NFL trademarks)
- Generic sports imagery only in news posts if relevant

## Key UX Patterns
- Real-time updates: Visual indicators for live games
- Optimistic UI: Instant feedback on admin actions
- Loading states: Skeleton screens for score data
- Error states: Clear messaging for failed updates
- Toast notifications: Success/error feedback for admin actions