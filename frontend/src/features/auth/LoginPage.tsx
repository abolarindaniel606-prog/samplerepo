import type { FormEvent } from "react";
import { useState } from "react";

import { IconBrand } from "../../components/Icons";
import { ApiError } from "../../lib/api";
import type { User } from "../../lib/permissions";
import { authApi } from "./api";

interface LoginPageProps {
  onSignedIn: (user: User) => void;
  onBack: () => void;
}

export function LoginPage({ onSignedIn, onBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      onSignedIn(await authApi.login(email, password));
    } catch (caught) {
      // The server deliberately gives the same message for an unknown email as
      // for a wrong password, so this screen must not guess at a better one.
      setError(
        caught instanceof ApiError ? caught.message : "Could not sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <button type="button" className="login-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 12H5m6 6-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </button>
        <div className="login-brand">
          <div className="brand-mark">
            <IconBrand />
          </div>
          <div>
            <div className="brand-name">Lindero</div>
            <div className="brand-sub">Land Management</div>
          </div>
        </div>

        <h1 className="login-title">Sign in</h1>

        <div className="form-field full-width">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary login-submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>
    </div>
  );
}
