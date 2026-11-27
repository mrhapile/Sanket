# SANKET Demo and Acceptance Criteria

## Three-minute recording plan

### 0:00–0:20 — Problem and setup

Show SANKET, the two dashboards, the visible prototype disclosure, and the network simulator. State: poor channels can garble audio; SANKET preserves a reviewed transcript before simulated transport.

### 0:20–0:55 — Voice-first composition

On Sender, focus the composer and dictate using Wispr Flow. Show the produced transcript, correct one phrase, and confirm it. Do not stage this as direct in-app Wispr API integration.

### 0:55–1:25 — Normal delivery and acknowledgement

Set Normal mode, send, switch to Receiver, show the readable message and metadata, then acknowledge. Return to Sender and show `Acknowledged`.

### 1:25–2:20 — Disconnected resilience

Set Disconnected mode. Dictate/review/confirm a second message. Show `Pending`, its stable ID and sequence number. Refresh the page and show that it is still pending.

### 2:20–2:45 — Automatic recovery

Change the network to Normal. Show automatic delivery without retyping/resending. On Receiver, acknowledge it. Point out ordered history and no duplicate message.

### 2:45–3:00 — Honest close

State the impact and scope: a simulated reliability layer for sender-confirmed transcripts; no real defence network, radio integration, or field-validation claim.

## Release acceptance checklist

- [ ] Both Sender and Receiver dashboards work from one persistent shared prototype state.
- [ ] Voice-first Wispr Flow composition path is demonstrable.
- [ ] Transcript review/correction occurs before confirmation.
- [ ] Normal, Unstable, and Disconnected modes visibly behave differently.
- [ ] Queue persists across refresh.
- [ ] Reconnection retries automatically.
- [ ] IDs prevent duplicate receiver entries.
- [ ] Sequence ordering and timestamps are visible.
- [ ] Delivery and acknowledgement are distinct states.
- [ ] All scenarios in `docs/TEST_PLAN.md` pass.
- [ ] Screen recording follows the documented flow and contains no unsupported claims.
