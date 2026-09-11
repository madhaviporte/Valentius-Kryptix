# TaskFlow — WA-3 React Frontend

A responsive task manager frontend for the WA-2 **Task REST API** (Node.js/Express/MongoDB with JWT authentication). Users register, log in, and manage their own tasks.

## Project Overview

TaskFlow consumes the real WA-2 backend — there is **no mock data** anywhere in the app. Every list, detail, create, update, and delete action goes through the live REST API, and the JWT token from `/api/auth/login` is attached to every task request automatically.

## Technologies Used

- **React 19** + **Vite 8**
- **React Router DOM 7** (`react-router-dom`) for client-side routing
- Plain **CSS** (responsive, no UI framework)
- React built-ins only: `useState`, `useEffect`, `useContext`, `useMemo` (no Redux/Zustand)

## Prerequisites

The **WA-2 backend must be running** before starting the frontend:

```bash
# In the WA-2 project folder
npm install
npm run dev      # or: npm start
```

The backend serves the API at `http://localhost:3000/api` (port from its `PORT` env var, default 3000). MongoDB must be reachable by the backend.

## Install & Run (Frontend)

```bash
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

## Backend URL Configuration

The API base URL is read from the `VITE_API_URL` environment variable in `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

- Copy `.env.example` to `.env` if the file does not exist.
- If you change the backend port, update `VITE_API_URL` to match (e.g. `http://localhost:4000/api`).
- WA-2 serves routes under the `/api` prefix (`/api/auth/...`, `/api/tasks/...`), so the `/api` suffix **must be included**.

## Available Frontend Routes

| Route | Page | Protection |
|---|---|---|
| `/` | Task list (home) with status filter | Protected |
| `/tasks/new` | Create task form | Protected |
| `/tasks/:id` | Task details | Protected |
| `/tasks/:id/edit` | Edit task form | Protected |
| `/login` | Login form | Public |
| `/register` | Registration form | Public |
| any other URL | 404 Not Found page | Public |

Protected pages redirect unauthenticated visitors to `/login` and return them to their original page after logging in.

## How the Frontend Communicates with WA-2

All requests go through one service module, `src/services/api.js`:

- Base URL from `VITE_API_URL`
- `Authorization: Bearer <token>` header attached automatically (token kept in `localStorage` from login)
- `Content-Type: application/json` on requests with bodies
- HTTP errors converted into readable messages taken from the backend's `{ message: "..." }` responses
- Network failures (backend not running) produce a friendly "backend is running" error, never a crash

Endpoints used:

| Method | Endpoint | Used by |
|---|---|---|
| POST | `/api/auth/register` | Register page |
| POST | `/api/auth/login` | Login page |
| GET | `/api/tasks` | Home page |
| GET | `/api/tasks/:id` | Details page, edit form |
| POST | `/api/tasks` | Create form |
| PUT | `/api/tasks/:id` | Edit form |
| DELETE | `/api/tasks/:id` | Home page + details page |

## Features

- **Loading states** — spinner whenever API data is in flight (list, detail, form prefill, session check)
- **Error states** — friendly message + **Try again** retry button when the backend is down or returns an error; the app never shows a blank screen
- **Empty states** — "No tasks yet" prompt when the user has no tasks
- **Forms & validation** — client-side validation before submit (required title, 100-char max matching the backend, optional description with 500-char guard, valid status, valid email format, password ≥ 6 chars, password confirmation) with inline messages and ARIA attributes
- **Authentication** — register → login flow, session persisted in `localStorage`, logout button, expired/invalid tokens handled gracefully
- **Responsive design** — works on desktop, tablet, and mobile (flex/grid layout, media queries)
- **Accessibility** — labeled inputs, `aria-invalid`/`aria-describedby` on errors, `role="alert"`, keyboard-friendly controls

## Production Build

```bash
npm run build     # outputs static files to dist/
npm run preview   # serves the production build locally
```

Deploy the `dist/` folder to any static host and set `VITE_API_URL` to the public backend URL at build time.

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # navbar + outlet + footer
│   │   ├── Loading.jsx          # spinner
│   │   ├── ErrorMessage.jsx     # error panel with retry
│   │   ├── ProtectedRoute.jsx   # auth route guard
│   │   └── TaskCard.jsx         # task card + status badge
│   ├── context/
│   │   └── AuthContext.jsx      # login/register/logout session state
│   ├── pages/
│   │   ├── Home.jsx             # task list (GET /api/tasks)
│   │   ├── TaskDetails.jsx      # task detail (GET/DELETE /api/tasks/:id)
│   │   ├── TaskForm.jsx         # create/edit (POST/PUT /api/tasks)
│   │   ├── Login.jsx            # POST /api/auth/login
│   │   ├── Register.jsx         # POST /api/auth/register
│   │   └── NotFound.jsx         # 404 page
│   ├── services/
│   │   └── api.js               # centralized fetch layer for WA-2
│   ├── App.jsx                  # routes
│   ├── main.jsx                 # entry point
│   └── index.css                # global responsive styles
├── .env                         # VITE_API_URL (not committed)
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Notes

- WA-2 requires a **Bearer token for every task endpoint** — without logging in, the API returns 401. That's why the frontend has login/register pages.
- WA-2 already has `cors()` enabled for all origins, so no backend change is needed for the frontend at `localhost:5173`.
