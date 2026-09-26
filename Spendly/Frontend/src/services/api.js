// Single place for all API calls. Components never call fetch directly.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Small helper so every request handles JSON + errors the same way
async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      // Backend always sends { success: false, message: "..." } on errors
      const message = body?.message || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return body;
  } catch (error) {
    // Network failure (server down, DNS, CORS) has no .message from the API
    if (error instanceof TypeError) {
      throw new Error("Cannot reach the server. Is the backend running?");
    }
    throw error;
  }
}

// ---------------- Users ----------------
export const getUsers = () => request("/api/users");
export const getUserById = (id) => request(`/api/users/${id}`);
export const createUser = (userData) =>
  request("/api/users", { method: "POST", body: JSON.stringify(userData) });

// ---------------- Categories ----------------
export const getCategories = () => request("/api/categories");
export const createCategory = (categoryData) =>
  request("/api/categories", { method: "POST", body: JSON.stringify(categoryData) });
export const updateCategory = (id, categoryData) =>
  request(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(categoryData) });
export const deleteCategory = (id) => request(`/api/categories/${id}`, { method: "DELETE" });

// ---------------- Expenses ----------------
// queryParams: { search, category, sort, order } - all optional
export function getExpenses(queryParams = {}) {
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const queryString = params.toString();
  return request(`/api/expenses${queryString ? `?${queryString}` : ""}`);
}

export const getExpenseById = (id) => request(`/api/expenses/${id}`);

export const createExpense = (expenseData) =>
  request("/api/expenses", { method: "POST", body: JSON.stringify(expenseData) });

export const updateExpense = (id, expenseData) =>
  request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(expenseData) });

export const deleteExpense = (id) => request(`/api/expenses/${id}`, { method: "DELETE" });
