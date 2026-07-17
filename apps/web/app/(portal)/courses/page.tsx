// app/(portal)/courses/page.tsx
// Rebuilt around Whop — course content, video delivery, and progress
// tracking all live on Whop now. This page just shows purchase status
// and links out to (or embeds checkout for) each course.

import { createServerSupabase } from '@/lib/supabase/server';
import WhopCheckoutEmbed from '@/components/marketing/WhopCheckoutEmbed';

// Configure one entry per course/product you sell on Whop.
// planId/accessPassId come from your Whop dashboard once each product exists.
const WHOP_COURSES = [
  {
    accessPassId: process.env.NEXT_PUBLIC_WHOP_COURSE_ACCESS_PASS_ID ?? '',
    planId: process.env.NEXT_PUBLIC_WHOP_COURSE_PLAN_ID ?? '',
    title: 'Trading Fundamentals Course',
    description: "Daniel Gamble's core trading curriculum, hosted on Whop.",
    whopExperienceUrl: process.env.NEXT_PUBLIC_WHOP_COURSE_URL ?? 'https://whop.com/',
  },
];

export default async function CoursesPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from('whop_memberships')
    .select('whop_access_pass_id, status')
    .eq('profile_id', user?.id)
    .eq('status', 'active');

  const activePassIds = new Set((memberships ?? []).map((m) => m.whop_access_pass_id));

  return (
    <div>
      <h1 className="font-serif text-3xl">Courses</h1>
      <p className="mt-1 text-ivory-200/70">
        Course content is hosted on Whop — purchase or continue below.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {WHOP_COURSES.map((course) => {
          const owned = activePassIds.has(course.accessPassId);
          return (
            <div key={course.accessPassId} className="rounded-xl border border-ivory-200/10 bg-ink-800/40 p-6">
              <p className="font-serif text-xl">{course.title}</p>
              <p className="mt-2 text-sm text-ivory-200/60">{course.description}</p>

              {owned ? (
                <a
                  href={course.whopExperienceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink-900 hover:bg-gold-400"
                >
                  Continue Course on Whop →
                </a>
              ) : (
                <div className="mt-4">
                  <WhopCheckoutEmbed
                    planId={course.planId}
                    prefillEmail={user?.email}
                    returnUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/courses`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
