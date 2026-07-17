// app/(admin)/admin/crm/page.tsx
import CrmTable from '@/components/admin/CrmTable';

export default function CrmPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white">CRM</h1>
      <p className="mt-1 text-sm text-slate-400">All leads, searchable and filterable.</p>
      <div className="mt-6">
        <CrmTable />
      </div>
    </div>
  );
}
