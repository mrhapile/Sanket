# SANKET Product Specification

## One-line product

SANKET preserves a sender-confirmed transcript when a simulated voice communication channel becomes unreliable, then delivers and records acknowledgement when connectivity returns.

## Prototype boundary

This is a browser-based simulation for a hackathon. It demonstrates the reliability workflow around a communication channel; it does not connect to military radios, defence networks, or live personnel.

## Users

Two simulated remote personnel share one conversation:

- **Sender**: creates, reviews, and confirms messages.
- **Receiver**: reads delivered messages and acknowledges them.

The application supports Hindi, English, and mixed-language text as input and display content. It makes no accuracy guarantee for any language or accent.

## Primary interaction: Wispr Flow

The Sender composer is always focusable. The primary action is **Start voice input**, which gives clear instructions to dictate into the focused composer with Wispr Flow. The typed transcript appears in the composer for review. A visible fallback allows manual editing.

The prototype must not represent browser speech recognition as Wispr Flow. If a browser microphone demo is added, label it separately as a simulation or fallback.

## Screens

### Shared shell

- Product name and prototype disclosure.
- Sender / Receiver dashboard switcher.
- Network simulator: `Normal`, `Unstable`, `Disconnected`.
- Connection status and pending-message count.
- Conversation identifier and simulated participant identities.

### Sender dashboard

- Focused message composer and voice-first instruction.
- Transcript review state with editable content.
- Confirm-and-send button; optional spoken command simulation only if clearly labelled.
- Current queue with message ID, sequence, timestamp, and status.
- History of confirmed messages.
- Explicit status explanation: Sent means accepted locally; Delivered means receiver recorded it; Acknowledged means receiver acted.

### Receiver dashboard

- Incoming conversation ordered by sequence number.
- New-message announcement in the UI; optional browser audio notification if supported.
- Message metadata: sender, original timestamp, sequence number, ID, and status.
- Acknowledge button on delivered, unacknowledged messages.
- Acknowledgement state and timestamp.

## Main flow

1. Sender focuses the composer and dictates with Wispr Flow.
2. Transcript appears in the composer.
3. Sender reviews and, if needed, corrects it by dictation or typing.
4. Sender confirms the text.
5. The app creates immutable message metadata and attempts simulated transport.
6. The app either delivers, delays/retries, or persists the message in a local queue based on network state.
7. On reconnection, pending messages retry automatically.
8. Receiver records a delivered message exactly once, sees an alert, and acknowledges it.
9. Sender sees the acknowledgement.

## Network simulation

| Mode | Required behaviour |
|---|---|
| Normal | Deliver newly confirmed messages immediately. |
| Unstable | Delay delivery and optionally fail an attempt; preserve the message and retry without duplicates. The UI must expose the delay or retry. |
| Disconnected | Persist confirmed messages locally; make no transport attempt that is reported as delivery. |
| Reconnected | Automatically retry all pending messages in sequence order. |

## Out of scope

- Actual radio/audio transport
- Authentication against defence systems
- Encryption or claims of secure deployment
- Automated command execution from an unreviewed transcript
- Real-world accuracy, resilience, or adoption claims
