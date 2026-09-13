import { Link } from "react-router-dom";
import { Pencil, Trash2, ChevronRight, LoaderCircle } from "lucide-react";
import { statusLabel } from "../services/api";

// Small colored pill for a task status value.
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabel(status)}</span>;
}

// One task row in the dashboard list (Title / Description / Status / Created /
// Actions). Same data and handlers as before — only the presentation changed.
// On mobile the grid collapses into a vertical card; the action icons gain
// text labels so targets stay easy to hit on touch screens.
export default function TaskRow({ task, onDelete, deleting }) {
  return (
    <article className="task-row">
      <div className="cell-title">
        <h3 className="task-name">
          <Link to={`/tasks/${task._id}`}>{task.title}</Link>
          <ChevronRight size={15} color="var(--muted)" aria-hidden="true" />
        </h3>
      </div>

      <div className="cell-desc">
        <p className="task-desc">
          {task.description ? task.description : <em>No description provided.</em>}
        </p>
      </div>

      <div className="cell-status">
        <StatusBadge status={task.status} />
      </div>

      <div className="cell-created">
        <span className="task-date">
          {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "—"}
        </span>
      </div>

      <div className="cell-actions">
        <div className="task-actions">
          <Link
            className="icon-btn"
            to={`/tasks/${task._id}/edit`}
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            <Pencil size={16} aria-hidden="true" />
            <span className="icon-btn-label">Edit</span>
          </Link>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            onClick={() => onDelete(task._id)}
            disabled={deleting}
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            {deleting ? (
              <LoaderCircle size={16} className="spin" aria-hidden="true" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
            <span className="icon-btn-label">Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
