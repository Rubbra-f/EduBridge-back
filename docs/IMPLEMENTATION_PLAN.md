# EduBridge-back — integration notes

## Implemented on this branch
- Replaced the old student catalog's pre-test/post-test/locked/remedial language with student-selected topics and a single diagnostic test.
- Replaced the quiz page with a single-attempt experience and removed retry, post-test, and remedial actions.
- Student progress now shows topic completion only; detailed scores and diagnostic estimates are not displayed there.
- Added a frontend API client scaffold and a teacher dashboard route/shell.

## Important current limitations — not production-ready
- The current student quiz is still a local demo: question content is in `src/pages/dashboard/quizData.js`, and the completion marker is stored in browser localStorage. A student can clear storage or use another device; this is NOT server-enforced one-attempt-per-student.
- The existing login and registration pages are demo navigation only. The teacher route is not protected by server-side role authentication yet.
- The FastAPI backend currently protects endpoints with a shared API key, not student/teacher sessions, and does not persist student submissions/reports.
- The existing narrative service uses its configured local SLM path (`NarrativeGenerator`); an environment variable named `GEMINI_API_KEY` alone does not prove Gemini is integrated. Do not label generated narratives as Gemini until the provider is implemented and verified.
- The frontend must not contain a privileged API key in a public build. Browser traffic should go through an authenticated server-side session/proxy.

## Required backend work before deployment
1. Add proper password authentication and signed sessions/tokens with student/teacher roles. Self-registration must create students only; teacher accounts should be provisioned by an administrator.
2. Persist students, classes, enrollments, topic attempts, responses, P-DINA diagnosis, and AI narrative in a database.
3. Enforce a unique database constraint for one completed assessment per student and topic. Check it transactionally before accepting submission.
4. Serve assessment questions from the authorized EEDI/P-DINA item bank; score answers server-side and never return answer keys.
5. Generate and persist P-DINA reports after submission. Integrate Gemini explicitly as a narrative layer that explains existing P-DINA facts without changing model estimates.
6. Add teacher-only endpoints scoped to classes assigned to the authenticated teacher. Students must never be able to request another student's reports.
7. Restrict CORS to deployed frontend origins and keep API secrets server-side.

## EEDI content licensing
Before publicly serving EEDI question text or images, confirm the dataset/content redistribution terms and authorization. Keep answer keys and model artifacts server-side.
