import { supabaseServer } from '@/lib/supabase';
import { TAGS } from '@/lib/cache';
export const revalidate = 300;
export const dynamicParams = true;

async function getModel(idOrSlug: string) {
  const supabase = supabaseServer();
  const numeric = /^\d+$/.test(idOrSlug);
  const query = supabase.from('models').select('id, slug, display_name, bio')
    [numeric ? 'eq' : 'eq'](numeric ? 'id' : 'slug', numeric ? Number(idOrSlug) : idOrSlug).maybeSingle();
  const { data: model } = await query;
  return model;
}

export default async function ModelPage({ params }: { params: { id: string } }) {
  const model = await getModel(params.id);
  if (!model) return <div className="max-w-4xl mx-auto p-6">Model not found.</div>;

  const supabase = supabaseServer();
  const { data: threads } = await supabase
    .from('threads')
    .select('id, title, slug, created_at')
    .eq('model_id', model.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{model.display_name}</h1>
      <p className="text-neutral-400 mt-2">{model.bio}</p>

      <div className="flex justify-between items-center mt-6">
        <h2 className="font-semibold">Threads</h2>
        <a className="text-sm underline" href="/thread/new?modelSlug={model.slug}">New Thread</a>
      </div>

      <div className="mt-3 space-y-2">
        {(threads ?? []).map(t => (
          <a key={t.id} href={`/t/${t.slug}`} className="block rounded-lg border border-neutral-800 p-3 hover:bg-neutral-900">
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleString()}</div>
          </a>
        ))}
        {(!threads || threads.length === 0) && <div className="text-sm text-neutral-500">No threads yet.</div>}
      </div>
    </main>
  );
}
