# SANKET Test Plan

## Quality gates

Run all of these before recording the submission video.

| ID | Scenario | Expected result |
|---|---|---|
| Q1 | Dictate or paste a transcript, edit it, and confirm. | The confirmed text is the exact persisted body. |
| Q2 | Send in Normal mode. | Receiver gets one ordered message; sender becomes Delivered. |
| Q3 | Acknowledge on Receiver. | Both dashboards show Acknowledged with one acknowledgement event. |
| Q4 | Confirm in Disconnected mode, refresh, then reconnect. | Message remains pending after refresh and is delivered automatically after reconnect. |
| Q5 | Confirm several messages while Disconnected, refresh, reconnect. | All are delivered once in sequence order. |
| Q6 | Use the forced failure route in Unstable mode. | Message remains pending and exposes retry/failure information. |
| Q7 | Repeat a delivery attempt for the same ID. | Receiver shows one message only. |
| Q8 | Leave a delivered message unacknowledged. | It remains Delivered, never Acknowledged. |
| Q9 | Inspect mobile and desktop layouts. | Sender/Receiver controls and statuses remain usable. |
| Q10 | Keyboard-tab through sender actions. | Composer, send, mode controls, dashboard switch, and acknowledgement are reachable with visible focus. |

## Automated checks

- Unit-test message-state transitions, ordering, and idempotent receiver persistence.
- Unit-test storage rehydration, especially that pending messages remain pending after reload.
- Add a browser-level happy path for disconnected queue → refresh → reconnect → acknowledge when the project test setup permits it.

## Manual evidence to save

- Screenshot of pending queue before refresh.
- Screenshot of the same message delivered after reconnect.
- Screenshot of acknowledged status on both views.
- Console/browser check showing no runtime errors during the demo path.

## Failure policy

If a required quality gate fails, fix the behaviour or cut the unsupported feature. Do not hide the issue with static UI text or manually altered status data.
