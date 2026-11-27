# SANKET

SANKET is a voice-first communication reliability assistant for Indian defence personnel. It captures spoken messages via the browser's built-in speech recognition, lets the sender review and correct the transcript, and delivers it to a receiver over a real WebSocket connection — with guaranteed delivery, acknowledgement tracking, and automatic retry when connectivity is restored.

## What SANKET does

A Sender dictates a message, reviews the transcript, and confirms it. The confirmed message travels over a real Socket.io WebSocket connection to a Node.js server, is persisted in a SQLite database, and is pushed in real time to the Receiver's browser. The Receiver reads and acknowledges it. The Sender sees the acknowledgement. If the connection drops, the message queues locally and retries automatically when connectivity returns — without re-dictating or resending.

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A modern browser with microphone access (Chrome recommended for Web Speech API)

## Setup & Run

```bash
git clone <repo-url>
cd sanket
npm install
npm run dev
```

Open two browser windows on the same machine (or two devices on the same local network):

- Sender: `http://localhost:5173/sender`
- Receiver: `http://localhost:5173/receiver`

The Node.js + Socket.io server starts automatically alongside the Vite dev server.

## Message Lifecycle

```
draft → confirmed → pending → sent → delivered → acknowledged
```

| Status | Meaning |
|---|---|
| `pending` | Confirmed locally; network unavailable or delivery not yet attempted |
| `sent` | Socket.io delivery attempt in progress |
| `delivered` | SQLite on the server has persisted the message; receiver browser notified |
| `acknowledged` | Receiver clicked Acknowledge; timestamp recorded in database |

Statuses never skip steps. `pending` messages survive page refresh via localStorage. `delivered` and `acknowledged` state lives in SQLite.

## Network Modes

| Mode | Behaviour |
|---|---|
| Normal | WebSocket connected; messages deliver immediately |
| Unstable | Delivery attempts may fail and retry; delay exposed in UI |
| Disconnected | No WebSocket attempt; message queued in localStorage; auto-retries on reconnect |

Network detection uses `navigator.onLine` for real events. A manual toggle is also available for demo control.

## Voice Input

- **Primary**: Browser Web Speech API — click "Start Voice Input", speak, transcript appears in composer
- **Alternative**: Wispr Flow — activate on your device, dictate into the focused composer textarea
- Both methods produce a reviewable transcript before confirmation. SANKET does not call a Wispr API directly.

## What is Tested

- Unit tests: message state transitions, ordering, idempotent delivery, duplicate prevention
- Unit tests: localStorage queue rehydration (pending stays pending after reload)
- Unit tests: SQLite message persistence and acknowledgement
- Manual quality gates Q1–Q10 (see `docs/TEST_PLAN.md`)

## Prototype Limits

- Transport is a local WebSocket, not a military radio channel
- SQLite is a local file database, not a defence-grade secure store
- No real military network, radio hardware, or operational identity verification
- Browser speech recognition accuracy varies by accent, language, and environment
- No production security hardening or encryption at rest

## Demo Recording

See `docs/DEMO_AND_ACCEPTANCE.md` for the full three-minute demo script.

Link: _(to be added after recording)_
