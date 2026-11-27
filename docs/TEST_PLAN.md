# SANKET Test Plan

## Quality gates

Run all of these before recording the submission video. Use two browser windows side by side: one on `/sender`, one on `/receiver`.

| ID | Scenario | Expected result |
|---|---|---|
| Q1 | Speak into the composer using Browser Speech Recognition, correct one word by typing, and confirm. | The confirmed text (after correction) is the exact body stored in SQLite. |
| Q2 | Send in Normal mode (Socket.io connected). | Receiver window gets one message in real time; Sender badge shows `Delivered`. |
| Q3 | Acknowledge on the Receiver window. | Both windows show `Acknowledged` with the same `acknowledgedAt` timestamp from SQLite. |
| Q4 | Confirm in Disconnected mode (toggle or go offline), refresh the Sender page, then reconnect. | Message is `Pending` in localStorage after refresh. It delivers automatically and exactly once after reconnect. |
| Q5 | Confirm several messages while Disconnected, refresh, then reconnect. | All messages deliver in confirmation sequence order (1, 2, 3…); none are duplicated on Receiver. |
| Q6 | In Unstable mode, toggle Force Next Failure on, then confirm a message. | Message remains `Pending`; attempt count increments; last error is visible; Receiver shows no message. |
| Q7 | Programmatically emit `message:send` twice with the same message ID. | SQLite contains one row; Receiver shows one message card. |
| Q8 | Deliver a message; leave it unacknowledged; refresh both pages. | Message is still `Delivered` on both windows after reload; it is never auto-promoted to `Acknowledged`. |
| Q9 | Open `/sender` and `/receiver` at 375 px width (Chrome DevTools device toolbar). | All controls, status badges, message cards, and buttons are visible and tappable without horizontal scroll. |
| Q10 | Tab through the Sender window using keyboard only. | Composer, Start Voice Input, Confirm & Send, network mode buttons, dashboard switcher, and Acknowledge (on Receiver) are all reachable with visible focus rings. |

## Automated checks

### Unit tests (run with `npm test`)

- Message state transitions: all valid paths; all invalid skips rejected.
- Sequence ordering: messages inserted out of order render in ascending sequence.
- Idempotent delivery: `received_ids` unique constraint; second insert returns existing row.
- Idempotent acknowledgement: second acknowledge call does not change `acknowledgedAt`.
- localStorage queue: `pending` messages survive a serialise/deserialise cycle unchanged.
- Storage rehydration: loading a state with `pending` messages keeps them `pending`.
- SQLite schema: all required columns exist; unique constraints are enforced.

### Integration tests (run with `npm run test:integration`)

- Full happy path: confirm → Socket.io emit → server write → push to Receiver → acknowledge → Sender sees Acknowledged.
- Disconnected queue → page reload → reconnect → auto-drain → all delivered in order.
- Duplicate emit → one SQLite row → one Receiver card.

## Manual evidence to save

- Screenshot: Sender outbox showing `Pending` queue before refresh.
- Screenshot: same messages `Delivered` after reconnect, with sequence order intact.
- Screenshot: `Acknowledged` status visible on both Sender history and Receiver inbox simultaneously.
- Screenshot: SQLite database file opened in DB Browser showing the delivered rows.
- Console check: no runtime errors, no unhandled promise rejections during the full demo path.
- Network tab check: Socket.io `message:send` → `message:delivered` event pair visible in browser DevTools.

## Failure policy

If a required quality gate fails, fix the behaviour or cut the unsupported feature. Do not hide failures with static UI text, manually altered status values, or pre-seeded database rows that were not produced by the actual flow.
