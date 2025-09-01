// app/thread/new/page.tsx
'use client';

import { useMemo, useState } from 'react';

function slugifyTitle(title: string) {
  const words = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return words.join('-').replace(/-+/g, '-').slice(0, 80) || 'thread';
}

export default function NewThreadPage() {
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');
  const [tags, setTags]   = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const slugPreview = useMemo(() => slugifyTitle(title), [title]);
  const titleCount = title.length;
  const bodyCount  = body.length;

  function addTagFromInput() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (t.length > 30) return alert('Tags max length 30.');
    if (tags.includes(t)) { setTagInput(''); return; }
    if (tags.length >= 8) return alert('Max 8 tags.');
    setTags(prev => [...prev, t]);
    setTagInput('');
  }
  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1));
    }
  }
  function removeTag(name: string) {
    setTags(prev => prev.filter(t => t !== name));
  }

  const titleValid = titleCount >= 4 && titleCount <= 180;
  const bodyValid  = bodyCount >= 10 && bodyCount <= 8000;
  const canPublish = titleValid && bodyValid && !loading;

  async function submit() {
    if (!canPublish) return;
    setLoading(true);
    setError(null);

    const r = await fetch('/api/thread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, tags }),
    });
    const j = await r.json();

    setLoading(false);

    if (!r.ok) {
      setError(typeof j.error === 'string' ? j.error : 'Failed to publish.');
      return;
    }
    window.location.href = `/thread/${j.thread.slug}`;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Create Thread</h1>

      {/* Title + Slug preview */}
      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="text-sm font-semibold">Title</div>
          <span className={`text-xs ${titleValid ? 'text-neutral-500' : 'text-rose-400'}`}>
            {titleCount}/180
          </span>
        </div>
        <div className="p-4">
          <input
            className="mb-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's the topic?"
          />
          <div className="text-xs text-neutral-400">
            Slug preview: <span className="text-neutral-200">{slugPreview}</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="text-sm font-semibold">Body</div>
          <span className={`text-xs ${bodyValid ? 'text-neutral-500' : 'text-rose-400'}`}>
            {bodyCount}/8000
          </span>
        </div>
        <div className="p-4">
          <textarea
            className="h-48 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm outline-none focus:border-neutral-700"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Introduce the topic. No images or embeds."
          />
        </div>
      </section>

      {/* Tags */}
      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-2 text-sm font-semibold">Tags</div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2">
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-xs"
              >
                {t}
                <button
                  type="button"
                  className="text-neutral-400 hover:text-white"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={addTagFromInput}
              placeholder={tags.length ? '' : 'Add tag then press Enter'}
              className="min-w-[140px] flex-1 bg-transparent p-1 text-sm outline-none"
            />
          </div>
          <div className="mt-2 text-[11px] text-neutral-400">
            Up to 8 tags. Press <kbd>Enter</kbd> or <kbd>,</kbd> to add.
          </div>
        </div>
      </section>

      {/* Error + Publish */}
      {error && (
        <div className="mb-3 rounded-2xl border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!canPublish}
        className="rounded-xl bg-white px-4 py-2 font-medium text-black shadow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Publishing…' : 'Publish'}
      </button>
    </main>
  );
}
