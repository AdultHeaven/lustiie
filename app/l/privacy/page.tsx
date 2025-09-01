// app/l/privacy/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy • Lustiie",
  description:
    "How Lustiie collects, uses, and protects your data. Learn about cookies, logs, notifications, and your privacy controls.",
};

export default function PrivacyPage() {
  const updated = "Aug 29, 2025";

  const sections = [
    { id: "scope", label: "1. What this policy covers" },
    { id: "wecollect", label: "2. Information we collect" },
    { id: "nocollect", label: "3. What we don’t collect" },
    { id: "use", label: "4. How we use information" },
    { id: "legal", label: "5. Legal bases (EEA/UK users)" },
    { id: "share", label: "6. When we share information" },
    { id: "retention", label: "7. Retention" },
    { id: "controls", label: "8. Your choices & controls" },
    { id: "cookies", label: "9. Cookies & local storage" },
    { id: "security", label: "10. Security" },
    { id: "transfers", label: "11. International transfers" },
    { id: "children", label: "12. Children" },
    { id: "changes", label: "13. Changes to this policy" },
    { id: "contact", label: "14. Contact us" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-100">
      {/* Header */}
      <header className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)]">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Last updated: {updated}. This page explains how Lustiie handles your
          information and the controls you have.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/l/tos"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:bg-neutral-800"
          >
            Read our Terms of Service
          </Link>
          <Link
            href="/l/rules"
            className="rounded-lg border border-neutral-800 px-3 py-1.5 hover:bg-neutral-800"
          >
            Forum Rules
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        {/* TOC */}
        <aside className="md:sticky md:top-6 h-max">
          <nav className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Contents
            </div>
            <ul className="space-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded px-2 py-1 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <article className="space-y-8">
          <Section id="scope" title="1. What this policy covers">
            Lustiie (“we”, “us”) is a text-only forum for discussing models and
            threads—no images, no embeds. This policy applies to our website,
            notifications, and related services (the “Service”). It explains what
            we collect, why, how we use/share it, and what you can control.
          </Section>

          <Section id="wecollect" title="2. Information we collect">
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>
                <b>Account & profile.</b> Email, password hash, and optional
                username/role. Profile visibility preferences you set (e.g.
                “show/hide activity”).
              </li>
              <li>
                <b>Forum content.</b> Threads, posts, votes, reports, tags you
                create or interact with, and follows/subscriptions to threads.
              </li>
              <li>
                <b>Service logs.</b> Basic metadata such as request time,
                IP-derived region (for abuse prevention), and user agent.
              </li>
              <li>
                <b>Device storage.</b> We store small flags (e.g. a
                <code className="mx-1 rounded bg-neutral-900 px-1">viewed-thread-{`{id}`}</code>
                marker) in local/session storage to avoid double-counting views
                and to remember UI preferences.
              </li>
              <li>
                <b>Notifications.</b> If you enable email or in-app notifications
                (e.g. replies to your post or followed threads), we store the
                preferences and delivery history.
              </li>
              <li>
                <b>Support.</b> Messages you send to us (e.g. moderation or
                legal requests).
              </li>
            </ul>
          </Section>

          <Section id="nocollect" title="3. What we don’t collect">
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>No payment details (we don’t sell anything).</li>
              <li>No images or videos (Lustiie is text-only).</li>
              <li>No precise geolocation.</li>
              <li>No third-party ad tracking pixels.</li>
            </ul>
          </Section>

          <Section id="use" title="4. How we use information">
            We use your information to:
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>Operate and improve the forum (posting, voting, search).</li>
              <li>Provide features you choose (follows, notifications, settings).</li>
              <li>Moderate content and enforce the <AL href="/l/rules">Forum Rules</AL>.</li>
              <li>Prevent abuse, fraud, and security incidents.</li>
              <li>Understand overall usage (aggregate analytics without personal profiling).</li>
              <li>Comply with legal obligations and respond to lawful requests.</li>
            </ul>
          </Section>

          <Section id="legal" title="5. Legal bases (EEA/UK users)">
            Depending on the activity, our legal bases include:
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li><b>Contract</b> — to provide the Service you requested.</li>
              <li><b>Legitimate interests</b> — to keep the Service secure, prevent abuse, and improve features (balanced against your rights).</li>
              <li><b>Consent</b> — where required (e.g., optional notifications).</li>
              <li><b>Legal obligation</b> — to comply with applicable law.</li>
            </ul>
          </Section>

          <Section id="share" title="6. When we share information">
            We do not sell your data. We may share:
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>
                <b>Service providers</b> that help operate the Service (e.g., hosting, email).
                They process data under contracts that require confidentiality and security.
              </li>
              <li>
                <b>Legal/ safety</b> — when required by law or to protect users, our platform,
                or the public.
              </li>
              <li>
                <b>Transfers</b> as part of a business transition (e.g., merger), with notice.
              </li>
            </ul>
          </Section>

          <Section id="retention" title="7. Retention">
            We keep information only as long as necessary for the purposes in this policy
            (e.g., operating the forum, security, or legal retention). You can delete your
            content or account; backups and logs may persist briefly for safety and audit.
          </Section>

          <Section id="controls" title="8. Your choices & controls">
            You can manage privacy in <AL href="/_/settings">Settings</AL> (when available):
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>
                <b>Profile visibility</b> — show/hide your profile and activity to other users.
              </li>
              <li>
                <b>Thread/Reply visibility</b> — hide “recent replies” from your public profile.
              </li>
              <li>
                <b>Notifications</b> — opt in/out of email or in-app alerts for follows, mentions, or replies.
              </li>
              <li>
                <b>Delete content / account</b> — remove posts or close your account. We’ll
                act promptly and confirm via email.
              </li>
              <li>
                <b>Data requests</b> (access, export, rectification, erasure) — email{" "}
                <a className="underline" href="mailto:privacy@lustiie.link">
                  privacy@lustiie.link
                </a>.
              </li>
            </ul>
          </Section>

          <Section id="cookies" title="9. Cookies & local storage">
            We keep tracking light. We mainly use:
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>
                <b>Essential cookies</b> (or secure storage) for sign-in sessions.
              </li>
              <li>
                <b>Local/session storage</b> for UX (e.g., a{" "}
                <code className="mx-1 rounded bg-neutral-900 px-1">viewed-thread-{`{id}`}</code>{" "}
                flag to avoid double-counting views, collapse states, sort preferences).
              </li>
              <li>
                <b>Basic analytics</b> in aggregate to understand feature usage (no ad pixels).
              </li>
            </ul>
            You can clear cookies/storage in your browser; some features may stop working until you sign in again.
          </Section>

          <Section id="security" title="10. Security">
            We use reasonable technical and organizational measures to protect your data
            (encryption in transit, role-based access, audit logging). No method is 100%
            secure; report issues to{" "}
            <a className="underline" href="mailto:security@lustiie.link">
              security@lustiie.link
            </a>.
          </Section>

          <Section id="transfers" title="11. International transfers">
            If data is processed outside your country, we rely on appropriate safeguards
            (e.g., contractual clauses) to protect it consistent with this policy.
          </Section>

          <Section id="children" title="12. Children">
            Lustiie is for adults. Do not use the Service if you are under the age of
            majority in your jurisdiction. We delete accounts we learn are ineligible.
          </Section>

          <Section id="changes" title="13. Changes to this policy">
            We may update this policy to reflect changes to the Service or law. If
            changes are material, we’ll provide reasonable notice (e.g., banner or email).
            Continued use means you accept the updated policy.
          </Section>

          <Section id="contact" title="14. Contact us">
            Questions or requests:
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-3 text-sm text-neutral-300">
                Privacy:{" "}
                <a className="underline" href="mailto:privacy@lustiie.link">
                  privacy@lustiie.link
                </a>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-3 text-sm text-neutral-300">
                Legal:{" "}
                <a className="underline" href="mailto:legal@lustiie.link">
                  legal@lustiie.link
                </a>
              </div>
            </div>
          </Section>

          <div className="pt-2">
            <a href="#" className="text-sm text-neutral-400 underline hover:text-neutral-200">
              Back to top
            </a>
          </div>
        </article>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6"
    >
      <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
      <div className="prose prose-invert prose-sm mt-2 max-w-none text-neutral-300">
        {children}
      </div>
    </section>
  );
}

function AL({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="underline decoration-fuchsia-500/60 underline-offset-2 hover:text-white"
    >
      {children}
    </Link>
  );
}
