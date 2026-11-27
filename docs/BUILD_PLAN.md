# SANKET Build Plan

## Priority rule

Never work on visual polish before Milestones 2 and 3 are correct and tested. The judged proof is the reliable workflow, not aesthetics.

---

## Milestone 1 — Foundation

1. Scaffold Vite + TypeScript frontend and Node.js + Express backend in the same repo.
2. Set up Socket.io on both server and client.
3. Initialise SQLite with `better-sqlite3` and run schema migrations.
4. Define all TypeScript types (`Message`, `AppState`, `NetworkMode`, `DeliveryResult`).
5. Build shared localStorage storage module for the offline queue and sequence counter.
6. Build the shell UI: header, Sender/Receiver tab switcher, network selector, connection status badge, prototype disclosure banner.

**Done when:** Both browser tabs open, join the same Socket.io room, and the page reload restores localStorage state without errors. `GET /api/health` returns `{ status: "ok", dbConnected: true }`.

---

## Milestone 2 — Correct message engine

1. Implement message confirmation: immutable ID (UUID v4), `createdAt` timestamp, per-conversation sequence number.
2. Implement server-side `message:send` handler: insert into SQLite with unique constraint; return existing row on duplicate.
3. Implement receiver-side idempotent delivery: server pushes `message:delivered` to room; client renders once per ID.
4. Implement all lifecycle transitions: `pending → sent → delivered → acknowledged`.
5. Implement acknowledgement: server updates SQLite `acknowledgedAt`; emits `message:acknowledged` to Sender.
6. Unit-test all state transitions, ordering, duplicate prevention, and idempotent acknowledgement.

**Done when:** All five lifecycle acceptance scenarios in `docs/MESSAGE_LIFECYCLE.md` pass. Duplicate `message:send` emits produce one SQLite row and one Receiver-visible message.

---

## Milestone 3 — Offline queue and network reliability

1. Implement localStorage offline queue: save `pending` messages on confirm when disconnected.
2. Implement `navigator.onLine` listener and Socket.io `connect` event: trigger queue drain on reconnect.
3. Implement queue drain: process pending messages in ascending `sequence` order, one at a time, waiting for server ack between each.
4. Implement manual network mode toggle (Normal / Unstable / Disconnected) for demo control.
5. Implement Unstable mode: deterministic delay + configurable force-fail toggle; expose attempt count and error in UI.
6. Implement page-load history restore: `GET /api/messages` fetches SQLite history; merge with localStorage queue.
7. Persist and rehydrate queue safely: reload must never promote `pending` to `delivered`.

**Done when:** A `pending` message survives a full page refresh and delivers exactly once after reconnect. Multiple queued messages deliver in sequence order.

---

## Milestone 4 — Voice-first user interface

1. Implement `speech-service.ts`: wrap `window.SpeechRecognition`; show interim results live in composer; finalise on silence; handle errors gracefully (no mic, not supported).
2. Build Sender composer: focusable `<textarea>`, voice input button, live transcript, correction UX, Confirm & Send button with empty-transcript guard.
3. Build voice input instruction panel: label it "Browser Speech Recognition (Web Speech API)" clearly; include step-by-step dictation guide; include Wispr Flow alternative note.
4. Build sender outbox queue: ID, sequence, timestamp, status badge, attempt count, last error.
5. Build sender history: all confirmed messages with full status trail, most recent first.
6. Build status legend: Sent / Delivered / Acknowledged with text explanations.
7. Build Receiver inbox: real-time push via Socket.io, ordered by sequence, new-message banner with `aria-live`.
8. Build Acknowledge button: per-message, disappears after action, idempotent.
9. Add Hindi, English, and mixed-language sample messages as Load Sample shortcuts (demo convenience, clearly labelled).

**Done when:** The full primary flow — dictate, review, confirm, deliver, acknowledge — can be completed across two browser windows without any manual data entry.

---

## Milestone 5 — Verification and submission

1. Run every quality gate in `docs/TEST_PLAN.md` (Q1–Q10).
2. Fix all behaviour failures and responsive layout issues.
3. Verify accessibility: keyboard navigation, focus rings, aria-live announcements, contrast.
4. Record the demo following `docs/DEMO_AND_ACCEPTANCE.md` exactly.
5. Update `README.md` with final setup instructions, prototype limits, and recording link.
6. Complete all items in `docs/SUBMISSION_CHECKLIST.md`.

**Done when:** The demo replays reliably from a clean database state, all quality gates pass, and all submission artifacts are ready.
