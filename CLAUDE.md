# LeadRadar — CLAUDE.md

Working guide for all agents in this repository.
Read this before touching any file.

---

## Project Summary

LeadRadar is a SaaS prospecting dashboard for freelance web developers.
Stack: **Next.js 14 App Router · TypeScript (strict) · Tailwind CSS · next-themes · Gemini API**.
No external component libraries (no shadcn, MUI, Radix, etc.).

---

## Design Principles

### Visual Identity
- Reference image: FundFlow dashboard (glassmorphism, lavender-blue palette, violet gradient accent)
- Light mode is the default and primary mode; dark mode mirrors it with deep navy/violet backgrounds
- Violet gradient `#7C3AED → #A855F7` is the single brand accent — use it for CTAs, active states, highlights
- Everything feels spacious: generous padding, large border-radius (12–20px), soft shadows
- Typography: clean sans-serif (Inter), tight hierarchy (bold metric numbers, regular body)
- No harsh borders — use subtle `1px` borders or glassmorphism blur instead

### Component Philosophy
- Build from primitives up: `Badge → Button → Card → Section → Page`
- No inline styles — Tailwind classes only, supplemented by CSS variables in globals.css
- CSS variables power the color theme; Tailwind maps to those variables via `var(--token)`
- Every interactive element has a visible hover/focus state

### Glassmorphism Pattern
```css
/* Light card */
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.5);
box-shadow: 0 4px 24px rgba(124, 58, 237, 0.06);

/* Dark card */
background: rgba(26, 26, 46, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(45, 45, 78, 0.8);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
```

---

## Color Tokens (CSS Variables)

Defined in `src/app/globals.css`:

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#E8EDF8` | `#0F0F1A` |
| `--card` | `#FFFFFF` | `#1A1A2E` |
| `--text` | `#1E1B4B` | `#F1F0FF` |
| `--secondary` | `#6B7280` | `#9B99C4` |
| `--border` | `#E5E7EB` | `#2D2D4E` |
| `--accent-start` | `#7C3AED` | `#7C3AED` |
| `--accent-end` | `#A855F7` | `#A855F7` |

Never hardcode hex values in components — use CSS variables or Tailwind's `text-[var(--text)]` pattern.

---

## TypeScript Conventions

- Strict mode enabled: no `any`, no implicit `any`
- All component props typed with `interface`, not `type`
- Prefer named exports over default exports for components
- Data types live in `src/lib/types.ts`
- Server-only code (API routes) must not import client-only modules

### File naming
- Components: `PascalCase.tsx`
- Utilities/lib: `camelCase.ts`
- Route handlers: Next.js convention (`route.ts`)

### Import order
1. React / Next
2. Third-party
3. `@/lib/*`
4. `@/components/*`
5. Local relative

---

## Component Architecture

### File structure rules
- One component per file
- Keep files under 200 lines; extract sub-components if they grow
- No business logic in UI components — pass handlers as props
- Client components: add `'use client'` at top; prefer server by default

### Props pattern
```tsx
interface CardProps {
  title: string
  value: number
  className?: string
}

export function Card({ title, value, className }: CardProps) { ... }
```

---

## Theming & Dark/Light Mode

- Use `next-themes` with `attribute="class"` and `defaultTheme="light"`
- Tailwind `darkMode: 'class'` matches the `class="dark"` on `<html>`
- All color decisions go through CSS variables — never use `dark:` Tailwind variants for colors;
  use CSS variables so both modes are maintained in one place
- Exception: structural dark variants (`dark:bg-opacity-80`, etc.) are acceptable

---

## Animation Patterns

### Card entrance (stagger)
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
Apply with `animation: slideUp 0.4s ease both` and `animationDelay: index * 80ms` inline.

### Animated counter
Use `requestAnimationFrame` loop in `useEffect`. Ease with `easeOutQuart`.
Component: `src/components/ui/AnimatedCounter.tsx`.

### Chart bar grow
Apply CSS `transition: width 0.6s ease` with `transitionDelay: index * 80ms`.
Start bars at `width: 0` via initial state, then set to final value after mount.

### Hover lift (lead cards)
```css
transform: translateY(-4px);
box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15);
border-color: #7C3AED;
```
Use Tailwind `hover:` variants for transform/shadow.

### Loading pulse (buttons)
Use Tailwind `animate-pulse` on the button icon while fetching.

### Theme transition
```css
*, *::before, *::after {
  transition: background-color 0.3s ease, color 0.3s ease,
              border-color 0.3s ease, box-shadow 0.3s ease;
}
```

---

## Layout Rules

- `Sidebar`: 64px wide, fixed, icon-only
- `Main content`: flex-1, scrollable vertically
- `RightPanel`: 280px wide, fixed right, scrollable
- Total: `64px | flex-1 | 280px` three-column layout
- Mobile: sidebar collapses to bottom bar (future); right panel hidden

---

## API Design

- All Gemini calls go through the server-side route `/api/generate-prompt`
- Never call Gemini from the client — API key must stay server-side
- Route accepts `POST { lead: Lead, type: 'whatsapp' | 'web' }`
- Returns `{ result: string }` or `{ error: string }` with appropriate HTTP status

### Nuevas rutas y convenciones

- `POST /api/search-leads` busca negocios con Gemini + Google Search grounding
- `POST /api/verify-supabase` valida conexion y tablas principales
- `GET|PATCH /api/settings` lee y persiste configuracion global no sensible
- `GET /api/prompts` lista historial global de prompts
- `DELETE /api/prompts/[id]` elimina prompts del historial
- `PATCH|DELETE /api/leads/[id]/status` persiste o elimina estado de lead

## Configuración de la app (localStorage)

- La configuración editable del usuario vive en `leadradar_settings_v1`
- La configuración compartida no sensible vive en tabla `app_settings` (Supabase)
- Las API keys se mantienen solo en localStorage (no guardar secretos en Supabase)
- Leads manuales guardados desde `/buscar` viven en `leadradar_custom_leads_v1`
- Historial de búsquedas de `/buscar` vive en `leadradar_search_history_v1`
- Las variables de entorno siguen siendo fallback seguro del servidor

## Estados de error y fallback

- Si Supabase no está configurado o falla, la UI debe seguir funcionando sin errores bloqueantes
- Evitar `alert()` en flujos de usuario; usar toasts no intrusivos
- Todas las llamadas externas deben usar timeout de 10s

---

## What NOT to do

- No inline styles (exceptions: dynamic `animationDelay` values)
- No hardcoded API keys anywhere
- No external UI component libraries
- No `any` type
- No direct Gemini calls from client components
- No `console.log` left in production code
- Do not modify `leadradar.jsx` — it's a data reference only, not part of the app
