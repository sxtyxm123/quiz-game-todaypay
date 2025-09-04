# React Quiz App

A small React quiz application that demonstrates front-end fundamentals, state management, and a clean UX. Built with Vite + React.

Features
- Single-question view with 4 options
- Prevents progressing until an option is selected
- Score tracking and result summary
- Results page showing which answers were correct/incorrect and the selected vs correct answer
- Restart quiz
- Responsive design (mobile & desktop)
- React Router routes: `/quiz` and `/results`
- Optional per-question timer (30s)
- Persistent top score in localStorage

Running locally
1. Install dependencies
   npm install

2. Start dev server
   npm run dev

3. Open the URL printed by Vite (usually http://localhost:5173)

Switching to Open Trivia DB
- In `src/App.jsx`, set `USE_API = true` and adjust `API_URL` parameters.
- The code includes a base64 decode helper if you use `encode=base64`.

Notes
- Uses React functional components and hooks (useState, useEffect).
- Styling is plain CSS in `src/styles.css`. Replace or extend with Tailwind / Styled Components as desired.
- This app uses local JSON by default to avoid network issues and to simplify testing.

Enjoy! If you want, I can convert this to TypeScript, add Tailwind, or wire it to Open Trivia DB and handle more error cases.