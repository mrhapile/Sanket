# SANKET Agent Rules

## Product boundary

Build the SANKET prototype: a voice-first communication reliability assistant for Indian defence personnel.
It is a working web application with a real Node.js backend, real WebSocket transport, and a real SQLite database.
It is NOT a military communication system, radio integration, secure deployment, or real-world operational tool.

Do not change the audience, add unrelated features, or replace voice-first interaction with a text chat app.

## Truthful claims

- The transport layer uses real WebSockets (Socket.io). Call it what it is — a local network WebSocket connection, not a military radio channel.
- The database is a real SQLite file on the server. Call it what it is — a local prototype database, not a defence-grade secure store.
- Voice input uses the **browser Web Speech API** — a real browser capability. Label it "Browser Speech Recognition" in the UI. Do not call it Wispr Flow.
- Wispr Flow remains a supported dictation path: it types into the focused composer. The app does not call a Wispr API directly. If used, label it "Wispr Flow dictation".
- Do not claim defence-grade security, real radio compatibility, or field validation.
- Network disconnection demo uses a manual toggle and/or `navigator.onLine`. Label it "simulated disconnection" in the UI when using the toggle, and "real network event" when triggered by actual connectivity loss.

## Non-negotiable behaviour

- The sender reviews a transcript before confirming it.
- Every confirmed message has a stable unique ID, sender identity, created timestamp, and per-conversation sequence number.
- A message is `sent` only after confirmation, `delivered` only after the receiver-side database records it, and `acknowledged` only after receiver action.
- Failed, delayed, and disconnected sends remain pending. Never show them as delivered.
- Duplicate delivery is prevented by message ID. The server rejects duplicate IDs. Ordering is based on sequence number, not arrival time.
- Pending messages and histories survive refresh. The offline queue lives in localStorage; delivered history lives in SQLite.
- Both Sender and Receiver dashboards are connected to the same Socket.io room and reflect real-time state.

## Working method

1. Read `docs/PRODUCT_SPEC.md`, `docs/MESSAGE_LIFECYCLE.md`, and the relevant task in `docs/BUILD_PLAN.md` before editing.
2. Keep changes small and scoped. Do not overwrite unrelated work.
3. Update tests and the relevant document when changing a behaviour contract.
4. Run the applicable checks in `docs/TEST_PLAN.md` before claiming a task is finished.
5. Record verified evidence only; label browser speech recognition and local WebSocket transport plainly.

## Definition of done

A task is done only when its observable UI behaviour works across two browser windows, refresh behaviour is verified, and its acceptance criteria are met. Code existing without a working user flow is not completion.
