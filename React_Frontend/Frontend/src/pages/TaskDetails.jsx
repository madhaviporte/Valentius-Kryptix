import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTask, deleteTask } from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { StatusBadge } from "../components/TaskCard";

// Detail page for one task (GET /api/tasks/:id).
export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pure fetch+apply helper so the effect body has no synchronous setState.
  const fetchTask = useCallback(
    () =>
      getTask(id)
        .then((data) => {
          setTask(data?.task ?? null);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
        }),
    [id]
  );

  // Initial load: `loading` starts as true, so just fetch and settle.
  useEffect(() => {
    fetchTask().finally(() => setLoading(false));
  }, [fetchTask]);

  // Retry is a user event, so synchronous state updates are fine here.
  function handleRetry() {
    setLoading(true);
    setError(null);
    fetchTask().finally(() => setLoading(false));
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteTask(id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <Loading label="Loading task..." />;
  }

  if (error && !task) {
    return (
      <div>
        <ErrorMessage message={error} onRetry={handleRetry} />
        <Link to="/" className="btn btn-secondary">
          Back to my tasks
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="empty-state">
        <p className="empty-title">Task not found</p>
        <p>This task may have been deleted or belongs to another account.</p>
        <Link to="/" className="btn btn-primary">
          Back to my tasks
        </Link>
      </div>
    );
  }

  return (
    <section className="detail-page">
      <Link to="/" className="back-link">
        ← Back to my tasks
      </Link>

      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      <article className="detail-card">
        <div className="detail-head">
          <h1>{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>

        <p className="detail-description">
          {task.description ? task.description : <em>No description provided.</em>}
        </p>

        <dl className="detail-meta">
          <div>
            <dt>Created</dt>
            <dd>{task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "—"}</dd>
          </div>
          <div>
            <dt>Task ID</dt>
            <dd className="mono">{task._id}</dd>
          </div>
        </dl>

        <div className="detail-actions">
          <Link to={`/tasks/${task._id}/edit`} className="btn btn-primary">
            Edit task
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete task"}
          </button>
        </div>
      </article>
    </section>
  );
}
