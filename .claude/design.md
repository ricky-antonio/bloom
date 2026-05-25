# Design System

## Visual reference

**`bloom-preview.png` in the project root is the authoritative visual target.**
Read it before implementing any UI component. When the image and the text spec conflict,
the image wins.

![Bloom preview](../bloom-preview.png)

Key things visible in the preview that are easy to get wrong:

| Element | What the image shows |
|---------|----------------------|
| Detail panel header | `NEWLY SELECTED` in 9px all-caps muted text (`#8AABBC`), above the concept name — not a ring badge pill |
| Expand button | Warm peach/orange — uses the peach family, NOT dark slate `#496580` |
| Related concept tags | Wrapping flow layout, up to 5 chips — not a fixed 4-chip grid |
| Toolbar right side | `Save map · Export · + New concept` buttons; `+ New concept` is the primary action (mint/teal accent) |
| Node count in toolbar | Shows `34 nodes · depth 3` — depth is displayed alongside node count |
| Legend | Bottom-left: `● Sky = Awareness · ● Peach = Identity · ● Mint = Experience · ● Distant` with filled coloured dots |
| Node labels | Multi-word labels wrap with a hyphen break (e.g. `conscious-ness`) — SVG text wrapping needed |
| Ring 2 nodes | Visibly smaller and more transparent — the distance gradient reads clearly in the image |

---

## Brand personality
Curious · Warm · Inviting · Unhurried · Expansive

This is a tool for exploring ideas — not a productivity app, not a dashboard. Every visual choice should feel like a thoughtful friend laying out ideas on a table. Never clinical, never cold, never shouty.

---

## Typography

Font: **Inter** (via `next/font/google`) — single family for all text.

| Role | Size | Weight | Line height | Usage |
|------|------|--------|-------------|-------|
| Hero | 48px | 700 | 1.1 | Wordmark in EmptyState |
| Display | 32px | 700 | 1.2 | (reserved — not used in v1) |
| h1 / Panel heading | 20px | 700 | 1.3 | DetailPanel concept name |
| h2 | 16px | 600 | 1.4 | Tagline in EmptyState |
| h3 / App name | 13px | 700 | 1.4 | Toolbar logo, core node label |
| Body | 11px | 400 | 1.65 | AI definition text, general body copy |
| Small / Ring1 label | 10px | 600 | 1.4 | Ring1 node labels |
| Micro / Ring2+ | 8–9px | 400–600 | 1.4 | Ring2/3 labels, meta text, sub-labels |

**Minimum font size: 8px.** Never smaller.

---

## Colour system

### Sky family — awareness / cognitive
How we think about, perceive, or know the concept.

| Shade | Hex | Role |
|-------|-----|------|
| 50 | `#F0F7FF` | Ring1 awareness badge background |
| 100 | `#DDEEF8` | Hover tint on sky elements |
| 200 | `#BADDFF` | ★ Ring1 awareness border, core node border |
| 300 | `#8AABBC` | Ring2 awareness border (at 40% opacity) |
| 400 | `#5A8AAA` | ★ Ring1 awareness label text |
| 500 | `#496580` | ★ Primary text, core node label |
| 600 | `#3A5068` | Hover on primary text elements |
| 700 | `#2C3E52` | Deep text (rare) |
| 800 | `#1E2C3A` | (reserved) |
| 900 | `#111C26` | (reserved) |

### Peach family — identity / self
How the concept relates to self and being.

| Shade | Hex | Role |
|-------|-----|------|
| 50 | `#FFF8F0` | Ring1 identity badge background |
| 100 | `#FFE8D6` | Hover tint on peach elements |
| 200 | `#FFDBBB` | ★ Ring1 identity border |
| 300 | `#E0A880` | Ring2 identity border (at 40% opacity) |
| 400 | `#C07040` | ★ Ring1 identity label text |
| 500 | `#9A5030` | Deep peach (rare) |
| 600 | `#7A3A20` | (reserved) |
| 700 | `#5A2A18` | (reserved) |
| 800 | `#3C1C10` | (reserved) |
| 900 | `#200E08` | (reserved) |

### Mint family — experiential / phenomenal
How the concept feels or manifests in lived experience.

