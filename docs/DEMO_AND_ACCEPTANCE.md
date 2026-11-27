# SANKET Demo and Acceptance Criteria

## Setup before recording

- Start the server: `npm run dev`
- Open two Chrome windows side by side:
  - Left: `http://localhost:5173/sender` (Sender dashboard)
  - Right: `http://localhost:5173/receiver` (Receiver dashboard)
- Confirm both windows show `🟢 Connected` in the status bar
- Clear the SQLite database to start from a clean state: click Reset Demo → Confirm
- Microphone permission: allow when prompted in the Sender window

---

## Three-minute recording plan

### 0:00–0:20 — Problem and setup

Show both dashboards side by side. Point to the prototype disclosure banner. Point to the Socket.io connection status indicator.

**Narrate:** *"In forward field operations, voice communication over radio can be garbled, delayed, or completely lost. The receiver can't verify if a message arrived or if it arrived correctly. SANKET solves that — it captures dictated messages, makes the sender review them before they're sent, and guarantees delivery with acknowledgement even when connectivity drops."*

---

### 0:20–0:55 — Voice-first composition

On the **Sender** window:

1. Click the composer textarea — it glows with a focus ring.
2. Click **"Start Voice Input"**.
3. Speak clearly: *"Alpha team, hold position at sector 7. Reinforcements ETA 20 minutes. Over."*
4. Show the live transcript appearing word by word in the composer.
5. Correct one phrase (e.g., change "sector 7" to "Sector Seven") — type or re-dictate.
6. Point to the corrected transcript in the composer.

**Narrate:** *"The browser's built-in speech recognition writes the transcript live. The sender reviews it — this is the critical review gate. No message leaves unconfirmed."*

---

### 0:55–1:25 — Normal delivery and acknowledgement

On the **Sender** window:

1. Network mode is `Normal` — `🟢 Connected`.
2. Click **"Confirm & Send"**.
3. The outbox card appears: status `SENT` → flips to `DELIVERED` within a second.

Switch to the **Receiver** window:

4. The message appears instantly — sender name, timestamp, sequence `#1`, message ID, body.
5. Click **"Acknowledge"**.
6. Badge updates to `ACKNOWLEDGED ✓` with timestamp.

Switch back to **Sender**:

7. History card shows `ACKNOWLEDGED` with the matching timestamp.

**Narrate:** *"The message crossed a real WebSocket connection to a real Node.js server and was written to a SQLite database. The receiver acknowledged it. Three distinct states — Sent, Delivered, Acknowledged — each requiring a real event, never assumed."*

---

### 1:25–2:20 — Disconnected resilience

On the **Sender** window:

1. Switch network mode to `Disconnected` — status bar turns `🔴 Disconnected`.
2. Click the composer, speak: *"Requesting immediate resupply at grid 447. Water and ammunition. Priority Alpha."*
3. Review and confirm.
4. The outbox card shows `⏳ PENDING` — message ID, sequence `#2`, timestamp are all visible and stable.
5. **Refresh the Sender page** (`Cmd+R`).
6. After reload, the pending card is still there — same ID, same sequence, still `PENDING`.

**Narrate:** *"Connection dropped. The message queued locally. We refreshed the page — it survived. The ID and sequence are unchanged. Nothing was lost, nothing needs to be re-dictated."*

Switch to the **Receiver** window:

7. Show the Receiver — it has only message `#1`. No `#2` yet.

---

### 2:20–2:45 — Automatic recovery and ordered delivery

On the **Sender** window:

1. Switch network mode to `Normal` — status turns `🟢 Connected`.
2. Watch the pending card automatically retry — `PENDING` → `SENT` → `DELIVERED` without any button press.

Switch to the **Receiver** window:

3. Message `#2` appears — immediately below `#1`, in correct sequence order.
4. Acknowledge it.

Switch to **Sender**:

5. Show the full history: `#1 Acknowledged`, `#2 Acknowledged`, ordered correctly.

**Narrate:** *"The moment connectivity returned, SANKET retried automatically. No re-dictation, no resending. And the order is correct — sequence 1, then sequence 2 — even though sequence 2 was delayed."*

---

### 2:45–3:00 — Honest close

**Narrate:** *"SANKET is a working prototype. Real browser speech recognition. Real WebSocket delivery across browser windows. Real SQLite persistence. Real offline queuing. What it doesn't do — and we're clear about this — is connect to a military radio or a defence network. The local WebSocket replaces that channel for demonstration. The reliability workflow itself — the transcript review, the sequencing, the delivery guarantee, the acknowledgement — that's real, tested, and demonstrable right here."*

---

## Release acceptance checklist

- [ ] Both Sender and Receiver dashboards are connected to the same Socket.io room.
- [ ] Browser speech recognition produces a reviewable transcript in the composer.
- [ ] Transcript correction (by typing or re-dictation) is reflected in the confirmed body.
- [ ] Normal, Unstable, and Disconnected modes behave visibly differently.
- [ ] Pending queue survives page refresh via localStorage.
- [ ] Reconnection retries automatically without user action.
- [ ] Duplicate `message:send` emits produce one SQLite row and one Receiver message.
- [ ] Sequence ordering is correct after out-of-order delivery.
- [ ] Delivery and acknowledgement are distinct states with distinct timestamps.
- [ ] All 10 quality gates in `docs/TEST_PLAN.md` pass.
- [ ] Screen recording follows this documented flow and contains no unsupported claims.
- [ ] Prototype disclosure banner is visible throughout the entire recording.
