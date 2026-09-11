import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTask, getTask, updateTask, TASK_STATUSES } from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const MAX_TITLE_LENGTH = 100; // matches the WA-2 backend limit

const EMPTY_FORM = { title: "", description: "", status: "pending" };

// Shared create/edit page.
// Create mode: /tasks/new  -> POST /api/tasks
// Edit mode:   /tasks/:id/edit -> GET then PUT /api/tasks/:id
export default function TaskForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // In edit mode, load the existing task and prefill the form.
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    async function loadTask() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getTask(id);
        if (!cancelled) {
          const task = data?.task;
          if (!task) {
            setLoadError("Task not found");
          } else {
            setForm({
              title: task.title ?? "",
              description: task.description ?? "",
              status: task.status ?? "pending",
            });
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTask();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    // Clear the field's error as soon as the user edits it again
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  // Client-side validation (mirrors the backend rules without replacing them)
  function validate(values) {
    const nextErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Title is required";
    } else if (values.title.trim().length > MAX_TITLE_LENGTH) {
      nextErrors.title = `Title must not exceed ${MAX_TITLE_LENGTH} characters`;
    }

    if (values.description.length > 500) {
      nextErrors.description = "Description must not exceed 500 characters";
    }

    if (!TASK_STATUSES.some((status) => status.value === values.status)) {
      nextErrors.status = "Please choose a valid status";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    try {
      const data = isEditMode ? await updateTask(id, payload) : await createTask(payload);
      const savedTask = data?.task;
      navigate(savedTask?._id ? `/tasks/${savedTask._id}` : "/");
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Loading label="Loading task..." />;
  }

  if (loadError) {
    return (
      <div>
        <ErrorMessage message={loadError} />
        <Link to="/" className="btn btn-secondary">
          Back to my tasks
        </Link>
      </div>
    );
  }

  return (
    <section className="form-page">
      <Link to={isEditMode ? `/tasks/${id}` : "/"} className="back-link">
        ← {isEditMode ? "Back to task" : "Back to my tasks"}
      </Link>

      <h1>{isEditMode ? "Edit task" : "Create a new task"}</h1>

      {serverError && <ErrorMessage message={serverError} />}

      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="title">
            Title <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Finish the React assignment"
            maxLength={MAX_TITLE_LENGTH + 10}
            aria-required="true"
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title ? (
            <p className="field-error" id="title-error" role="alert">
              {errors.title}
            </p>
          ) : (
            <p className="field-hint">{form.title.trim().length}/{MAX_TITLE_LENGTH} characters</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Optional details about this task"
            aria-invalid={errors.description ? "true" : "false"}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description ? (
            <p className="field-error" id="description-error" role="alert">
              {errors.description}
            </p>
          ) : (
            <p className="field-hint">Optional — {form.description.length}/500 characters</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            aria-invalid={errors.status ? "true" : "false"}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="field-error" role="alert">
              {errors.status}
            </p>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? "Saving..."
              : isEditMode
                ? "Save changes"
                : "Create task"}
          </button>
          <Link to={isEditMode ? `/tasks/${id}` : "/"} className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
