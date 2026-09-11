import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks, deleteTask, TASK_STATUSES } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import TaskCard from "../components/TaskCard";

// Home page: lists every task belonging to the logged-in user (GET /api/tasks).
export default function Home() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Pure fetch+apply helper (state updates happen in async callbacks) so it
  // works both for the initial-load effect and the retry button.
  const fetchTasks = useCallback(
    () =>
      getTasks()
        .then((data) => {
          setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
          setCount(
            typeof data?.count === "number" ? data.count : (data?.tasks?.length ?? 0)
          );
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
        }),
    []
  );

  // Initial load: `loading` starts as true, so just fetch and settle.
  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  // Retry is a user event, so synchronous state updates are fine here.
  function handleRetry() {
    setLoading(true);
    setError(null);
    fetchTasks().finally(() => setLoading(false));
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task._id !== id));
      setCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const visibleTasks =
    statusFilter === "all" ? tasks : tasks.filter((task) => task.status === statusFilter);

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">
            {user?.name ? `Welcome back, ${user.name}. ` : ""}
            {loading ? "Loading your tasks..." : `You have ${count} task${count === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">
          + New Task
        </Link>
      </div>

      {!loading && !error && tasks.length > 0 && (
        <div className="filter-row" role="group" aria-label="Filter tasks by status">
          <button
            type="button"
            className={statusFilter === "all" ? "chip chip-active" : "chip"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          {TASK_STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              className={statusFilter === status.value ? "chip chip-active" : "chip"}
              onClick={() => setStatusFilter(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}

      {loading && <Loading label="Loading tasks..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">No tasks yet</p>
          <p>Create your first task to get started.</p>
          <Link to="/tasks/new" className="btn btn-primary">
            Create a task
          </Link>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && visibleTasks.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">No tasks with this status</p>
          <p>Try a different filter.</p>
        </div>
      )}

      {!loading && !error && visibleTasks.length > 0 && (
        <div className="task-grid">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={handleDelete}
              deleting={deletingId === task._id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
