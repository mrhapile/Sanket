# SANKET Build Plan

## Milestone 1 — Foundation

1. Create the web application shell and baseline styling.
2. Define types and versioned persistent state.
3. Build shared header, dashboard switcher, network selector, and prototype disclosure.

**Done when:** page reload restores selected network mode and empty state without errors.

## Milestone 2 — Correct message engine

1. Implement message confirmation with immutable ID, timestamp, and sequence.
2. Implement receiver-side idempotent persistence.
3. Implement all lifecycle transitions and acknowledgement.
4. Unit-test state transitions, ordering, and duplicates.

**Done when:** lifecycle acceptance scenarios in `docs/MESSAGE_LIFECYCLE.md` pass without relying on the UI.

## Milestone 3 — Network reliability simulation

1. Implement Normal delivery.
2. Implement Disconnected queueing and automatic reconnect retry.
3. Implement deterministic Unstable delay/failure controls.
4. Persist and rehydrate queues safely.

**Done when:** a queued message survives refresh and arrives once after reconnect.

## Milestone 4 — Voice-first user interface

1. Build the Sender composer with Wispr Flow guidance and transcript review.
2. Build sender queue/history and status explanation.
3. Build Receiver inbox, notification, and acknowledgement action.
4. Add Hindi/English/mixed-language sample content for demo only.

**Done when:** the full primary flow can be completed without typing except transcript correction.

## Milestone 5 — Verification and submission

1. Run every quality gate in `docs/TEST_PLAN.md`.
2. Fix all behaviour failures and responsive issues.
3. Record the exact sequence in `docs/DEMO_AND_ACCEPTANCE.md`.
4. Prepare repository README with setup, prototype boundary, tested flow, and Wispr Flow usage note.

**Done when:** the demo can be replayed reliably from a clean persisted state and all mandatory submission artifacts are ready.

## Priority rule

Never work on visual polish before Milestones 2 and 3 are correct. The judged proof is the reliable workflow, not a mock dashboard.
