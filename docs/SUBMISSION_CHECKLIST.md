# SANKET Submission Checklist

## Required deliverables

- [ ] Clear pain point: degraded voice communication over field radio channels makes instructions hard to deliver, verify, and recover.
- [ ] India impact note: voice-first interface with Hindi, English, and mixed-language support; impact is proposed, not measured.
- [ ] Public GitHub repository link with reproducible setup instructions (`npm install && npm run dev`).
- [ ] Three-minute screen recording demonstrating the full required workflow (see `docs/DEMO_AND_ACCEPTANCE.md`).
- [ ] Voice input note: Browser Web Speech API is used as the primary real-time speech-to-text path; Wispr Flow is a supported alternative that types into the focused composer; the sender reviews all transcripts before confirming.

## Repository README must include

- [ ] One-paragraph description of what SANKET does.
- [ ] Prerequisites and local run instructions.
- [ ] The message lifecycle (pending → sent → delivered → acknowledged) with status definitions.
- [ ] Network modes table (Normal / Unstable / Disconnected) with behaviour descriptions.
- [ ] Voice input section: Web Speech API (primary) and Wispr Flow (alternative).
- [ ] What is tested: unit tests, integration tests, and manual quality gates Q1–Q10.
- [ ] Prototype limits: local WebSocket only (not a military radio), local SQLite (not a defence-grade store), no field validation, no production security hardening, browser speech recognition accuracy not guaranteed.
- [ ] Link or path to the demo recording when available.

## Tech stack to verify before submission

- [ ] `npm install && npm run dev` works from a clean clone on Node.js ≥ 18.
- [ ] SQLite database file is created automatically on first run (no manual setup).
- [ ] Socket.io connection established between two browser windows on the same machine.
- [ ] Web Speech API works in Chrome on the demo machine (test before recording).
- [ ] All 10 quality gates in `docs/TEST_PLAN.md` pass.
- [ ] `npm test` passes with 0 failures.

## Final honesty check

- [ ] No claim says messages are understood merely because they are delivered.
- [ ] No claim says browser speech recognition is exact or safe in all languages or accents.
- [ ] No claim implies the local WebSocket is a real military radio channel.
- [ ] No claim implies the SQLite database is a defence-grade secure store.
- [ ] No claim implies authorised military deployment or field validation.
- [ ] Every on-screen status matches the lifecycle contract in `docs/MESSAGE_LIFECYCLE.md`.
- [ ] Prototype disclosure banner is visible in the demo recording at all times.
