# CocoaBench Website

## File Structure

```
cocoabench/
├── index.html              # Home page (Introduction, Examples, Gallery)
├── leaderboard.html        # Leaderboard page
├── blog.html               # Blog page
└── assets/
    ├── css/
    │   └── style.css       # Global styles
    ├── js/
    │   ├── logo.js         # Logo animation
    │   ├── table.js        # Leaderboard table rendering
    │   ├── chart.js        # Performance bar chart
    │   ├── gallery.js      # Solution gallery component
    │   ├── examples.js     # Example showcase component
    │   └── toc.js          # Table of contents
    ├── data/
    │   ├── data.json       # Leaderboard & chart data
    │   └── examples.json   # Example tasks & model solutions
    └── logos/              # Model provider logos
        ├── anthropic.png
        ├── openai.png
        ├── google.png
        ├── meta.png
        ├── deepseek.png
        └── alibaba.png
```

## Adding a New Model

Edit `assets/data/data.json` and add a new entry:

```js
{
    "rank": 7,
    "model": "Model-Name",
    "organization": "CompanyName",
    "pass_rate": 50.0,
    "results": [1, 0, 1, ...],  // N results, 1=pass, 0=fail
    "links": [
        "https://example.com/q1/model",
        ...  // N links
    ]
}
```

**Note**: The `organization` name must match a logo filename in `assets/logos/` (lowercase). Add a new logo file if introducing a new provider.

## Adding a New Logo for Model Provider

1. Prepare a PNG logo (recommended ~100x100px)
2. Name the file `{organization_lowercase}.png`
3. Place it in `assets/logos/`

## Local Preview

Open HTML files directly in browser, or use a local server:

