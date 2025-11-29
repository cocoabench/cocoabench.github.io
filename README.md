# CocoaBench Website

## File Structure

```
cocoabench/
├── index.html          # Home page (Introduction)
├── leaderboard.html    # Leaderboard page
├── blog.html           # Blog page
└── assets/
    ├── css/
    │   └── style.css   # Global styles
    ├── js/
    │   ├── logo.js     # Logo animation
    │   └── table.js    # Leaderboard table logic
    ├── data/
    │   └── data.json   # Leaderboard data
    └── logos/          # Model provider logos
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