| Shade | Hex | Role |
|-------|-----|------|
| 50 | `#F0FFFC` | Ring1 experiential badge background |
| 100 | `#CBEFE8` | Hover tint on mint elements |
| 200 | `#BAFFF5` | ★ Ring1 experiential border |
| 300 | `#80C8B8` | Ring2 experiential border (at 40% opacity) |
| 400 | `#40A090` | ★ Ring1 experiential label text |
| 500 | `#2A7060` | Deep mint (rare) |
| 600 | `#205848` | (reserved) |
| 700 | `#184030` | (reserved) |
| 800 | `#10281C` | (reserved) |
| 900 | `#08140E` | (reserved) |

### Neutral / Slate family — surfaces and chrome

| Shade | Hex | Role |
|-------|-----|------|
| 50 | `#F7F4F0` | ★ Page background |
| 100 | `#EEE8E0` | Surface 2 (pressed states) |
| 200 | `#DDDBD4` | Dividers |
| 300 | `#BACCDA` | ★ Muted text (tx-3) |
| 400 | `#8AABBC` | ★ Secondary text (tx-2) |
| 500 | `#496580` | ★ Primary text (tx-1) |

### Semantic colours

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Success | `#F0FFFC` | `#2A7060` | `#BAFFF5` |
| Warning | `#FFF8F0` | `#C07040` | `#FFDBBB` |
| Danger | `#FFF0F0` | `#C04040` | `#FFBBBB` |
| Info | `#F0F7FF` | `#5A8AAA` | `#BADDFF` |

---

## CSS variables

Defined in `app/globals.css`. These are the only values components should reference.

```css
:root {
  /* Page and surface colours */
  --bg:          #F7F4F0;   /* page background — warm off-white */
  --surface:     #FFFFFF;   /* elevated surfaces (cards, nodes) */
  --surface-2:   #F0EDE8;   /* pressed/secondary surfaces */

  /* Borders */
  --border:      rgba(73,101,128,0.10);  /* default border */
  --border-2:    rgba(73,101,128,0.18);  /* focus / hover border */

  /* Text */
  --tx-1:        #496580;   /* primary text */
  --tx-2:        #8AABBC;   /* secondary text */
  --tx-3:        #BACCDA;   /* muted / placeholder text */

  /* Category accent colours */
  --sky:         #BADDFF;   /* awareness/cognitive border */
  --sky-text:    #5A8AAA;   /* awareness/cognitive text */
  --peach:       #FFDBBB;   /* identity/self border */
  --peach-text:  #C07040;   /* identity/self text */
  --mint:        #BAFFF5;   /* experiential/phenomenal border */
  --mint-text:   #40A090;   /* experiential/phenomenal text */

  /* Radii */
  --radius:      8px;
  --radius-lg:   14px;
  --radius-xl:   22px;
}
```

---

## Layout & shell

| Element | Spec |
|---------|------|
| Toolbar | Height 50px, full width, `background: rgba(247,244,240,0.97)`, `backdrop-filter: blur(8px)`, `border-bottom: 1px solid rgba(73,101,128,0.08)` |
| Graph canvas | Full viewport minus toolbar (calc 100vh - 50px) |
| Detail panel | Fixed, right 16px, top 66px, width 224px |
| ZoomControls | Fixed, bottom 24px, right 16px |
| Legend | Fixed, bottom 24px, left 16px |
| LoadingBloom | Absolute, centred in canvas |

### Z-index scale
| Layer | Value | Elements |
|-------|-------|---------|
| Floating controls | 80 | ZoomControls, Legend |
| Detail panel | 90 | DetailPanel |
| Toolbar | 100 | Toolbar |
| Loading overlay | 110 | LoadingBloom |
| Toasts | 200 | react-hot-toast |

---

## Component specs

### Buttons

**Primary** — "Expand this concept" (peach CTA — matches preview image)
- bg `#FFDBBB` (peach-200), text `#C07040` (peach-400), border `1px solid #E0A880`
- border-radius `var(--radius-xl)`, height 36px, width 100% (full-width in panel)
- Hover: bg `#FFE8D6`, border `#FFDBBB`
- Active: opacity 0.9
- Disabled: opacity 0.5, cursor not-allowed
- Loading: label changes to present-participle ("Expanding…"), disabled

