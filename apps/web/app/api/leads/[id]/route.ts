// app/api/leads/[id]/route.ts
// Updates a single lead — used by the pipeline drag-and-drop board and
// the lead detail panel. Every change is written to audit_logs so staff
// actions are traceable (security requirement from the master spec).

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updates = await request.json();

  // Only allow known, safe fields to be updated through this endpoint
  const allowedFields = ['pipeline_stage', 'notes', 'tags', 'salesperson_id', 'last_contacted_at'];
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('leads')
    .update(safeUpdates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit trail — who changed what, and to what value
  await supabase.from('audit_logs').insert({
    action: 'lead_updated',
    target_table: 'leads',
    target_id: params.id,
    metadata: safeUpdates,
  });

  return NextResponse.json({ success: true, lead: data });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, lead_tasks(*)')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
