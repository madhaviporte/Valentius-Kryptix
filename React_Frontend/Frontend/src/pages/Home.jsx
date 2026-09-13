import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ListChecks, CheckCircle2, Clock, Timer, ClipboardList } from "lucide-react";
import { getTasks, deleteTask, TASK_STATUSES } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import TaskRow from "../components/TaskCard";

// Home page: lists every task belonging to the logged-in user (GET /api/tasks).
// Dashboard statistics are derived from the fetched task data — nothing hardcoded.
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

  // Statistics calculated live from the fetched tasks (WA-2 has no due dates,
  // so the fourth card tracks "in progress" instead of "overdue").
  const stats = useMemo(() => {
    const byStatus = { pending: 0, "in-progress": 0, completed: 0 };
    tasks.forEach((task) => {
      if (task.status in byStatus) byStatus[task.status] += 1;
    });
    return { total: tasks.length, ...byStatus };
  }, [tasks]);

  const statCards = [
    { label: "Total", value: stats.total, icon: <ListChecks size={19} />, tone: "indigo" },
    { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={19} />, tone: "green" },
    { label: "Pending", value: stats.pending, icon: <Clock size={19} />, tone: "amber" },
    { label: "In Progress", value: stats["in-progress"], icon: <Timer size={19} />, tone: "slate" },
  ];

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-sub">
            Manage your work and stay productive
            {user?.name ? `, ${user.name}` : ""}.
          </p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">
          <Plus size={17} aria-hidden="true" />
          New Task
        </Link>
      </div>

      {/* Statistics — derived from real API data */}
      {!loading && !error && (
        <div className="stats-grid">
          {statCards.map((card) => (
            <div className="stat-card" key={card.label}>
              <span className={`stat-icon stat-icon-${card.tone}`} aria-hidden="true">
                {card.icon}
              </span>
              <div>
                <p className="stat-label">{card.label}</p>
                <p className="stat-number">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <Loading label="Loading your tasks..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <ClipboardList size={30} />
          </span>
          <p className="empty-title">No tasks yet</p>
          <p>Create your first task and start getting things done.</p>
          <Link to="/tasks/new" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" />
            Create your first task
          </Link>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">
              Task List
              <span className="panel-count">
                {count} task{count === 1 ? "" : "s"}
              </span>
            </h2>
            <div className="chips" role="group" aria-label="Filter tasks by status">
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
          </div>

          {visibleTasks.length === 0 ? (
            <div className="empty-state" style={{ border: "none" }}>
              <p className="empty-title">No tasks with this status</p>
              <p>Try a different filter.</p>
            </div>
          ) : (
            <>
              <div className="task-list-head" aria-hidden="true">
                <span>Task</span>
                <span>Description</span>
                <span>Status</span>
                <span>Created</span>
                <span className="th-actions">Actions</span>
              </div>
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onDelete={handleDelete}
                    deleting={deletingId === task._id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
