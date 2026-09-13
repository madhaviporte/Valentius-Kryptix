# TaskFlow — Frontend (WA-3)

A modern, fully responsive task-management UI built with React. It connects to the **WA-2 Task REST API** (Node.js / Express / MongoDB) and provides user authentication plus full task CRUD.

This is the WA-3 deliverable of the project. The backend lives in the sibling `Task-APIs` folder and is documented in its own `README.md`. **No backend code was modified by this frontend.**

## Features

- **Authentication** — Register and Login pages with JWT-based auth (token + user persisted in `localStorage`)
- **My Tasks dashboard** — dynamic statistics (Total / Completed / In Progress / Pending) computed from the fetched task data
- **Task management** — create, view, edit, and delete tasks; status shown as colored pills (green / indigo / amber)
- **Polished states** — dedicated loading ("Loading your tasks…"), empty ("No tasks yet"), and error ("Something went wrong" + Retry) presentations
- **Split-screen auth layout** — deep-indigo branding panel with illustration and feature highlights beside a centered auth card
- **Responsive navbar** — brand left, actions right on desktop; hamburger dropdown menu below 768px
- **Adaptive task list** — column-headered table on desktop that transforms into vertical cards on mobile
- **No horizontal overflow** — fluid grids, `clamp()` typography, and a unified breakpoint system (1024 / 768 / 480 / 360)

## Tech Stack

- React 19
- Vite 8
- React Router 7
- lucide-react (icons)
- Plain CSS with custom design-system variables (no UI framework)

## Getting Started

### Prerequisites

- Node.js 18+
- The WA-2 backend running (default: `http://localhost:3000`) — see the backend README for setup

### Install Dependencies

```bash
npm install
```

### Environment Variables (optional)

Create a `.env` file in this folder to point the app at the backend:

```env
VITE_API_URL=http://localhost:3000/api
```

If omitted, the app falls back to `http://localhost:3000/api`.

### Run in Development

```bash
npm run dev
```

The app will run on: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Connection to the WA-2 Backend

The frontend talks to these endpoints (all task routes require a Bearer token):

| Method | Endpoint            | Used for                 |
| ------ | ------------------- | ------------------------ |
| POST   | `/api/auth/register`| Create an account        |
| POST   | `/api/auth/login`   | Log in, receive JWT      |
| GET    | `/api/tasks`        | List the user's tasks    |
| POST   | `/api/tasks`        | Create a task            |
| GET    | `/api/tasks/:id`    | Task details             |
| PUT    | `/api/tasks/:id`    | Update a task            |
| DELETE | `/api/tasks/:id`    | Delete a task            |

Auth data is stored under these `localStorage` keys:

- `taskflow_token` — the JWT sent as `Authorization: Bearer <token>`
- `taskflow_user` — the logged-in user's id, name, and email

If the backend is unreachable, the UI shows a clear error message instead of failing silently.

## App Routes

| Route            | Page              | Access    |
| ---------------- | ----------------- | --------- |
| `/`              | My Tasks (dashboard) | Protected |
| `/tasks/new`     | New task form     | Protected |
| `/tasks/:id`     | Task details      | Protected |
| `/tasks/:id/edit`| Edit task form    | Protected |
| `/login`         | Login             | Public    |
| `/register`      | Register          | Public    |
| `*`              | 404 Not Found     | Public    |

Unauthenticated visitors to protected routes are redirected to `/login`.

## Project Structure

```
Frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Route map
    ├── index.css             # Design system (variables, breakpoints, components)
    ├── context/
    │   └── AuthContext.jsx   # Auth state (login, register, logout)
    ├── services/
    │   └── api.js            # Fetch wrapper + all API calls (do not change lightly)
    ├── components/
    │   ├── Layout.jsx        # Navbar (desktop + hamburger) and page shell
    │   ├── ProtectedRoute.jsx
    │   ├── AuthLayout.jsx    # Split auth shell
    │   ├── AuthIllustration.jsx
    │   ├── Brand.jsx         # TaskFlow logo
    │   ├── TaskCard.jsx      # Task row / mobile card
    │   ├── Loading.jsx
    │   └── ErrorMessage.jsx
    └── pages/
        ├── Home.jsx          # Dashboard, stats, task list, empty state
        ├── Login.jsx
        ├── Register.jsx
        ├── TaskForm.jsx      # Create + edit
        ├── TaskDetails.jsx
        └── NotFound.jsx
```

## Design System

| Token          | Value     | Usage                    |
| -------------- | --------- | ------------------------ |
| Primary        | `#5B4CE2` | Buttons, active nav, brand |
| Primary hover  | `#4C3FD0` | Button hover             |
| Background     | `#F7F8FC` | App background           |
| Surface        | `#FFFFFF` | Cards, navbar            |
| Text           | `#111827` | Headings, primary text   |
| Secondary text | `#667085` | Muted text               |
| Border         | `#E5E7EB` | Card and input borders   |
| Success        | `#16A34A` | Completed status         |
| Warning        | `#D97706` | Pending status           |
| Danger         | `#DC2626` | Destructive actions      |

### Responsive Breakpoints

| Range         | Behavior                                                        |
| ------------- | --------------------------------------------------------------- |
| > 1024px      | Full desktop layout (side-by-side auth, table with headers, 4-column stats) |
| 768–1024px    | Tablet: condensed grids, auth switches to single column at ≤ 768px |
| < 768px       | Mobile: hamburger menu, task cards, 2×2 stats, compact auth card |
| < 480px / 360px | Small phones: reduced padding and type scale, everything fits 320px+ |

## Author

Madhavi Porte
