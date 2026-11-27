# SANKET Message Lifecycle Contract

## Message record

Create this record once when the sender confirms the reviewed transcript. Do not regenerate its ID, sequence, or original timestamp on retries or server round-trips.

```ts
type Message = {
  id: string;               // UUID v4 — stable idempotency key, generated once at confirmation
  conversationId: string;   // room identifier shared by Sender and Receiver
  sequence: number;         // per-conversation counter, assigned at confirmation, never changed
  senderId: string;         // participant ID of the sender
  body: string;             // sender-confirmed transcript, immutable after confirmation
  createdAt: string;        // ISO 8601 — set once at confirmation, never on retry
  status: "pending" | "sent" | "delivered" | "acknowledged";
  attempts: number;         // increments on each Socket.io emit attempt
  deliveredAt?: string;     // set by server when SQLite write succeeds
  acknowledgedAt?: string;  // set by server when receiver acknowledges
  receiverId?: string;      // participant ID who acknowledged
  lastError?: string;       // most recent transport error message
};
```

## Status definitions

| Status | Meaning | Must not mean |
|---|---|---|
| `pending` | Confirmed locally; Socket.io not yet attempted or last attempt failed. | Delivered or received by server. |
| `sent` | Socket.io emit fired; waiting for server confirmation event. | Server has written to SQLite. |
| `delivered` | Server has written the message to SQLite exactly once and pushed to Receiver. | Receiver has read or understood it. |
| `acknowledged` | Receiver clicked Acknowledge; server recorded timestamp in SQLite. | Any automatic read receipt. |

`sent` is a brief transitional state only. It must never replace `pending` when disconnected or when a `sent` attempt times out.

## State transitions

```
draft
  → confirmed (sender presses Confirm & Send)
  → pending   (no Socket.io connection available)
  → sent      (Socket.io emit fired)
  → delivered (server ack received — SQLite write confirmed)
  → acknowledged (receiver action confirmed by server)

pending → sent      (automatic retry on reconnect or manual retry)
sent    → pending   (server error, timeout, or connection drop)
```

No transition may skip server SQLite persistence to reach `delivered`.
No transition may skip receiver action to reach `acknowledged`.

## Delivery rules

1. Sender creates one message record at confirmation. Retries reuse the same record — same ID, sequence, createdAt.
2. The server maintains a unique constraint on `message.id` in SQLite. A duplicate insert returns the existing record without creating a second row.
3. The server responds to a duplicate with the same success event as a first delivery. The sender moves to `delivered` only after receiving this server event.
4. The server pushes a delivery event to the Receiver Socket.io room. The Receiver browser renders the message if the ID is not already in its local received set.
5. On reconnect (Socket.io `connect` event or `navigator.onLine` → Normal toggle), the app drains the localStorage queue in ascending `sequence` order, one at a time.
6. Receiver inbox renders in ascending `sequence` order. `createdAt` is the tie-breaker for equal sequence values.
7. Acknowledgement is idempotent: the server updates `acknowledgedAt` only when the current value is null. Repeating the action does not overwrite the first timestamp.

## Persistence layers

| Data | Where stored | Survives page refresh |
|---|---|---|
| Pending (undelivered) messages | localStorage (sender device) | ✅ Yes |
| Delivered + acknowledged messages | SQLite on server | ✅ Yes |
| Receiver inbox | SQLite + Socket.io push on reconnect | ✅ Yes |
| Received ID set (dedup) | SQLite unique constraint | ✅ Yes |
| Next sequence number | localStorage (sender device) | ✅ Yes |
| Network mode selection | localStorage | ✅ Yes |

On page load, the app:
1. Reads pending queue from localStorage.
2. Fetches message history from the server REST endpoint.
3. Never promotes `pending` or `sent` messages to `delivered` without a server confirmation event.

## Failure behaviour

- **Empty transcript**: block confirmation and explain why. No message record is created.
- **Disconnected**: queue immediately in localStorage with `pending` label.
- **Socket.io timeout**: record attempt count and error; retain `pending` status.
- **Server error (5xx)**: retain `pending`; expose error in UI.
- **Duplicate message ID**: server returns success; Receiver shows one message.
- **Missing receiver acknowledgement**: leave status at `delivered` indefinitely.

## Acceptance scenarios

1. One Normal message is delivered to Receiver exactly once and acknowledged once.
2. A Disconnected message survives refresh in localStorage and delivers after reconnection.
3. Multiple queued messages deliver in confirmation sequence order after reconnection.
4. A forced duplicate emit yields one Receiver-visible message in SQLite.
5. An Unstable failure leaves the message visibly `pending` with attempt count, not `delivered`.
