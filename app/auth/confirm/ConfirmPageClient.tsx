// app/auth/confirm/ConfirmPageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const USERNAME_RULE = /^[a-z0-9_]{3,20}$/i;

export default function ConfirmPageClient({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [phase, setPhase] = useState<
    "verifying" | "need-username" | "done" | "error"
  >("verifying");
  const [message, setMessage] = useState("Confirming…");
  const [userId, setUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  // 1) Verify the token
  useEffect(() => {
    const token_hash = searchParams.token_hash || "";
    const type =
      (searchParams.type as
        | "magiclink"
        | "signup"
        | "recovery"
        | "email_change"
        | "invite") || "magiclink";

    (async () => {
      try {
        if (!token_hash) {
          setPhase("error");
          setMessage("Invalid confirmation link.");
          return;
        }

        // exchange token for a session
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (error) {
          setPhase("error");
          setMessage(error.message || "Could not confirm.");
          return;
        }

        // read session + user
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id || null;
        setUserId(uid);

        if (!uid) {
          setPhase("error");
          setMessage("No session after confirmation.");
          return;
        }

        // 2) Check profiles.username
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", uid)
          .maybeSingle();

        if (prof?.username) {
          setPhase("done");
          router.replace("/"); // already has username → go home
          return;
        }

        // need username
        setPhase("need-username");
        setMessage("");
      } catch (e: any) {
        setPhase("error");
        setMessage(e?.message || "Unexpected error during confirmation.");
      }
    })();
  }, [searchParams, supabase, router]);

  async function isAvailable(candidate: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate.toLowerCase())
      .limit(1);
    if (!data || data.length === 0) return true;
    return data[0].id === userId; // editing own name permitted
  }

  // 3) Save username (DB + user_metadata), then redirect
  async function saveUsername() {
    const raw = input.trim();
    if (!USERNAME_RULE.test(raw)) {
      alert("Username must be 3–20 chars: letters, numbers, underscores.");
      return;
    }
    if (!userId) {
      alert("No user session.");
      return;
    }

    const candidate = raw.toLowerCase();
    setSaving(true);

    if (!(await isAvailable(candidate))) {
      setSaving(false);
      alert("Sorry, that username is taken.");
      return;
    }

    // Upsert into profiles
    const { error: upErr } = await supabase.from("profiles").upsert(
      {
        id: userId,
        username: candidate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (upErr) {
      setSaving(false);
      alert(upErr.message);
      return;
    }

    // Mirror to auth.user_metadata
    const { error: metaErr } = await supabase.auth.updateUser({
      data: { username: candidate },
    });
    setSaving(false);
    if (metaErr) {
      alert(metaErr.message);
      return;
    }

    setPhase("done");
    router.replace("/");
  }

  // ---------- UI ----------
  if (phase === "verifying" || phase === "error") {
    return (
      <div className="min-h-[50vh] grid place-items-center px-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-6 text-sm text-neutral-200">
          {message}
        </div>
      </div>
    );
  }

  if (phase === "need-username") {
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="text-sm font-semibold">Choose a username</div>
          <p className="mt-1 text-xs text-neutral-400">
            3–20 characters · letters, numbers, underscores. Must be unique.
          </p>
          <div className="mt-4 space-y-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="yourname"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
            />
            <button
              disabled={saving}
              onClick={saveUsername}
              className="w-full rounded-lg bg-fuchsia-600 py-2 text-sm font-semibold hover:bg-fuchsia-500 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save username"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // phase === "done"
  return null;
}
