
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register" | "forgot" | "reset" | "partner";

interface AuthConfig {
  title: string;
  button: string;
  endpoint: string;
}

const CONFIG: Record<Mode, AuthConfig> = {
  login: {
    title: "Welcome back",
    button: "Sign in",
    endpoint: "/api/auth/login",
  },
  register: {
    title: "Create your account",
    button: "Create account",
    endpoint: "/api/auth/register",
  },
  forgot: {
    title: "Reset your password",
    button: "Send reset link",
    endpoint: "/api/auth/forgot-password",
  },
  reset: {
    title: "Choose a new password",
    button: "Update password",
    endpoint: "/api/auth/reset-password",
  },
  partner: {
    title: "Become a referral partner",
    button: "Join the programme",
    endpoint: "/api/partner/register",
  },
};

const dashboards: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  MANAGER: "/admin/dashboard",
  AGENT: "/agent/dashboard",
  CUSTOMER: "/customer/dashboard",
  REFERRAL_PARTNER: "/partner/dashboard",
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const cfg = CONFIG[mode];

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const withName = mode === "register" || mode === "partner";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setError("");
    setInfo("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const params = new URLSearchParams(window.location.search);

    const body: Record<string, unknown> = Object.fromEntries(fd);

    if (mode === "reset") {
      body.token = params.get("token") ?? "";
    }

    if (mode === "partner") {
      body.acceptTerms = fd.get("acceptTerms") === "on";

      if (!body.acceptTerms) {
        setError("You must accept the referral terms.");
        setBusy(false);
        return;
      }
    }

    try {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const details = data.details as
          | Record<string, string[]>
          | undefined;

        const firstError = details
          ? Object.values(details).flat()[0]
          : undefined;

        setError(
          firstError ||
            data.error ||
            data.message ||
            "Something went wrong. Please try again."
        );

        return;
      }

      if (
        mode === "login" ||
        mode === "register" ||
        mode === "partner"
      ) {
        const next = params.get("next");

        const safeNext =
          next && next.startsWith("/") && !next.startsWith("//")
            ? next
            : null;

        const destination =
          safeNext ||
          dashboards[data.user?.role] ||
          "/";

        router.push(destination);
        router.refresh();
      } else {
        setInfo(
          data.message || "Your request was successful."
        );

        if (mode === "reset") {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-brand">
        {cfg.title}
      </h1>

      {mode === "partner" && (
        <p className="mt-2 text-sm text-slate-600">
          Share your link. When someone you introduce buys or
          rents and the deal completes, you earn a reward.
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4"
      >
        {withName && (
          <input
            name="fullName"
            required
            placeholder="Full name"
            className="input"
          />
        )}

        {mode !== "reset" && (
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="input"
          />
        )}

        {withName && (
          <input
            name="phone"
            placeholder="Phone (optional)"
            className="input"
          />
        )}

        {mode !== "forgot" && (
          <input
            name="password"
            type="password"
            required
            minLength={mode === "login" ? 1 : 8}
            placeholder={
              mode === "reset"
                ? "New password"
                : "Password"
            }
            className="input"
          />
        )}

        {mode === "partner" && (
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="acceptTerms"
              required
              className="mt-1"
            />

            <span>
              I have read and accept the{" "}
              <Link
                href="/referral-terms"
                target="_blank"
                className="text-gold underline"
              >
                referral terms
              </Link>.
            </span>
          </label>
        )}

        <button
          type="submit"
          className="btn w-full"
          disabled={busy}
        >
          {busy ? "Please wait..." : cfg.button}
        </button>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {info && (
          <p className="text-sm text-green-700" role="status">
            {info}
          </p>
        )}
      </form>

      <div className="mt-6 space-y-1 text-sm text-slate-600">
        {mode === "login" && (
          <>
            <p>
              <Link
                href="/forgot-password"
                className="text-gold underline"
              >
                Forgot your password?
              </Link>
            </p>

            <p>
              No account?{" "}
              <Link
                href="/register"
                className="text-gold underline"
              >
                Register
              </Link>{" "}
              or{" "}
              <Link
                href="/become-a-partner"
                className="text-gold underline"
              >
                become a referral partner
              </Link>
            </p>
          </>
        )}

        {(mode === "register" || mode === "partner") && (
          <p>
            Already registered?{" "}
            <Link
              href="/login"
              className="text-gold underline"
            >
              Sign in
            </Link>
          </p>
        )}

        {(mode === "forgot" || mode === "reset") && (
          <p>
            <Link
              href="/login"
              className="text-gold underline"
            >
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
