# TaskFlow — MERN Task Manager

A responsive task manager built with MongoDB, Express, React and Node.js.

## Features

- Create, view, edit and delete tasks
- Task title, description, priority, status and due date
- Search tasks by title/description
- Filter by status and priority
- Dashboard counts for total, pending, in progress and completed
- Form validation and clear loading/error/empty states
- Responsive layout

## Requirements

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

1. Install root tooling:
   ```bash
   npm install
   ```
2. Install backend dependencies:
   ```bash
   cd server && npm install
   ```
3. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`.
4. Start the API from the project root:
   ```bash
   npm run server
   ```
5. In another terminal, start the frontend:
   ```bash
   npm install --prefix client
   npm run client
   ```
6. Open http://localhost:5173

Alternatively, after installing all dependencies, run `npm run dev` at the root.

The API runs on http://localhost:5000. The Vite development server proxies `/api` to it.

## API

| Method | Endpoint         | Purpose                                             |
| ------ | ---------------- | --------------------------------------------------- |
| GET    | `/api/tasks`     | List tasks; supports `search`, `status`, `priority` |
| GET    | `/api/tasks/:id` | Get one task                                        |
| POST   | `/api/tasks`     | Create a task                                       |
| PUT    | `/api/tasks/:id` | Update a task                                       |
| DELETE | `/api/tasks/:id` | Delete a task                                       |
| GET    | `/api/health`    | Health check                                        |

## Project structure

```text
mern-task-manager/
  client/       React + Vite UI
  server/       Express API, Mongoose model and routes
  assessment/   Submission explanations and video script
```

## Notes

This assessment version intentionally keeps the app focused: it is a single-workspace task manager without login or team collaboration. For a real multi-user deployment, add authentication and enforce ownership checks on every task query.
