# Adaptive Layout Engine for Multi-Surface Ads

A frontend-focused adaptive layout engine that dynamically evaluates advertising content and selects the most suitable composition for different display surfaces.

The project demonstrates how a creative system can adapt the same advertising content across Desktop, Tablet, and Mobile while maintaining readability, visual balance, CTA visibility, and safe margins.

## Live Demo

https://adaptive-layout-engine-coral.vercel.app

## GitHub

https://github.com/murari-jayanthi/adaptive-layout-engine

---

## Overview

The Adaptive Layout Engine evaluates:

- Content density
- Available surface dimensions
- Typography pressure
- CTA visibility
- Visual balance
- Safe margins

It generates and ranks multiple layout candidates and selects the highest-scoring composition for the current surface.

Supported surfaces:

- Desktop — 1440 × 900
- Tablet — 1024 × 768
- Mobile — 390 × 844

Supported layout modes:

- Split
- Balanced
- Stacked

---

## How It Works

The core decision pipeline is:

User Content
↓
Content Analysis
↓
Surface Analysis
↓
Candidate Generation
↓
Constraint Scoring
↓
Candidate Ranking
↓
Layout Selection
↓
Adaptive Parameters
↓
Rendered Creative

The engine evaluates all available layout candidates instead of relying on a single breakpoint-based rule.

---

## Candidate Scoring

Each candidate layout is evaluated against four primary constraints:

| Constraint | Weight |
|---|---:|
| Typography | 35% |
| Visual Balance | 30% |
| CTA Visibility | 20% |
| Safe Margins | 15% |

The weighted score determines the preferred layout for the current combination of content and surface.

This makes the system deterministic, explainable, and easy to inspect through the Engine panel.

---

## Adaptive Parameters

Layout selection and visual adaptation are treated as separate concerns.

After selecting a layout, the engine calculates adaptive parameters such as:

- Text scale
- Content width
- Spacing
- CTA scale
- Visual emphasis

These parameters are connected to the rendered creative through CSS custom properties.

This allows the engine to adjust the visual treatment without duplicating layout logic for every surface.

---

## Content Density

Content density is calculated using deterministic heuristics based on:

- Headline length
- Description length
- CTA length

The engine categorizes content as:

- Low
- Medium
- High

Higher content density increases layout pressure and can influence the selected composition.

---

## Interactive Features

The application includes:

- Live content editing
- Desktop / Tablet / Mobile surface switching
- Adaptive layout selection
- Candidate ranking
- Constraint inspection
- Adaptive parameter inspection
- Content analysis
- Adaptation history
- Product visual import
- Asset replacement
- Asset removal and restoration
- Asset details
- Preview mode
- Zoom controls
- Creative export
- Interactive CTA
- Workspace interaction menu

Imported product visuals are preserved across surfaces without unwanted cropping.

---

## Export

The Export action captures the actual rendered creative from the canvas and generates a PNG at a higher pixel density.

The exported creative reflects the currently selected surface and rendered layout rather than recreating a separate simplified version.

---

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- `html-to-image`

No backend or authentication is required.

---

## Project Structure

```text
adaptive-layout-engine/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── engine/
│   │   ├── layoutEngine.ts
│   │   └── layoutRules.ts
│   │
│   ├── types/
│   │   └── layout.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── package.json
├── vite.config.ts
└── README.md