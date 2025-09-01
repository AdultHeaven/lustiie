// app/_/tos/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Terms of Service • Lustiie",
  description:
    "Read the Terms of Service for Lustiie — a text-only discussion forum for models and threads.",
};

export default function TermsPage() {
  const updated = "Aug 29, 2025"; // <-- keep current

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "eligibility", label: "2. Eligibility" },
    { id: "accounts", label: "3. Accounts & Security" },
    { id: "content", label: "4. Your Content & License" },
    { id: "prohibited", label: "5. Prohibited Conduct" },
    { id: "moderation", label: "6. Moderation & Enforcement" },
    { id: "intellectual", label: "7. Intellectual Property" },
    { id: "dmca", label: "8. DMCA / Copyright" },
    { id: "privacy", label: "9. Privacy" },
    { id: "thirdparty", label: "10. Third-Party Links" },
    { id: "warranties", label: "11. Disclaimers" },
    { id: "liability", label: "12. Limitation of Liability" },
    { id: "indemnity", label: "13. Indemnification" },
    { id: "termination", label: "14. Termination" },
    { id: "governinglaw", label: "15. Governing Law" },
    { id: "changes", label: "16. Changes to These Terms" },
    { id: "contact", label: "17. Contact" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-neutral-100">
      {/* Header */}
      <header className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)]">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Last updated: {updated}. By using Lustiie, you agree to these Terms.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/l/privacy"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:bg-neutral-800"
          >
            Read our Privacy Policy
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
          <Section id="acceptance" title="1. Acceptance of Terms">
            Lustiie (“we”, “us”, “our”) provides a text-only discussion platform
            (“Service”). By accessing or using the Service, you agree to these Terms
            and all incorporated policies (including our{" "}
            <AL href="/l/rules">Forum Rules</AL> and <AL href="/l/privacy">Privacy Policy</AL>).
            If you do not agree, do not use the Service.
          </Section>

          <Section id="eligibility" title="2. Eligibility">
            You must be at least the age of majority in your place of residence to use
            Lustiie. You represent that you are legally able to enter into these Terms.
          </Section>

          <Section id="accounts" title="3. Accounts & Security">
            You are responsible for your account, credentials, and all activity
            occurring under it. Promptly notify us if you suspect unauthorized access.
            We may require verification steps and may suspend or close accounts for
            security or policy reasons.
          </Section>

          <Section id="content" title="4. Your Content & License">
            You retain ownership of content you submit to the Service. You grant
            Lustiie a worldwide, non-exclusive, royalty-free license to host, store,
            reproduce, distribute, and display your content solely for operating,
            improving, and promoting the Service. You represent you have the necessary
            rights to post your content and that it does not violate law or third-party
            rights. You are solely responsible for your content.
          </Section>

          <Section id="prohibited" title="5. Prohibited Conduct">
            You agree not to:
            <ul className="mt-2 list-inside list-disc space-y-1 text-neutral-300">
              <li>Post illegal, infringing, hateful, harassing, or doxxing content.</li>
              <li>Post images, videos, or embeds (Lustiie is text-only).</li>
              <li>Impersonate others or misrepresent affiliation.</li>
              <li>Scrape or attempt to reverse-engineer the Service.</li>
              <li>Spam, manipulate votes, or interfere with normal operation.</li>
              <li>Evade moderation actions or create ban-evading accounts.</li>
            </ul>
            Additional rules may apply in the <AL href="/l/rules">Forum Rules</AL>.
          </Section>

          <Section id="moderation" title="6. Moderation & Enforcement">
            We may remove content, limit visibility, or suspend/terminate accounts at
            our discretion for violations of these Terms or the Forum Rules. We may
            preserve and disclose information if required by law or in good-faith belief
            such action is reasonably necessary.
          </Section>

          <Section id="intellectual" title="7. Intellectual Property">
            The Service and all non-user content (including software, design, and
            branding) are owned by Lustiie or its licensors and are protected by
            applicable laws. Except as expressly permitted, you may not copy,
            modify, or create derivative works from the Service.
          </Section>

          <Section id="dmca" title="8. DMCA / Copyright">
            If you believe content infringes your copyright, send a notice including:
            (a) your contact info, (b) identification of the work, (c) identification of
            the allegedly infringing material and its location, (d) a good-faith
            statement, and (e) a statement under penalty of perjury that you are
            authorized. We may remove content and, where appropriate, terminate repeat
            infringers. (Provide an email in the Contact section.)
          </Section>

          <Section id="privacy" title="9. Privacy">
            Our collection and use of personal data are described in the{" "}
            <AL href="/l/privacy">Privacy Policy</AL>. You agree to those practices.
          </Section>

          <Section id="thirdparty" title="10. Third-Party Links">
            The Service may contain links to third-party sites. We are not responsible
            for their content, policies, or practices. Access them at your own risk.
          </Section>

          <Section id="warranties" title="11. Disclaimers">
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT
            PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            We do not warrant that the Service will be uninterrupted, secure, or error-free.
          </Section>

          <Section id="liability" title="12. Limitation of Liability">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUSTIIE AND ITS AFFILIATES,
            OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
            INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            Our total liability for any claim arising from or relating to the Service
            will not exceed the greater of USD $100 or the amount you paid to us in the
            12 months preceding the event.
          </Section>

          <Section id="indemnity" title="13. Indemnification">
            You agree to defend, indemnify, and hold harmless Lustiie and its
            affiliates from any claims, liabilities, damages, losses, and expenses,
            including reasonable attorneys’ fees, arising out of or related to your
            content or use of the Service, or your violation of these Terms or any law.
          </Section>

          <Section id="termination" title="14. Termination">
            You may stop using the Service at any time. We may suspend or terminate
            access at any time with or without notice for any reason, including
            violations of these Terms. Upon termination, the licenses granted by you
            remain in effect for operational copies already made in the normal course of
            providing the Service.
          </Section>

          <Section id="governinglaw" title="15. Governing Law">
            These Terms are governed by the laws of your applicable jurisdiction
            (update this to your region; e.g., the State of California, USA, without
            regard to conflict-of-laws rules). Venue for disputes will be the courts
            located in that jurisdiction.
          </Section>

          <Section id="changes" title="16. Changes to These Terms">
            We may revise these Terms from time to time. If changes are material, we
            will provide reasonable notice (e.g., by posting to this page or via the
            Service). Your continued use of the Service after changes become effective
            constitutes acceptance of the revised Terms.
          </Section>

          <Section id="contact" title="17. Contact">
            Questions about these Terms or copyright notices can be sent to:
            <div className="mt-2 rounded border border-neutral-800 bg-neutral-950/60 p-3 text-sm text-neutral-300">
              Email: <a className="underline" href="mailto:legal@lustiie.link">legal@lustiie.link</a>
            </div>
          </Section>

          <div className="pt-2">
            <a
              href="#"
              className="text-sm text-neutral-400 underline hover:text-neutral-200"
            >
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
    <section id={id} className="scroll-mt-24 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
      <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
      <div className="prose prose-invert prose-sm mt-2 max-w-none text-neutral-300">
        {children}
      </div>
    </section>
  );
}

function AL({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="underline decoration-fuchsia-500/60 underline-offset-2 hover:text-white">
      {children}
    </Link>
  );
}
