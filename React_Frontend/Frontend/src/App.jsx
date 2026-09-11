import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import TaskDetails from "./pages/TaskDetails";
import TaskForm from "./pages/TaskForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Route map
//   /                -> task list (protected)
//   /tasks/new       -> create form (protected)
//   /tasks/:id       -> task details (protected)
//   /tasks/:id/edit  -> edit form (protected)
//   /login, /register-> public auth pages
//   *                -> 404
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="tasks" element={<Navigate to="/" replace />} />
            <Route path="tasks/new" element={<TaskForm />} />
            <Route path="tasks/:id" element={<TaskDetails />} />
            <Route path="tasks/:id/edit" element={<TaskForm />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
