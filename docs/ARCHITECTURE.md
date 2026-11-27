# SANKET Prototype Architecture

## Design goal

Build a fully working local prototype that demonstrates the complete voice-first reliability workflow across two real browser windows, using a real WebSocket server and a real SQLite database.

## System overview

```
Device A — Sender Browser              Device B — Receiver Browser
  Web Speech API (mic)                    Socket.io client
  localStorage (offline queue)            In-memory inbox
  Socket.io client                        Acknowledge action
         │                                       │
         └──────────── Socket.io ────────────────┘
                            │
                    Node.js + Express
                    Socket.io Server
                            │
                         SQLite
                    (better-sqlite3)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | Vite + TypeScript (vanilla, no UI framework) |
| Styling | Vanilla CSS with custom properties |
| Voice input | Browser Web Speech API (primary) + Wispr Flow (alternative) |
| Real-time transport | Socket.io (WebSocket with fallback) |
| Backend server | Node.js + Express |
| Database | SQLite via `better-sqlite3` |
| Offline queue | localStorage (sender device only) |
| Network detection | `navigator.onLine` + Socket.io `connect`/`disconnect` events |

## Frontend modules

| Module | File | Responsibility |
|---|---|---|
| `types` | `src/types/index.ts` | Message, NetworkMode, Participant, AppState, DeliveryResult types |
| `storage` | `src/store/storage.ts` | Read/write localStorage: offline queue, sequence counter, network mode |
| `socket-client` | `src/services/socket-client.ts` | Socket.io client wrapper: connect, emit, subscribe to events |
| `speech-service` | `src/services/speech-service.ts` | Web Speech API wrapper: start/stop recognition, interim + final results |
| `message-service` | `src/services/message-service.ts` | Confirm messages, assign metadata, manage state transitions |
| `network-store` | `src/store/network-store.ts` | Track network mode; detect reconnect; trigger queue drain |
| `app-controller` | `src/services/app-controller.ts` | Wire all services; handle UI events; orchestrate retry |
| `shell-ui` | `src/ui/shell.ts` | Header, tabs, network selector, connection status badge |
| `sender-ui` | `src/ui/sender.ts` | Composer, voice controls, queue, history, status legend |
| `receiver-ui` | `src/ui/receiver.ts` | Inbox, new-message alert, acknowledge button |

## Backend modules

| Module | File | Responsibility |
|---|---|---|
| `server` | `server/index.ts` | Express app + Socket.io server bootstrap |
| `db` | `server/db.ts` | SQLite connection, schema init, prepared statements |
| `message-handlers` | `server/message-handlers.ts` | Socket.io event handlers for send, deliver, acknowledge |
| `rest-api` | `server/rest-api.ts` | GET `/api/messages` — history fetch on page load |

## SQLite schema

```sql
CREATE TABLE IF NOT EXISTS messages (
  id            TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  sequence      INTEGER NOT NULL,
  senderId      TEXT NOT NULL,
  body          TEXT NOT NULL,
  createdAt     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'delivered',
  attempts      INTEGER NOT NULL DEFAULT 0,
  deliveredAt   TEXT,
  acknowledgedAt TEXT,
  receiverId    TEXT,
  lastError     TEXT
);

CREATE TABLE IF NOT EXISTS received_ids (
  messageId TEXT PRIMARY KEY,
  recordedAt TEXT NOT NULL
);
```

## Socket.io events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `message:send` | `Message` | Sender emits a confirmed message |
| `message:acknowledge` | `{ messageId, receiverId, acknowledgedAt }` | Receiver acknowledges a delivered message |
| `room:join` | `{ conversationId, participantId, role }` | Client joins a conversation room |

### Server → Client

| Event | Payload | Sent to |
|---|---|---|
| `message:delivered` | `Message` (with deliveredAt) | Sender (confirmation) + Receiver (new message push) |
| `message:acknowledged` | `{ messageId, acknowledgedAt, receiverId }` | Sender (status update) |
| `message:error` | `{ messageId, error }` | Sender (delivery failure) |
| `room:history` | `Message[]` | Rejoining client (page reload) |

## Offline queue flow

```
Sender confirms message
  ↓
navigator.onLine === false OR Socket.io disconnected
  ↓
Save to localStorage queue with status: "pending"
  ↓
navigator.onLine fires "online" OR Socket.io fires "connect"
  ↓
app-controller reads queue, sorts by sequence ASC
  ↓
Emit message:send for each, one at a time, await server ack
  ↓
On success: remove from localStorage queue, update UI
  ↓
On failure: retain in queue, increment attempts, show error
```

## REST API

```
GET /api/messages?conversationId=<id>
  → Returns all messages for the conversation from SQLite
  → Used on page load to restore history
  → Ordered by sequence ASC

GET /api/health
  → Returns { status: "ok", dbConnected: true }
```

## Persistence split

| Data | Storage |
|---|---|
| Pending (undelivered) messages | localStorage — sender device |
| Delivered + acknowledged messages | SQLite — server |
| Receiver inbox | Rebuilt from SQLite on page load + live Socket.io pushes |
| Next sequence number | localStorage — sender device |
| Network mode selection | localStorage — both devices |

## Voice input boundary

The browser Web Speech API is a real browser capability. SANKET calls `window.SpeechRecognition` directly. The result is interim text shown live in the composer, followed by a final transcript on silence. This is labelled "Browser Speech Recognition" in the UI.

Wispr Flow types into the focused `<textarea>` from outside the browser. SANKET supports this by ensuring the composer is always focusable and accessible. The app does not call a Wispr API.

## Prototype disclosure

Show a persistent banner: `Prototype: local WebSocket transport — not a military radio channel`. This must be visible at all times and cannot be dismissed.

## Accessibility and field suitability

- Large tap targets (≥ 44 × 44 px) on all interactive elements.
- Status labels always use text + colour, never colour alone.
- Keyboard-navigable: Tab through all actions; arrow keys for tab/group controls.
- Visible focus rings on all focusable elements (never `outline: none`).
- `aria-live` regions for new messages and delivery status changes.
- High contrast dark theme; minimum 4.5:1 contrast ratio on all text.
