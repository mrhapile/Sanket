# SANKET Product Specification

## One-line product

SANKET delivers a sender-confirmed voice transcript reliably from one device to another over a real WebSocket connection, with guaranteed sequencing, duplicate prevention, offline queuing, and acknowledgement.

## Prototype boundary

This is a browser + local server prototype for a hackathon. It demonstrates a real reliability workflow using real WebSocket transport and a real SQLite database. It does not connect to military radios, defence networks, or live personnel. The local network WebSocket replaces the radio channel for demonstration purposes.

## Users

Two personnel share one conversation room, each on their own browser:

- **Sender**: dictates, reviews, and confirms messages from the Sender dashboard.
- **Receiver**: reads delivered messages in real time and acknowledges them from the Receiver dashboard.

The application supports Hindi, English, and mixed-language text as input and display content. Browser speech recognition accuracy is not guaranteed for any language or accent.

## Primary interaction: Browser Speech Recognition

The Sender composer is always focusable. The primary action is **Start Voice Input**, which activates the browser's built-in Web Speech API, listens to the microphone, and writes the live transcript into the focused composer. The sender reviews and corrects the transcript before confirming.

Wispr Flow is a supported alternative: it types into the focused composer on the user's device. The app does not depend on or call a Wispr API.

Both paths are labelled clearly in the UI. Browser speech recognition is labelled "Browser Speech Recognition (Web Speech API)". Wispr Flow usage is labelled "Wispr Flow dictation".

## Screens

### Shared shell

- Product name and prototype disclosure.
- Sender / Receiver dashboard switcher.
- Network mode indicator: `Normal`, `Unstable`, `Disconnected` (manual toggle for demo; `navigator.onLine` for real events).
- Real-time connection status (Socket.io connection state).
- Pending message count badge.
- Conversation room ID and participant identities.

### Sender dashboard

- Focused message composer with voice input controls.
- Live transcript appears in composer as speech is recognised.
- Transcript review and correction before confirmation.
- Confirm-and-send button.
- Outbox queue: message ID, sequence, timestamp, status, attempt count, last error.
- Message history: all confirmed messages with full status trail.
- Status legend: Sent = accepted locally; Delivered = server + receiver recorded it; Acknowledged = receiver acted.

### Receiver dashboard

- Incoming messages ordered by sequence number, delivered in real time via Socket.io push.
- New-message announcement (UI banner + optional browser Notification API alert).
- Per-message metadata: sender name, original timestamp, sequence number, ID, delivery timestamp, status.
- Acknowledge button on delivered, unacknowledged messages.
- Acknowledgement state and timestamp.

## Main flow

1. Sender focuses the composer and clicks Start Voice Input.
2. Browser speech recognition listens and writes the live transcript into the composer.
3. Sender reviews the transcript and corrects it by voice or typing.
4. Sender confirms the text.
5. App creates an immutable message record (ID, sequence, timestamp) and emits it over Socket.io.
6. Server receives the event, writes the message to SQLite, and emits a delivery event to the Receiver.
7. Receiver browser receives the push event, displays the message, and stores the receipt.
8. Receiver clicks Acknowledge; server updates SQLite; Sender sees Acknowledged.
9. If the network is unavailable at step 5, the message queues in localStorage and retries automatically on reconnect.

## Network behaviour

| Mode | Required behaviour |
|---|---|
| Normal | Socket.io connected; messages deliver immediately after server write. |
| Unstable | Delivery attempts may fail; retried automatically; attempt count and error visible in UI. |
| Disconnected | No Socket.io emit attempted; message queued in localStorage with `pending` status. |
| Reconnected | `navigator.onLine` fires or manual toggle to Normal; pending queue drains in sequence order automatically. |

## Out of scope

- Military radio or audio transport
- Authentication against defence systems
- Encryption or claims of secure deployment
- Automated command execution from an unreviewed transcript
- Real-world accuracy, resilience, or adoption claims
- Multi-room or multi-conversation support (single conversation room for prototype)
