"use client";

import { Lock } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login, type LoginState } from "./actions";

const INITIAL: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-base font-medium text-white transition-colors duration-[260ms] hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Checking…" : "Unlock"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="glass w-full max-w-sm rounded-2xl p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong">
          <Lock className="h-4 w-4 text-accent" aria-hidden />
        </span>
        <h1 className="text-xl font-medium text-fg">Private</h1>
        <p className="text-sm text-fg-subtle">Enter the password to view visitor analytics.</p>
      </div>

      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        aria-describedby={state.error ? "password-error" : undefined}
        className="mb-4 h-12 w-full rounded-full border border-line-strong bg-surface px-5 text-base text-fg outline-none transition-colors duration-[260ms] placeholder:text-fg-subtle focus:border-brand"
        placeholder="Password"
      />

      <SubmitButton />

      {state.error ? (
        <p id="password-error" role="alert" className="mt-4 text-center text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
