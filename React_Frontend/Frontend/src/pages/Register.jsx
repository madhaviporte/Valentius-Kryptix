import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRoundPlus,
  ListPlus,
  TrendingUp,
  Zap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import AuthLayout from "../components/AuthLayout";
import Brand from "../components/Brand";

// Client-side checks that mirror the WA-2 register endpoint rules — unchanged.
function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Name is required";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address (e.g. user@example.com)";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  // Show/hide password (UI only — the submitted values are unchanged)
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      // WA-2 register does not return a token, so go log in
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: form.email.trim(),
          infoMessage: "Account created! Please log in.",
        },
      });
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
          Create your account.
          <br />
          Start organizing your work.
        </>
      }
      lede="Join TaskFlow and turn your plans into done — one task at a time."
      features={[
        {
          icon: <ListPlus size={17} />,
          title: "Create Tasks",
          text: "Add and organize your tasks",
        },
        {
          icon: <TrendingUp size={17} />,
          title: "Track Progress",
          text: "Stay on top of your goals",
        },
        {
          icon: <Zap size={17} />,
          title: "Get More Done",
          text: "Turn your plans into achievements",
        },
      ]}
    >
      <div className="auth-card">
        <Brand to="/login" />
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start organizing your work today.</p>

        {serverError && <ErrorMessage message={serverError} />}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">
                <User size={16} />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </div>
            {errors.name && (
              <p className="field-error" id="name-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email address</label>
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
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">
                <Lock size={16} />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
            </div>
            {errors.confirmPassword && (
              <p className="field-error" id="confirmPassword-error" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              <UserRoundPlus size={16} aria-hidden="true" />
              {submitting ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
