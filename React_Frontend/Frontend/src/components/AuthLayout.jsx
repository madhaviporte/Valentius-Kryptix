import { Lightbulb } from "lucide-react";
import Brand from "./Brand";
import AuthIllustration from "./AuthIllustration";

// Shared two-column shell for the Login and Register pages.
// Left: deep-indigo branding panel with headline, illustration and feature
// highlights (hidden on mobile, where the card carries compact branding).
// Right: the actual form card (children).
export default function AuthLayout({
  eyebrow,
  headline,
  lede,
  features,
  note,
  children,
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside-brand">
          <Brand />
        </div>

        <div className="auth-aside-body">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h2 className="auth-headline">{headline}</h2>
          <p className="auth-lede">{lede}</p>

          <div className="auth-art" aria-hidden="true">
            <AuthIllustration />
          </div>

          <ul className="auth-features">
            {features.map((feature) => (
              <li className="feature" key={feature.title}>
                <span className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <div>
                  <p className="feature-title">{feature.title}</p>
                  <p className="feature-text">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>

          {note && (
            <div className="aside-note">
              <Lightbulb size={16} aria-hidden="true" />
              <span>
                <strong>{note.title}</strong>
                {note.text}
              </span>
            </div>
          )}
        </div>
      </aside>

      <main className="auth-main">{children}</main>
    </div>
  );
}
