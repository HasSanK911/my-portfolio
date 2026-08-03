import type { Metadata } from "next";

import { hasSession, isConfigured, isSelfExcluded } from "@/lib/analytics/auth";
import { readDashboard } from "@/lib/analytics/record";

import { Dashboard } from "./dashboard";
import { LoginForm } from "./login-form";

/**
 * The private analytics page.
 *
 * Unlisted rather than secret: it is excluded from the sitemap and marked
 * noindex, but the password is what actually protects it. If VIEWS_PASSWORD is
 * unset the page refuses everyone rather than falling open.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Views",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export default async function ViewsPage() {
  if (!isConfigured()) {
    return (
      <Shell>
        <div className="glass w-full max-w-sm rounded-2xl p-8 text-center">
          <h1 className="text-xl font-medium text-fg">Not configured</h1>
          <p className="mt-3 text-sm text-fg-subtle">
            Set <code className="font-mono text-fg-muted">VIEWS_PASSWORD</code> in the
            deployment environment to enable this page.
          </p>
        </div>
      </Shell>
    );
  }

  if (!(await hasSession())) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    );
  }

  const [data, excluded] = await Promise.all([readDashboard(), isSelfExcluded()]);

  return <Dashboard initialData={data} initiallyExcluded={excluded} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell relative z-10 flex min-h-svh items-center justify-center pb-24 pt-36">
      {children}
    </div>
  );
}
