// app/_/rules/page.tsx
import { ShieldCheck, Gavel, Flag, MessageSquare, ThumbsUp, Lock, Link as LinkIcon, EyeOff, AlertTriangle, Hash, Tags, UsersRound, FileWarning, Megaphone, Ban, MailQuestion } from "lucide-react";

export const metadata = {
  title: "Community Rules — Lustliie",
  description: "Clear posting rules, safety guidelines, and moderation policy for Lustliie.",
};

type Rule = { title: string; desc: string; icon: React.ReactNode; id: string };

const sections: { heading: string; items: Rule[] }[] = [
  {
    heading: "Be decent. No harassment or illegal content.",
    items: [
      {
        id: "respect",
        title: "Respect other members",
        desc: "No hate speech, targeted harassment, slurs, threats, dogpiling, or brigading. Attack ideas, not people.",
        icon: <UsersRound className="h-5 w-5" />,
      },
      {
        id: "illegal",
        title: "No illegal or dangerous content",
        desc: "Absolutely no doxxing, blackmail, non-consensual content, piracy, or solicitation for illegal services.",
        icon: <AlertTriangle className="h-5 w-5" />,
      },
      {
        id: "minors",
        title: "Zero tolerance involving minors",
        desc: "Content sexualizing minors (real or implied), age-guessing games, or attempts to identify ages are strictly prohibited.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    heading: "Post quality & accuracy",
    items: [
      {
        id: "sources",
        title: "Back up claims",
        desc: "If you state a fact, include a source. Mark unverified info as opinion or speculation.",
        icon: <LinkIcon className="h-5 w-5" />,
      },
      {
        id: "spoilers",
        title: "Use spoiler/content warnings",
        desc: "Clearly mark spoilers and sensitive topics. Use plain 'Spoiler:' or 'CW:' at the start when needed.",
        icon: <EyeOff className="h-5 w-5" />,
      },
      {
        id: "duplicates",
        title: "Avoid duplicates",
        desc: "Search before posting. If a thread exists, add to it instead of creating a new duplicate.",
        icon: <Hash className="h-5 w-5" />,
      },
    ],
  },
  {
    heading: "Thread & reply rules",
    items: [
      {
        id: "tags",
        title: "Tag threads accurately",
        desc: "Use specific, relevant tags only. No keyword spam. Keep total tags reasonable (≤ 8).",
        icon: <Tags className="h-5 w-5" />,
      },
      {
        id: "civility",
        title: "Keep replies constructive",
        desc: "Disagree politely. No low-effort insults, baiting, or repetitive off-topic replies.",
        icon: <MessageSquare className="h-5 w-5" />,
      },
      {
        id: "votes",
        title: "Voting is for quality",
        desc: "Upvote helpful, well-sourced content. Downvote off-topic or low quality — not people you disagree with.",
        icon: <ThumbsUp className="h-5 w-5" />,
      },
    ],
  },
  {
    heading: "Reviews & ‘worth it’ discussions",
    items: [
      {
        id: "reviews",
        title: "Honest, useful reviews",
        desc: "Rate 1–10 with pros/cons. Mark speculation vs. firsthand experience. No review brigading or vote manipulation.",
        icon: <FileWarning className="h-5 w-5" />,
      },
      {
        id: "proof",
        title: "Verified purchase (optional)",
        desc: "If you claim purchase, you may be asked for private proof by a mod. Never post private receipts publicly.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    heading: "Safety & privacy",
    items: [
      {
        id: "privacy",
        title: "Protect personal info",
        desc: "No doxxing or posting private social handles, addresses, or unshared legal names. Respect creator privacy.",
        icon: <Lock className="h-5 w-5" />,
      },
      {
        id: "report",
        title: "Report, don’t escalate",
        desc: "Use the report button for rule violations. Don’t retaliate or start meta-arguments.",
        icon: <Flag className="h-5 w-5" />,
      },
    ],
  },
  {
    heading: "Commercial & self-promotion",
    items: [
      {
        id: "spam",
        title: "No spam or undisclosed ads",
        desc: "No link farms, paid shills, referral spam, or undisclosed affiliations. If you promote, disclose clearly.",
        icon: <Megaphone className="h-5 w-5" />,
      },
    ],
  },
];

const consequences = [
  { level: "Soft warning", eg: "Minor off-topic, low-effort, or accidental rule slip." },
  { level: "Content removal", eg: "Spam, duplicate, misleading title, or unsourced claims." },
  { level: "Temporary ban", eg: "Harassment, repeated low-effort, vote manipulation, targeted spam." },
  { level: "Permanent ban", eg: "Severe harassment, illegal content, sexual content involving minors, doxxing." },
];

export default function RulesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <div className="text-[11px] text-neutral-500">Home / Rules</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Community Rules</h1>
        <p className="mt-3 text-sm text-neutral-400">
          Lustliie is a civil, source-driven discussion space. Follow these rules to keep conversations helpful and safe.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge icon={<ShieldCheck className="h-3.5 w-3.5" />} text="Safety first" />
          <Badge icon={<Gavel className="h-3.5 w-3.5" />} text="Fair moderation" />
          <Badge icon={<ThumbsUp className="h-3.5 w-3.5" />} text="Quality over noise" />
        </div>
      </header>

      {/* Quick nav */}
      <nav className="mb-8 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-xs text-neutral-300">
        <div className="flex flex-wrap gap-3">
          {sections.map((s, i) => (
            <a key={i} href={`#s-${i}`} className="rounded-lg px-2 py-1 hover:bg-neutral-900">
              {s.heading}
            </a>
          ))}
          <a href="#moderation" className="rounded-lg px-2 py-1 hover:bg-neutral-900">Moderation & Appeals</a>
          <a href="#faq" className="rounded-lg px-2 py-1 hover:bg-neutral-900">FAQ</a>
        </div>
      </nav>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, si) => (
          <section key={si} id={`s-${si}`} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-300">{section.heading}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {section.items.map((r) => (
                <li key={r.id} id={r.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200">
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-100">{r.title}</h3>
                      <p className="mt-1 text-sm text-neutral-400">{r.desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Moderation & Appeals */}
      <section id="moderation" className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-300">Moderation & Appeals</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              <h3 className="text-sm font-semibold">How moderation works</h3>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
              <li>Reports are reviewed by moderators; actions are logged.</li>
              <li>We prioritize safety violations and urgent harm first.</li>
              <li>Context matters — we look at intent, history, and impact.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              <h3 className="text-sm font-semibold">Possible consequences</h3>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-neutral-400">
              {consequences.map((c) => (
                <li key={c.level} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-2">
                  <span className="font-medium text-neutral-200">{c.level}:</span> {c.eg}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="flex items-center gap-2">
            <MailQuestion className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Appeals</h3>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            If you believe a moderation action was made in error, contact support via the Report/Appeal form with
            your username, the link to the content, and a concise explanation. Repeated or hostile appeals may be ignored.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-300">FAQ</h2>
        <div className="grid gap-4">
          <FAQ
            q="Can I post leaks or private content?"
            a="No. Piracy, leaks, and any non-consensual content are strictly prohibited and will result in a permanent ban."
          />
          <FAQ
            q="How should I title my thread?"
            a="Be precise and searchable. Avoid clickbait. Include model/context and what the thread covers."
          />
          <FAQ
            q="What counts as harassment?"
            a="Insults, targeted name-calling, hateful slurs, persistent unwanted contact, or attempts to rally others against a person."
          />
          <FAQ
            q="Are reviews allowed?"
            a="Yes. Use our reviews feature to rate 1–10 with a short title and a clear summary. Mark speculation vs. firsthand experience."
          />
        </div>
      </section>

      <footer className="mt-10 border-t border-neutral-900 pt-6 text-xs text-neutral-500">
        Last updated: {new Date().toLocaleDateString()} • These rules may evolve as the community grows.
      </footer>
    </main>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1 text-[11px] text-neutral-300">
      {icon} {text}
    </span>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-start gap-2">
        <QuestionIcon />
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">{q}</h3>
          <p className="mt-1 text-sm text-neutral-400">{a}</p>
        </div>
      </div>
    </div>
  );
}

function QuestionIcon() {
  return (
    <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-neutral-800 bg-neutral-900">
      <span className="text-sm font-bold text-neutral-200">?</span>
    </div>
  );
}
