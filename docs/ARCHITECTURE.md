# SANKET Prototype Architecture

## Design goal

Keep the build local, inspectable, and deterministic enough to demo the complete reliability workflow in a browser.

## Components

```text
Sender dashboard
  -> message service
  -> simulated transport (Normal / Unstable / Disconnected)
  -> receiver inbox store
  -> Receiver dashboard

All persistent state -> browser local storage
```

## Required modules

| Module | Responsibility |
|---|---|
| `types` | Message, network mode, participant, and event types. |
| `storage` | Read/write/version browser-persisted prototype state. |
| `message-service` | Confirm messages, assign metadata, retry, transition states. |
| `transport-simulator` | Deterministically deliver, delay/fail, or queue based on mode. |
| `receiver-store` | Idempotent receiver persistence and acknowledgement. |
| `network-store` | Shared selected network mode and reconnection trigger. |
| `sender-ui` | Composer, review, send, queue, and history. |
| `receiver-ui` | Ordered inbox, notification, and acknowledgement. |

## Storage model

Use one versioned application-state key. It should contain:

- selected network mode
- outbox and sender-visible message history
- receiver inbox
- received message IDs
- next per-conversation sequence number
- notification/acknowledgement metadata

On load, validate and safely default malformed or missing data. Use a clearly named reset-demo control only if it confirms the action and explains that it clears local simulated data.

## Transport contract

```ts
deliver(message: Message, mode: NetworkMode): Promise<DeliveryResult>
```

- Normal resolves immediately with receiver persistence.
- Unstable uses a deterministic or visibly controlled delay/failure path; randomness alone is not acceptable for a recorded demo.
- Disconnected never calls receiver persistence.
- Changing from Unstable/Disconnected to Normal triggers queued retry through the message service, not UI-only status editing.

## Wispr Flow boundary

Wispr Flow runs as a user-facing dictation tool that types into focused inputs. SANKET must support that workflow with a focused accessible composer and unambiguous on-screen guidance. The app does not depend on an undocumented Wispr API.

## Accessibility and field suitability

- Large tap targets and high-contrast status colours paired with text labels.
- Status must never rely on colour alone.
- Keyboard operation and visible focus states.
- Avoid visual clutter and unnecessary navigation.

## Prototype disclosure

Show a restrained but visible label: `Prototype: simulated transport and local data`. This protects the demo from implying real operational integration.