**Accent** — "+ New concept" toolbar button (mint/teal — matches preview image)
- bg `#BAFFF5` (mint-200), text `#40A090` (mint-400), border `1px solid #80C8B8`
- border-radius `var(--radius-xl)`, height 30px, padding 0 12px
- Hover: bg `#CBEFE8`

**Secondary** — Toolbar actions (Save map, Export)
- bg transparent, border `1px solid rgba(73,101,128,0.2)`, text `#496580`
- Hover: border `var(--border-2)`, bg `rgba(73,101,128,0.04)`
- Height 30px, padding 0 12px, border-radius `var(--radius)`

**Ghost** — general low-emphasis
- No border, text `#8AABBC`
- Hover: text `#496580`

**Danger** — destructive actions (Clear graph confirmation)
- bg transparent, border `rgba(192,64,64,0.2)`, text `#C04040`
- Hover: bg `rgba(192,64,64,0.06)`

### Cards / panels
- bg `var(--surface)`, border `1px solid var(--border)`, border-radius `var(--radius-lg)`
- padding 16px
- Shadow: `0 2px 12px rgba(73,101,128,0.08)`

### DetailPanel header (replaces ring badge — matches preview image)
The panel does NOT use a ring badge pill. Instead it shows:
1. `NEWLY SELECTED` — 9px/600, `#8AABBC`, all-caps, letter-spacing 0.10em, margin-bottom 4px
2. Concept name — 20px/700, `#496580`, immediately below

The category/ring information is communicated by the node's colour in the graph,
not repeated in the panel header. Keep the panel clean.

### Related concept tags (DetailPanel — wrapping flow, not fixed 4-grid)
Up to 5 tags in a `flex-wrap: wrap` row with 4px gap. Each chip:
- Small pill: border-radius 99px, padding 3px 10px, font 9px/600
- Cycle accent colours by index (wraps after 3):
  0: sky — bg `#F0F7FF`, border `#BADDFF`, text `#5A8AAA`
  1: peach — bg `#FFF8F0`, border `#FFDBBB`, text `#C07040`
  2: mint — bg `#F0FFFC`, border `#BAFFF5`, text `#40A090`
- Hover: slight darkening of background
- aria-label: `"Explore [tag]"`

### Form fields (SearchBar)
- bg `var(--surface)`, border `1px solid rgba(73,101,128,0.15)`, border-radius `var(--radius-xl)`
- Height 42px, width 320px
- Placeholder text: `var(--tx-3)`
- Focus: border `var(--border-2)`, `outline: none`
- Error shake: `transform: translateX(-4px) → translateX(4px)`, 150ms × 3

---

## Node visual specs

### Core node
- Circle 84px diameter
- bg `var(--surface)`, border `2px solid #BADDFF`
- Label: 13px/700, `#496580`, centred
- Sub-label "origin": 8px/600, `#BADDFF`, uppercase, letter-spacing 0.12em
- Shadow: `0 2px 12px rgba(73,101,128,0.10)`

### Ring 1 nodes
- Circle 64px diameter
- bg `var(--surface)`, border `1.5px solid [category colour]`
- Label: 10px/600, category text colour
- Sub-label below circle: 9px/500, lighter category colour

### Ring 2 nodes
- Circle 46px diameter
- bg `rgba(255,255,255,0.6)`, border `1px solid [parent category colour at 40% opacity]`
- Label: 8.5px, muted — `#AACCDC` / `#E0A880` / `#80C8B8` per parent category

### Ring 3 nodes
- Circle 32px diameter
- bg `rgba(255,255,255,0.3)`, border `1px solid rgba(73,101,128,0.10)`
- Label: 8px, `#C8D8E4` — barely visible, hints at unexplored territory

### Edges
- Ring1 edges: 1.5px, category colour at 30% opacity
- Ring2 edges: 1px, category colour at 15% opacity
- Ring3 edges: 0.5px, `rgba(73,101,128,0.08)`
- No arrowheads

### Node states
- **Hover:** scale 1.08×, 150ms ease; connected edges brighten to full category colour
- **Selected:** `filter: drop-shadow(0 0 8px [category colour])`; connected edges at full opacity
- **Expanding:** scale pulses 1.0 → 1.05 → 1.0, 800ms loop; small spinner ring orbits node
- **Appearing:** scale 0 → 1, 300ms spring, staggered 40ms per node

