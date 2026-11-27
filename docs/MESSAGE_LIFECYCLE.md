# SANKET Message Lifecycle Contract

## Message record

Create this record once when the sender confirms the reviewed transcript. Do not regenerate its ID, sequence, or original timestamp on retries.

```ts
type Message = {
  id: string;                 // globally unique, stable idempotency key
  conversationId: string;
  sequence: number;           // increasing per conversation at confirmation
  senderId: string;
  body: string;               // sender-confirmed transcript
  createdAt: string;          // original ISO timestamp
  status: "pending" | "sent" | "delivered" | "acknowledged";
  attempts: number;
  deliveredAt?: string;
  acknowledgedAt?: string;
  receiverId?: string;
  lastError?: string;
};
```

## Status definitions

| Status | Meaning | Must not mean |
|---|---|---|
| `pending` | Confirmed locally but cannot yet be handed to the simulated receiver. | Delivered or received. |
| `sent` | An attempted simulated hand-off is in progress or was accepted by the transport layer but receiver receipt is not yet proven. | Receiver has seen it. |
| `delivered` | Receiver store has persisted the ID exactly once. | Receiver understood or acted on it. |
| `acknowledged` | Receiver pressed acknowledge for the delivered ID. | Any automatic read receipt. |

`sent` is optional as a brief transitional UI state. It must never replace a pending state when disconnected or an unstable attempt fails.

## State transitions

```text
draft
  -> confirmed
  -> pending                 (Disconnected or failed Unstable attempt)
  -> sent                    (delivery attempt in progress)
  -> delivered               (receiver persistence confirmed)
  -> acknowledged            (receiver action confirmed)

pending -> sent              (automatic retry)
sent -> pending              (failed attempt)
```

No transition may skip receiver persistence to `delivered`, and no transition may skip receiver action to `acknowledged`.

## Delivery rules

1. Sender creates one message record when confirming; retries reuse it.
2. Receiver maintains a received-ID set or equivalent durable lookup.
3. If the receiver gets an existing ID, it returns success without appending another visible message.
4. The sender only moves to `delivered` after that successful receiver response.
5. Retry pending messages automatically after a transition to `Normal`; process ascending `sequence`.
6. Incoming receiver history renders ascending `sequence`, then `createdAt` as a tie-breaker.
7. Acknowledgement is idempotent: repeating it does not create another event or overwrite the first acknowledgement timestamp.

## Persistence

Persist the sender outbox, sender history, receiver inbox, acknowledged state, current network mode, and next sequence number in browser storage. Reloading the page must restore all of them. A reload must never convert pending/sent into delivered.

## Failure behaviour

- Empty transcript: block confirmation and explain why.
- Disconnected: queue immediately with a visible `pending` label.
- Unstable delivery failure: record attempt/error and retain `pending` status.
- Duplicate message ID: do not show a second receiver message.
- Missing receiver acknowledgement: leave status at `delivered`.

## Acceptance scenarios

1. One Normal message becomes delivered once, then acknowledged once.
2. A Disconnected message survives refresh and delivers after reconnection.
3. Multiple queued messages deliver in confirmation sequence after reconnection.
4. A forced duplicate attempt yields one receiver-visible message.
5. An Unstable failure is visibly pending, not delivered.
