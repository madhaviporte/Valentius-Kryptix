const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

// Status values allowed by the WA-2 Task model (must match its enum)
export const TASK_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export function statusLabel(value) {
  const match = TASK_STATUSES.find((status) => status.value === value);
  return match ? match.label : value;
}

// Error type that carries the HTTP status so the UI can react to 401/404/etc.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------- Token helpers (localStorage) ----------

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---------- Core request helper ----------

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only rejects on network failures (server down, CORS, DNS, ...)
    throw new ApiError(
      "Unable to reach the server. Please make sure the WA-2 backend is running on port 3000.",
      0
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      if (data && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // Response body was not JSON - keep the fallback message
    }

    throw new ApiError(message, response.status);
  }

  // 204 No Content or any empty body
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("The server returned an unexpected (non-JSON) response.", response.status);
  }
}

// ---------- Auth endpoints (public, no token required) ----------

export function registerUser({ name, email, password }) {
  return request("/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, password },
  });
}

export function loginUser({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

// ---------- Task endpoints (all require a Bearer token) ----------

// GET /api/tasks -> { count, tasks }
export function getTasks() {
  return request("/tasks");
}

// GET /api/tasks/:id -> { task }
export function getTask(id) {
  return request(`/tasks/${id}`);
}

// POST /api/tasks -> { message, task }
export function createTask({ title, description, status }) {
  return request("/tasks", {
    method: "POST",
    body: { title, description, status },
  });
}

// PUT /api/tasks/:id -> { message, task }
export function updateTask(id, { title, description, status }) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: { title, description, status },
  });
}

// DELETE /api/tasks/:id -> { message }
export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}