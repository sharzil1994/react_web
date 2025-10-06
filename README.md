# Hello World Site (React + Vite)

A clean, professional starter you can grow into. Includes:
- React 18 + Vite
- React Router (Home / About / Services / Contact / 404)
- Reusable components (Navbar, Footer, Tabs, ThemeToggle)
- Light/Dark theme via CSS variables
- Simple, modern styling (no Tailwind required)

## Run
```bash
npm install
npm run dev
# open http://localhost:5173
```

## Add a new tab (page)
1. Create `src/pages/YourPage.jsx`
2. Add a `<Route path="/your-page" element={<YourPage/>} />` in `src/App.jsx`
3. Add a `<NavLink>` in `src/components/Navbar.jsx`

## Deploy
```bash
npm run build
# then serve the dist/ folder with any static host
```
