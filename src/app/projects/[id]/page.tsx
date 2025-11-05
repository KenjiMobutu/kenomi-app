
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import AnimatedContainer from '@/components/AnimatedContainer';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('Project')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <AnimatedContainer>
        <h1 className="text-3xl font-bold drop-shadow">{data.title}</h1>
        <p className="mt-2 text-white/90">{data.description}</p>
        <p className="text-sm text-blue-100 mt-2">
          Créé le {new Date(data.created_at).toLocaleDateString()}
        </p>

        <a
          href={`/projects/${id}/edit`}
          className="inline-block bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100 font-semibold mt-4"
        >
          ✏️ Modifier
        </a>
      </AnimatedContainer>
    </main>
  );
}
