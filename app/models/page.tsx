import { supabaseServer } from '@/lib/supabase';
export const revalidate = 300;

export default async function ModelsPage() {
  const supabase = supabaseServer();
  const { data: models } = await supabase
    .from('models')
    .select('id, slug, display_name, bio')
    .order('display_name', { ascending: true });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Models</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {(models ?? []).map(m => (
          <a key={m.id} href={`/m/${m.slug}`} className="rounded-xl border border-neutral-800 p-4 hover:bg-neutral-900">
            <div className="font-semibold">{m.display_name}</div>
            <div className="text-sm text-neutral-400 line-clamp-2">{m.bio}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
