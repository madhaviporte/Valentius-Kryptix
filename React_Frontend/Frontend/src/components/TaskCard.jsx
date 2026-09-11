import { Link } from "react-router-dom";
import { statusLabel } from "../services/api";

// Small colored pill for a task status value.
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabel(status)}</span>;
}

// Card shown on the list page for each task returned by GET /api/tasks.
export default function TaskCard({ task, onDelete, deleting }) {
  return (
    <article className="task-card">
      <div className="task-card-head">
        <h3 className="task-title">
          <Link to={`/tasks/${task._id}`}>{task.title}</Link>
        </h3>
        <StatusBadge status={task.status} />
      </div>

      <p className="task-description">
        {task.description ? task.description : <em>No description provided.</em>}
      </p>

      <div className="task-card-foot">
        <div className="task-actions">
          <Link className="btn btn-sm btn-ghost" to={`/tasks/${task._id}`}>
            View
          </Link>
          <Link className="btn btn-sm btn-secondary" to={`/tasks/${task._id}/edit`}>
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(task._id)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
