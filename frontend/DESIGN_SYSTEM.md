# Yasun Studio — Design System

The rules every screen follows. Tokens live in `src/app/globals.css`; components in `src/components/shared` and `src/components/ui` (shadcn/Radix).
**Do not** use arbitrary values (`text-[13px]`, `p-[18px]`, `rounded-[6px]`). If something is missing from the scale, add a token here first.

## 1. Colour — semantic tokens, light & dark

| Token | Use | Light | Dark |
|---|---|---|---|
| `background` / `foreground` | Page surface / body text | white / navy-900 | navy-950 / #e8eefb |
| `card`, `muted`, `border`, `input` | Surfaces, quiet areas, dividers | — | — |
| `muted-foreground` | Secondary text (≥ 5.6:1) | #55627d | #93a3c4 |
| `primary` | Main action | navy-800 | cyan |
| `brand` | **Text & links** in brand colour (WCAG AA) | #0273ad (5.2:1) | #19b5f5 (8.1:1) |
| `cyan-brand` | **Fills only**: progress, accents, buttons on navy | #19b5f5 | #19b5f5 |
| `yellow-brand` | "Titik awal" accent: badges, highlights. Sparingly. | #ffc21a | #ffc21a |
| `success` | Completed / positive states | #047857 | #34d399 |
| `destructive` | Delete / errors | — | — |

Rules:
- Never use bright cyan (`cyan-brand`) as text on a light surface (2.3:1 fails WCAG). Use `text-brand`.
- `bg-brand-canvas` (navy with cyan glow) is always dark, in both themes; text on it is `text-white` / `text-white/70+`.
- Every colour must come from a token so dark mode works automatically. Hard-coded palette colours (`emerald-500`, `gray-*`, `#hex`) are not allowed in app code.

## 2. Typography — one scale

Font: **Plus Jakarta Sans** (UI) · JetBrains Mono (code, slugs, tags).

| Class | Size (mobile → desktop) | Weight | Use |
|---|---|---|---|
| `text-display` | 36 → 48 → 60 | 800 | Home hero only |
| `text-title-1` | 30 → 36 → 48 | 800 | Public page h1 (heroes, article title) |
| `text-title-2` | 24 → 30 → 36 | 800 | Public section h2 |
| `text-title-3` | 24 | 700 | App page title (`PageHeader`), banners |
| `text-heading` | 18 | 600 | Card / block titles, list item titles |
| `text-metric` | 30, tabular | 800 | KPI numbers, prices, percentages |
| `text-lead` | 16 → 18 | 400 | Intro paragraph under a title |
| `text-eyebrow` | 14 | 600 | Label above a title (`text-brand`, or `text-cyan-brand` on canvas) |
| `text-base` | 16 | 400 | Long-form body, inputs |
| `text-sm` | 14 | 400–600 | Default UI text, buttons, table cells |
| `text-xs` | 12 | 400–600 | Meta, captions, badges. **Minimum size anywhere.** |

`CardTitle` (16/600) is the title inside a `Card`. Letter-spacing is owned by the classes above; don't add `tracking-*`.

## 3. Spacing — 4 px grid

| Step | px | Use |
|---|---|---|
| `1` | 4 | Tight stacks (footer link lists) |
| `2` | 8 | Icon ↔ label, chip rows, label ↔ input |
| `3` | 12 | Compact lists, avatar ↔ text |
| `4` | 16 | Related groups, stat-card grids, toolbar items |
| `6` | 24 | **Default**: between cards, form fields, card padding, page sections in the app |
| `8` | 32 | Columns in two-column layouts, large separations |
| `12` | 48 | Marketing columns |

Layout utilities (use instead of hand-written padding):
- `container-page`: centred max-w 1280 with gutters 16 / 24 / 32 px (mobile / sm / lg). Every public section.
- `hero-y` (56 → 80), `section-y` (64 → 96), `content-y` (48 → 64): vertical rhythm for public pages.
- App shell `main`: `p-4 sm:p-6 lg:p-8`, page stack `grid gap-6`.

## 4. Shape & elevation

| Radius | Use |
|---|---|
| `rounded-sm` | Brand squares (yellow mark) |
| `rounded-md` | Controls: buttons, inputs, badges |
| `rounded-lg` | Small inner tiles |
| `rounded-xl` | Cards, panels, banners, media |
| `rounded-full` | Avatars, pills/chips, progress bars |

Elevation: `shadow-sm` on cards (via `Card`), `shadow-md` on hover for clickable cards. No other shadows in app UI.

## 5. Components to reuse

`PageHeader` (title, description, eyebrow, back link, actions) · `StatCard` · `Card` · `FilterChips` · `EmptyState` · `Pagination` · `SearchInput` · `DeleteButton` · `Field` / `SubmitButton` / `FormAlert` · `ProgressBar` · `AccountMenu` (`compact` | `full`).

### Forms
Always use `ActionForm` (not `<form action>`) with `useActionState`: React 19 resets a form after every
action — including failed validation — which would wipe what the user typed. `FormAlert` receives
`errors={state.fieldErrors}` and lists every field that needs attention.

### Learning content (Markdown)
- Code fences are highlighted by Shiki (light/dark) on the `code` surface token, with a language label and copy button.
- Callouts: `> [!NOTE]` (brand), `> [!TIP]` (success), `> [!IMPORTANT]` (primary), `> [!WARNING]` (yellow), `> [!CAUTION]` (destructive).
- Scrollable regions (code blocks, outputs) are keyboard-focusable (`tabIndex=0`).
- The code editor (CodeMirror) is themed with the same tokens (`Prec.highest` overrides the bundled themes).

## 6. Responsive

Breakpoints: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. Design mobile-first; verify at **390**, **820** and **1440** px.
- No horizontal page scroll. Wide tables scroll inside their card.
- App sidebar becomes a drawer below `md`; it collapses to icons on desktop.
- Header actions wrap (`flex-wrap`) instead of overflowing.

## 7. Accessibility (WCAG 2.2 AA)

- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24 px text). Checked with axe-core in both themes.
- Interactive targets ≥ 24 × 24 px (standalone links get `py-1`; switches are 44 × 24).
- Links inside running text are underlined, not identified by colour alone.
- Every `ProgressBar` has an accessible name (`label` prop).
