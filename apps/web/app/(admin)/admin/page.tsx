// app/(admin)/admin/page.tsx
import DashboardWidgets from '@/components/admin/DashboardWidgets';

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">
        Traders Club Worldwide — live business overview
      </p>
      <div className="mt-6">
        <DashboardWidgets />
      </div>
    </div>
  );
}
