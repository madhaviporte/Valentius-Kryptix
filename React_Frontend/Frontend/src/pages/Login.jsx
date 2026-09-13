import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogIn,
  Zap,
  ListChecks,
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import AuthLayout from "../components/AuthLayout";
import Brand from "../components/Brand";

// Shared validation for both auth forms — logic unchanged.
function validateCredentials({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address (e.g. user@example.com)";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where the user was heading before being redirected to /login
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  // Show/hide password (UI only — the submitted value is unchanged)
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateCredentials(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="TaskFlow"
      headline={
        <>
          Organize your work.
          <br />
          Get things done.
        </>
      }
      lede="TaskFlow keeps your tasks, priorities and progress in one clean workspace."
      features={[
        {
          icon: <ListChecks size={17} />,
          title: "Stay organized",
          text: "Capture every task in one place",
        },
        {
          icon: <TrendingUp size={17} />,
          title: "Track your progress",
          text: "See what's done and what's next",
        },
        {
          icon: <Zap size={17} />,
          title: "Get more done",
          text: "Focus on the work that matters",
        },
      ]}
    >
      <div className="auth-card">
        <Brand to="/login" />
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue managing your tasks.</p>

        {serverError && <ErrorMessage message={serverError} />}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">
                <Mail size={16} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p className="field-error" id="email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap has-toggle">
              <span className="input-icon" aria-hidden="true">
                <Lock size={16} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="input"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="input-trailing"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="field-error" id="password-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              <LogIn size={16} aria-hidden="true" />
              {submitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