---

## Spacing system

Base unit: 4px

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tightest gaps |
| sm | 8px | Icon-to-text gap, tag padding |
| md | 12px | Button padding |
| lg | 16px | Card/panel padding |
| xl | 24px | Section spacing |
| 2xl | 32px | Large gaps |
| 3xl | 48px | Full-section spacing |

---

## Motion rules

| Element | Duration | Easing | Notes |
|---------|----------|--------|-------|
| Node hover scale | 150ms | ease | Fast — feels responsive |
| Panel slide-in | 200ms | ease | translateX(240px) → 0 |
| Node appear | 300ms | spring (cubic-bezier 0.34,1.56,0.64,1)) | Staggered 40ms per node |
| Re-centre transition | 600ms | ease-out | Nodes slide to new positions |
| Loading bloom spin | 3s | linear infinite | — |
| Text cursor blink | 1s | step-end infinite | — |

**Never animate:** Anything time-critical (user interactions during expansion), list items that change frequently.
**Always animate:** Dialog/panel open/close, node appearance, hover state changes.
**No bounce on panels** — spring easing is only for nodes appearing on screen.

---

## Responsive strategy

This is a desktop-first application. The D3 canvas requires a mouse for full interaction.

| Breakpoint | Min width | Behaviour |
|------------|-----------|-----------|
| Desktop | 1024px+ | Full layout as designed |
| Tablet | 768px–1023px | Graph canvas contracts; detail panel narrows to 180px |
| Mobile | < 768px | Display a message: "Bloom is best explored on a larger screen." Canvas still renders but interaction is limited. |

Touch events for D3 zoom/pan should be wired where possible (bonus — not required for v1).
Minimum tap target: 44×44px for all Toolbar buttons.

---

## Legend component spec (matches preview image)

Single-line horizontal format, bottom-left, fixed position.

```
● Sky = Awareness  ● Peach = Identity  ● Mint = Experience  ● Distant
```

- Each item: filled circle (8px) in the category colour + label text
- Separator: two spaces (no pipe or bullet between items)
- Font: 9px/500, colour `#8AABBC`
- Container: bg `rgba(255,255,255,0.85)`, border `1px solid rgba(73,101,128,0.08)`,
  border-radius 8px, padding 6px 10px
- "Distant" entry has a grey dot (`#BACCDA`) — represents ring3 nodes

---

## Toolbar spec (matches preview image)

```
[bloom]  [atom · consciousness  34 nodes · depth 3]  [Save map] [Export] [+ New concept]
```

- Left: "bloom" wordmark, 13px/700, `#496580`
- Centre: concept pill — atom icon + concept name + node count + depth, all in one pill
  Format: `atom-icon  consciousness  ·  34 nodes · depth 3`
  Pill style: bg `#F0F7FF`, border `1px solid rgba(186,221,255,0.6)`, border-radius 99px
  Node count + depth: 10px/400, `#8AABBC`, separator `·`
- Right buttons (left to right):
  - "Save map" — secondary style (downloads JSON, same as Export)
  - "Export" — secondary style (downloads JSON)
  - "+ New concept" — accent style (mint/teal), opens or focuses the SearchBar

Note: the preview shows "Save map" and "Export" as separate actions. In v1, both
can trigger the same `exportGraph` download. "Save map" is the friendlier label.

---

## Strict don'ts

- **No dark mode** — the palette only works on `#F7F4F0`
- **No gradients on nodes** — clean white circles only
- **No shadows heavier than** `0 2px 12px rgba(73,101,128,0.10)` anywhere in the UI
- **No hard borders** — all borders use low opacity (`rgba(...)`)
- **No font sizes below 8px**
- **No pure white backgrounds** — `#FFFFFF` is for elevated surfaces only; page bg is always `#F7F4F0`
- **No more than three accent colours simultaneously** on nodes at the same ring depth
- **No bounce/spring on panels or toolbars** — spring easing is for nodes only
- **No error states shown as red modals** — errors are toasts or inline muted text
- **No ring badge pill in the detail panel** — use the `NEWLY SELECTED` header pattern shown in the preview image
