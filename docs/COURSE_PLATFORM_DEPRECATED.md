# Course Platform — Phase 7

## What's built
- **`/courses`** — published courses grid with title search (`?q=`)
- **`/courses/[courseId]`** — lesson sidebar + video player, tracks video progress every 10 seconds of playback (not every frame — avoids hammering the DB), resumes from last position on reload, "Mark Complete" button, bookmarking, and a certificate banner that appears automatically
- **Auto-certificate issuance** — a Postgres trigger (`phase7-schema.sql`) checks after every lesson-progress update whether *all* lessons in that course are now complete for that user, and if so issues a certificate with a unique number (e.g. `TCW-A1B2C3D4`) — no application code needed to keep this in sync, it's enforced at the database layer so it can't drift
- **Bookmarks** — per-lesson, with RLS so a user only ever sees their own

## Schema additions this phase
- `lesson_bookmarks`
- `certificates`
- `check_course_completion()` trigger function

## Deliberately not built this phase
- **Quizzes/assignments** — the original schema doesn't have a quiz-question data model yet, and quiz content (actual questions, correct answers, assignment prompts) needs to come from Daniel's actual course material, not fabricated. Structure is easy to add once you have real quiz content to load in — flag it and I'll build the table + UI around it.
- **Certificate PDF download** — currently just a database record + on-screen banner. A downloadable branded PDF certificate is a quick follow-up once you confirm you want it (uses the same design tokens from Phase 3).
