# SANKET Agent Rules

## Product boundary

Build only the SANKET prototype: a voice-first communication reliability assistant for Indian defence personnel. It is a simulated web application, not a military communication system, radio integration, secure deployment, or real-world operational tool.

Do not change the audience, add unrelated features, or replace voice-first interaction with a text chat app.

## Truthful claims

- Call all transport, network conditions, identities, and delivery events **simulated**.
- Do not claim defence-grade security, real radio compatibility, offline Wispr Flow transcription, or field validation.
- Wispr Flow is the primary dictated-input workflow: it types into the focused composer. The web app must not claim it directly calls a Wispr API unless an actual documented integration is added and verified.
- Manual typing is a fallback only.

## Non-negotiable behaviour

- The sender reviews a transcript before confirming it.
- Every confirmed message has a stable unique ID, sender identity, created timestamp, and per-conversation sequence number.
- A message is `sent` only after confirmation, `delivered` only after the receiver-side store records it, and `acknowledged` only after receiver action.
- Failed, delayed, and disconnected sends remain pending. Never show them as delivered.
- Duplicate delivery is prevented by message ID. Ordering is based on sequence number, not arrival time.
- Pending messages and histories survive refresh.

## Working method

1. Read `docs/PRODUCT_SPEC.md`, `docs/MESSAGE_LIFECYCLE.md`, and the relevant task in `docs/BUILD_PLAN.md` before editing.
2. Keep changes small and scoped. Do not overwrite unrelated work.
3. Update tests and the relevant document when changing a behaviour contract.
4. Run the applicable checks in `docs/TEST_PLAN.md` before claiming a task is finished.
5. Record verified evidence only; label mocks and simulations plainly.

## Definition of done

A task is done only when its observable UI behaviour works, refresh behaviour is checked where relevant, and its acceptance criteria are met. Code existing without a working user flow is not completion.
