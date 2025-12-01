# To‑Do List — Remix + Ocean Professional

This single‑page app lets you add tasks, view them, toggle complete, and delete, with persistence via `localStorage` (key: `todo-items-v1`). No backend calls are made.

- Dev: `npm run dev` (served on port 3000 by default)
- Build: `npm run build`
- Start: `npm start`

Features:
- Keyboard support: press Enter in the input to add
- Filters: All, Active, Completed
- Remaining items counter
- Ocean Professional theme with subtle gradient and rounded corners
- Responsive layout

Styling:
- Tailwind utilities are available.
- A custom stylesheet `app/styles/theme.css` defines theme variables and utility classes, linked in `app/root.tsx`.
