// components/admin/PipelineBoard.tsx
'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { createBrowserClient } from '@supabase/ssr';

const STAGES = [
  { key: 'new_lead', label: 'New Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'deposit_paid', label: 'Deposit Paid' },
  { key: 'balance_due', label: 'Balance Due' },
  { key: 'paid_in_full', label: 'Paid In Full' },
  { key: 'checked_in', label: 'Checked In' },
  { key: 'trip_completed', label: 'Trip Completed' },
  { key: 'course_sold', label: 'Course Sold' },
  { key: 'mentorship_sold', label: 'Mentorship Sold' },
] as const;

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  pipeline_stage: string;
};

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    supabase
      .from('leads')
      .select('id, first_name, last_name, pipeline_stage')
      .neq('pipeline_stage', 'lost')
      .then(({ data }) => setLeads((data as Lead[]) ?? []));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStage = destination.droppableId;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === draggableId ? { ...l, pipeline_stage: newStage } : l))
    );

    // Persist via API route (keeps server-side validation + audit logging in one place)
    await fetch(`/api/leads/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline_stage: newStage }),
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Droppable droppableId={stage.key} key={stage.key}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-64 shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-3"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {stage.label}
                  <span className="ml-2 text-slate-600">
                    {leads.filter((l) => l.pipeline_stage === stage.key).length}
                  </span>
                </p>
                <div className="flex flex-col gap-2 min-h-[40px]">
                  {leads
                    .filter((l) => l.pipeline_stage === stage.key)
                    .map((lead, index) => (
                      <Draggable draggableId={lead.id} index={index} key={lead.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                          >
                            {lead.first_name} {lead.last_name}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