```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

---

## Data Structure Reference

### Overview

| File | Location | Used By |
|------|----------|---------|
| `data.json` | `assets/data/` | Leaderboard table, Performance bar chart |
| `examples.json` | `assets/data/` | Example showcase, Solution gallery |

---

### `data.json` — Leaderboard Data

Each entry represents one model row in the leaderboard:

```json
{
    "rank": 2,
    "model": "Gemini-3 Pro",
    "subtitle": "Thinking",          // Optional - displays below model name
    "organization": "Google",
    "pass_rate": 36.0,
    "results": [0, 1, 1, 0, ...],    // 1=pass, 0=fail for each question
    "links": ["https://...", ...]    // Link for each result cell
}
```

#### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `rank` | ✓ | Display rank (integer) |
| `model` | ✓ | Model display name |
| `subtitle` | ✗ | Secondary label (e.g., "extended", "Thinking") — renders in italic below the model name |
| `organization` | ✓ | Must match a logo filename in `assets/logos/` |
| `pass_rate` | ✓ | Score percentage |
| `results` | ✓ | Array of 0/1 for each question |
| `links` | ✓ | Array of URLs (same length as results) |

#### Handling Model Variants

For the same model with different modes (e.g., GPT-4o vs GPT-4o with thinking), add separate entries:

```json
{ "rank": 3, "model": "GPT-4o", "organization": "OpenAI", ... },
{ "rank": 4, "model": "GPT-4o", "subtitle": "Thinking", "organization": "OpenAI", ... }
```

---

### `examples.json` — Example Tasks & Model Solutions

Structure:

```json
{
  "examples": [
    {
      "id": 1,
      "title": "Task Title",
      "type": "text" | "embed",
      "content": { ... },
      "answer": "...",
      "reasoning": "...",
      "model_solutions": {
        "Model-Key": {
          "status": "pass" | "fail",
          "solution": "Markdown content..."
        }
      }
    }
  ]
}
```

#### Model Solutions Keys

The `model_solutions` keys are looked up by `gallery.js`. To configure which models appear and their display names, edit `getModelOrder()` in `assets/js/gallery.js`:

```javascript
function getModelOrder() {
    return [
        'Claude-3.5-Sonnet',                                              // Simple: key = display name
        { name: 'GPT-4o', subtitle: 'Thinking', key: 'GPT-4o-thinking' }, // With subtitle
        'Gemini-2.0-Pro',
    ];
}
```

| Property | Description |
|----------|-------------|
| `name` | Display name |
| `subtitle` | Optional secondary label |
| `key` | Key to match in `model_solutions` (defaults to `name`) |

#### Example: Adding a Model Variant

1. In `examples.json`, add solutions with a unique key:
   ```json
   "model_solutions": {
       "GPT-4o": { "status": "pass", "solution": "..." },
       "GPT-4o-thinking": { "status": "pass", "solution": "..." }
   }
   ```

2. In `gallery.js`, update `getModelOrder()`:
   ```javascript
   return [
       { name: 'GPT-4o', key: 'GPT-4o' },
       { name: 'GPT-4o', subtitle: 'Thinking', key: 'GPT-4o-thinking' },
   ];
   ```

---

## Visual Identity & Color System

The design of CocoaBench follows a **"Warm & Organic"** aesthetic, mimicking the tones of cocoa, paper, and ink. When adding new charts or visualizations, please adhere to the following color system to maintain consistency.

### 1. Semantic Colors (Performance)
Used for pass/fail states, heatmaps, and result grids. These should be distinct but not harsh.

| State | Color Name | Hex | Visualization | Usage |
|-------|------------|-----|---------------|-------|
| **Pass** | Matcha | `#66BB6A` | ![#66BB6A](https://placehold.co/80x25/66BB6A/66BB6A) | Successful test cases, high scores. |
| **Fail** | Berry | `#EF5350` | ![#EF5350](https://placehold.co/80x25/EF5350/EF5350) | Failed test cases, errors. |
| **Neutral**| Milk Foam | `#E0E0E0` | ![#E0E0E0](https://placehold.co/80x25/E0E0E0/E0E0E0) | N/A results, empty states, borders. |

### 2. Categorical Palette (Charts & Comparison)
Use this sequence when plotting multiple models or categories. The colors are chosen to contrast well with the warm background.

| Sequence | Color | Hex | Preview |
|:---:|:---|:---|:---|
| 1 | **Cocoa** | `#5D4037` | ![#5D4037](https://placehold.co/60x40/5D4037/5D4037) |
| 2 | **Gold** | `#FFB74D` | ![#FFB74D](https://placehold.co/60x40/FFB74D/FFB74D) |
| 3 | **Teal** | `#26A69A` | ![#26A69A](https://placehold.co/60x40/26A69A/26A69A) |
| 4 | **Plum** | `#AB47BC` | ![#AB47BC](https://placehold.co/60x40/AB47BC/AB47BC) |
| 5 | **Slate** | `#78909C` | ![#78909C](https://placehold.co/60x40/78909C/78909C) |
| 6 | **Terra** | `#FF7043` | ![#FF7043](https://placehold.co/60x40/FF7043/FF7043) |

> **Visualization Tip**: Avoid using pure black (`#000000`) for charts. Use Cocoa Dark (`#3E2723`) or Slate (`#455A64`) for axes and text.

### 3. Sequential Scale (Heatmaps)
For visualizing density or score magnitude (Low → High).

| | | | | |
|---|---|---|---|---|
| ![#D7CCC8](https://placehold.co/50x25/D7CCC8/D7CCC8)<br>`#D7CCC8` | ![#A1887F](https://placehold.co/50x25/A1887F/A1887F)<br>`#A1887F` | ![#795548](https://placehold.co/50x25/795548/795548)<br>`#795548` | ![#5D4037](https://placehold.co/50x25/5D4037/5D4037)<br>`#5D4037` | ![#3E2723](https://placehold.co/50x25/3E2723/3E2723)<br>`#3E2723` |
| Low | | | | High |

### 4. Background Hierarchy
Maintain visual depth using these neutral tones.

- **Canvas**: `#FFFFFF` (Main background)
- **Paper**: `#FAFAFA` (Cards, Sections)
- **Divider**: `#EEEEEE` (Lines, Borders)

