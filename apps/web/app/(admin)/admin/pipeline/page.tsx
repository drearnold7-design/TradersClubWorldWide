// app/(admin)/admin/pipeline/page.tsx
import PipelineBoard from '@/components/admin/PipelineBoard';

export default function PipelinePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white">Sales Pipeline</h1>
      <p className="mt-1 text-sm text-slate-400">Drag a card to update its stage.</p>
      <div className="mt-6">
        <PipelineBoard />
      </div>
    </div>
  );
}
