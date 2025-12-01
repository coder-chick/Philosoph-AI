# UI and Features Guide

## Modern UI Implementation

### Design System

The Philosoph-AI UI features a modern, sleek design with the following characteristics:

#### Glassmorphism
- Semi-transparent backgrounds with backdrop blur effects
- Applied via `.glass` utility class
- Creates depth and visual hierarchy

#### Dark/Light Mode
- Toggle between themes using sun/moon icon in header
- Theme preference stored in localStorage
- Automatically detects system preference on first visit
- CSS variables for seamless color transitions

#### Animations
Available animations defined in `globals.css`:
- `fadeIn` - Smooth entrance for main content
- `slideIn` - Slides content from top
- `pulse` - Subtle pulsing for active elements
- `bounce` - Bouncing animation for loading dots

#### Color Palette
- Primary: Blue gradient (#0ea5e9 to #0c4a6e)
- Accent: Purple (#9333ea)
- Dark mode: Gray scales with warm undertones
- Each philosopher has a unique brand color

---

## General Mode Feature

### Overview
General Mode allows users to ask philosophical questions and receive answers from multiple philosophers simultaneously, providing diverse perspectives on a single topic.

### How It Works

1. **Theme Detection**
   - System analyzes question using keyword matching
   - Identifies up to 15 philosophical themes (ethics, justice, knowledge, etc.)
   - Scores each theme based on keyword frequency and relevance

2. **Philosopher Selection**
   - Automatically selects 3 most relevant philosophers
   - Considers regional filter (Ancient Greece, Roman, German, Chinese)
   - Falls back to default selection if no strong matches

3. **Multi-Perspective Response**
   - Each philosopher provides a 2-3 sentence answer
   - AI synthesizes an overview highlighting common themes
   - Responses displayed with color-coded borders
   - Shows which philosophical tradition each answer represents

### UI Components

#### General Mode Toggle
```
Location: Filter panel, top of page
State: On/Off switch
Effect: Disables single philosopher selection when enabled
Label: "Multi-perspective answers" when active
```

#### Region Filter
```
Options:
- All Traditions (default)
- Ancient Greece (Socrates, Plato, Aristotle, Epicurus)
- Roman Stoic (Marcus Aurelius, Epicurus)
- German Modern (Nietzsche)
- Ancient China (Confucius, Lao Tzu)

Effect: Filters which philosophers can be selected
```

#### Theme Display
```
Location: Filter panel, right side
Shows: Top 3 detected themes as colored chips
Examples: "Ethics", "Justice", "Knowledge"
Updates: After each question is submitted
```

---

## Theme Detection System

### Philosophy Data Files

**Location:** `philosophy_data/`

1. **themes.json**
   - 15 predefined philosophical themes
   - Each with keywords array and description
   - Used for automatic question categorization

2. **theme_to_philosophers.json**
   - Maps themes to relevant philosophers
   - Each theme linked to 3-5 philosophers
   - Enables intelligent philosopher selection

3. **regions.json**
   - Geographic/historical groupings
   - Includes time periods for each region
   - Supports filtering by philosophical tradition

### Algorithm

**File:** `lib/themeDetector.ts`

```typescript
detectThemes(question: string): ThemeDetectionResult
```
- Normalizes question to lowercase
- Scores themes using keyword regex matching
- Returns top 3 themes with scores
- Suggests 6 relevant philosophers

```typescript
shouldUseGeneralMode(question: string): boolean
```
- Determines if question suits multi-perspective mode
- Checks for broad philosophical topics
- Returns boolean recommendation

```typescript
getThemeDisplayName(theme: string): string
```
- Converts theme IDs to human-readable names
- Used for UI display

---

## Philosopher Cards

### Single Mode
- Grid layout (4 columns on desktop)
- Glassmorphism effect
- Left border in philosopher's brand color
- Hover effects: scale + shadow increase
- Shows name, period, school, and top 3 themes

### Selected State
- Header bar with philosopher details
- Avatar circle with first initial
- "Change" button to return to selection
- Maintains conversation context

---

## Chat Interface

### Message Bubbles
**User Messages:**
- Right-aligned
- Solid primary gradient background
- White text
- Rounded corners (2xl)

**Philosopher Responses (Single Mode):**
- Left-aligned
- Glassmorphism background
- Shows philosopher name at top
- Larger text area for detailed responses

**Multi-Perspective Responses (General Mode):**
- Overview text in italics
- Individual perspectives with colored left border
- Philosopher name label above each response
- Stacked vertically for easy reading

### Loading State
- Three bouncing dots
- Primary color animation
- Staggered timing for smooth effect

### Input Area
- Textarea with 2 rows
- Glassmorphism styling
- Gradient button (primary to purple)
- "Ask" / "Thinking..." states
- Enter to submit (Shift+Enter for new line)

---

## Responsive Design

### Breakpoints
- Mobile: Single column layout
- Tablet (md): 2 columns for philosopher cards
- Desktop (lg): 4 columns for philosopher cards

### Adaptive Elements
- Filter panel wraps on small screens
- Chat messages max 80% width
- Input scales to available space
- Header stacks on mobile

---

## Accessibility

### Theme Toggle
- Labeled button with aria-label
- SVG icons for visual clarity
- Keyboard accessible

### Color Contrast
- WCAG AA compliant in both modes
- Sufficient contrast for text on glass backgrounds
- Focus rings for interactive elements

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit questions
- Escape to close modals (future)

---

## Performance Optimizations

### CSS
- Hardware-accelerated animations (transform, opacity)
- CSS variables for theme switching (no re-render)
- Minimized layout shifts

### React
- useState for local component state
- useEffect for scroll-to-bottom behavior
- Memoized theme context to prevent unnecessary re-renders

### API
- Parallel philosopher queries in general mode
- Limited to 3 philosophers to balance quality/speed
- Token limits per response (512 for multi, 2048 for single)

---

## Future Enhancements

### Planned Features
1. Century slider for temporal filtering
2. Bookmark favorite conversations
3. Export conversation as PDF/Markdown
4. Voice input for questions
5. Animated philosopher avatars
6. Quote library with search
7. Comparison view (side-by-side responses)
8. User preference profiles

### UI Improvements
1. Drag-to-reorder philosopher priorities
2. Custom theme builder
3. Typography size controls
4. Animation speed settings
5. Compact/expanded view toggle

---

## Customization Guide

### Changing Colors
Edit `app/globals.css`:
```css
:root {
  --foreground-rgb: /* Light mode text */
  --background-start-rgb: /* Light mode bg start */
  --background-end-rgb: /* Light mode bg end */
}

.dark {
  --foreground-rgb: /* Dark mode text */
  --background-start-rgb: /* Dark mode bg start */
  --background-end-rgb: /* Dark mode bg end */
}
```

### Adding Animations
Define in `@layer utilities` section:
```css
@keyframes yourAnimation {
  0% { /* start state */ }
  100% { /* end state */ }
}

.animate-yourAnimation {
  animation: yourAnimation 1s ease-in-out;
}
```

### Modifying Glassmorphism
Adjust `.glass` utility:
```css
.glass {
  background: rgba(255, 255, 255, 0.7); /* Adjust opacity */
  backdrop-filter: blur(12px); /* Adjust blur amount */
  /* ... other properties */
}
```

---

## Technical Stack

### Styling
- Tailwind CSS 3.x
- Custom CSS utilities
- CSS variables for theming
- PostCSS for processing

### State Management
- React Context (ThemeProvider)
- Local component state (useState)
- Browser localStorage for persistence

### Icons
- Heroicons via inline SVG
- Custom SVG for philosopher avatars (future)

### Fonts
- Merriweather (serif) - Headings and philosopher names
- Inter (sans-serif) - Body text and UI elements
- Loaded via next/font/google

---

## Troubleshooting

### Dark Mode Not Applying
1. Check ThemeProvider is wrapping app in `layout.tsx`
2. Verify `suppressHydrationWarning` on `<html>` tag
3. Clear localStorage and refresh
4. Check browser console for errors

### Animations Stuttering
1. Reduce animation complexity
2. Use `will-change` CSS property sparingly
3. Check for JavaScript blocking main thread
4. Enable hardware acceleration in browser

### Theme Detection Not Working
1. Verify JSON files in `philosophy_data/` exist
2. Check import paths in `themeDetector.ts`
3. Test with explicit theme keywords
4. Check console for parsing errors

### Glassmorphism Not Visible
1. Ensure browser supports `backdrop-filter`
2. Check element has background content behind it
3. Verify opacity settings allow blur to show
4. Try increasing blur radius

---

## Code Reference

### Key Files
```
app/
├── page.tsx                  # Main UI component
├── layout.tsx                # Root layout with ThemeProvider
├── globals.css               # Global styles and utilities
└── api/ask/route.ts          # API handler with general mode

lib/
├── ThemeProvider.tsx         # Theme context and toggle logic
├── themeDetector.ts          # Theme detection algorithm
└── philosophers.ts           # Philosopher data and prompts

philosophy_data/
├── themes.json               # Theme definitions
├── theme_to_philosophers.json # Theme mappings
└── regions.json              # Geographic groupings
```

### API Endpoints

**POST /api/ask**
```json
// Single mode request
{
  "philosopherId": "socrates",
  "question": "What is virtue?",
  "sessionId": "uuid",
  "useRAG": false
}

// General mode request
{
  "mode": "general",
  "question": "What is virtue?",
  "region": "ancient_greece",
  "sessionId": "uuid"
}
```

**Response (Single Mode)**
```json
{
  "answer": "Philosopher's response...",
  "philosopherId": "socrates",
  "hasRagContext": false,
  "sessionId": "uuid"
}
```

**Response (General Mode)**
```json
{
  "mode": "general",
  "overview": "Synthesized overview...",
  "perspectives": [
    {
      "philosopher": "socrates",
      "response": "Socratic perspective..."
    }
  ],
  "themes": ["ethics", "virtue", "knowledge"],
  "sessionId": "uuid"
}
```
