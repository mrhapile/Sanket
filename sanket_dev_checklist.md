# SANKET — Exhaustive Development Checklist

> Track every task from blank repo to submission-ready prototype.
> Items are ordered by dependency. Never skip to a later group until the current group passes its gate.

---

## 0 — Pre-build (Before any code)

- [ ] Re-read `docs/PRODUCT_SPEC.md` fully
- [ ] Re-read `docs/MESSAGE_LIFECYCLE.md` fully
- [ ] Re-read `docs/ARCHITECTURE.md` fully
- [ ] Re-read `docs/BUILD_PLAN.md` fully
- [ ] Re-read `docs/TEST_PLAN.md` fully
- [ ] Re-read `AGENTS.md` rules fully
- [ ] Confirm you understand Wispr Flow boundary (types into focused input; no direct API claim)
- [ ] Confirm you understand status semantics (`sent` ≠ `delivered`; `delivered` ≠ `acknowledged`)
- [ ] Confirm you understand persistence rule (pending never becomes delivered on reload)

---

## 1 — Project Scaffolding

### 1.1 Init & Config
- [ ] Run `npm create vite@latest . -- --template vanilla-ts` inside `/Users/mrhapile/Documents/Sanket`
- [ ] Verify `package.json`, `vite.config.ts`, `tsconfig.json` are created
- [ ] Set `"strict": true` in `tsconfig.json`
- [ ] Add `"noImplicitAny": true` to `tsconfig.json`
- [ ] Add `"moduleResolution": "bundler"` to `tsconfig.json`
- [ ] Install dev dependencies: `npm install -D vitest @vitest/ui jsdom`
- [ ] Add `"test": "vitest"` and `"test:ui": "vitest --ui"` scripts to `package.json`
- [ ] Configure Vitest in `vite.config.ts`: `environment: 'jsdom'`, `globals: true`
- [ ] Add `"coverage": "vitest run --coverage"` script
- [ ] Run `npm run dev` and confirm blank page loads without errors

### 1.2 Directory Structure
- [ ] Create `src/types/` directory
- [ ] Create `src/store/` directory
- [ ] Create `src/services/` directory
- [ ] Create `src/ui/` directory
- [ ] Create `src/utils/` directory
- [ ] Create `tests/unit/` directory
- [ ] Create `tests/e2e/` directory (placeholder)
- [ ] Create `src/assets/` directory (fonts, icons if needed)
- [ ] Delete Vite boilerplate: `src/counter.ts`, `src/typescript.svg`, `public/vite.svg`
- [ ] Clear `src/main.ts` and `src/style.css` (keep files, empty content)
- [ ] Clear `index.html` body except root `<div id="app">`

### 1.3 HTML Shell (`index.html`)
- [ ] Set `<html lang="en">`
- [ ] Set `<meta charset="UTF-8">`
- [ ] Set `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] Set `<title>SANKET — Voice-First Communication Reliability</title>`
- [ ] Add `<meta name="description" content="SANKET is a voice-first communication reliability assistant for Indian defence personnel. Prototype: simulated transport and local data.">`
- [ ] Link Google Font (Inter): add `<link>` preconnect + stylesheet before CSS
- [ ] Link `src/style.css` stylesheet
- [ ] Add `<div id="app" role="main"></div>`
- [ ] Add `<script type="module" src="/src/main.ts"></script>`
- [ ] Add `<noscript>` fallback message

---

## 2 — Type Definitions (`src/types/index.ts`)

- [ ] Export `NetworkMode` type: `"normal" | "unstable" | "disconnected"`
- [ ] Export `MessageStatus` type: `"pending" | "sent" | "delivered" | "acknowledged"`
- [ ] Export `Message` interface:
  - `id: string` — stable UUID, never regenerated on retry
  - `conversationId: string`
  - `sequence: number` — per-conversation counter, assigned at confirmation
  - `senderId: string`
  - `body: string` — confirmed transcript, immutable after confirm
  - `createdAt: string` — ISO 8601, set once at confirmation
  - `status: MessageStatus`
  - `attempts: number` — increments on each delivery attempt
  - `deliveredAt?: string`
  - `acknowledgedAt?: string`
  - `receiverId?: string`
  - `lastError?: string`
- [ ] Export `Participant` interface: `{ id: string; name: string; role: "sender" | "receiver" }`
- [ ] Export `Conversation` interface: `{ id: string; participants: Participant[] }`
- [ ] Export `DeliveryResult` interface:
  - `success: boolean`
  - `messageId: string`
  - `error?: string`
  - `simulatedDelayMs?: number`
- [ ] Export `AppState` interface (versioned):
  - `version: number` — bump on schema changes
  - `networkMode: NetworkMode`
  - `outbox: Message[]` — sender's pending/in-flight messages
  - `senderHistory: Message[]` — all confirmed messages (all statuses)
  - `receiverInbox: Message[]` — receiver-visible delivered messages
  - `receivedIds: string[]` — durable dedup set
  - `nextSequence: number` — per-conversation counter
  - `conversationId: string`
  - `participants: { sender: Participant; receiver: Participant }`
  - `lastUpdated: string`
- [ ] Export `CURRENT_STATE_VERSION: number = 1`
- [ ] Export `DEFAULT_APP_STATE: AppState` with sane empty defaults
- [ ] Write JSDoc comment on each exported type explaining its purpose

---

## 3 — Utility Functions (`src/utils/`)

### 3.1 ID Generation (`src/utils/id.ts`)
- [ ] Export `generateId(): string` — returns a UUID v4 (use `crypto.randomUUID()`)
- [ ] Export `generateConversationId(): string` — same but semantically named

### 3.2 Timestamp (`src/utils/time.ts`)
- [ ] Export `nowISO(): string` — returns `new Date().toISOString()`
- [ ] Export `formatTimestamp(iso: string): string` — human-readable (e.g. `27 Nov, 11:45 AM`)
- [ ] Export `formatRelativeTime(iso: string): string` — e.g. `2 min ago` (optional, polish)

### 3.3 Validation (`src/utils/validation.ts`)
- [ ] Export `isEmptyTranscript(text: string): boolean` — trims and checks length === 0
- [ ] Export `isValidMessage(msg: unknown): msg is Message` — runtime type guard
- [ ] Export `isValidAppState(state: unknown): state is AppState` — runtime type guard (checks version, arrays exist, etc.)

---

## 4 — Storage Module (`src/store/storage.ts`)

- [ ] Define storage key constant: `const STORAGE_KEY = "sanket_v1"`
- [ ] Export `loadState(): AppState` — reads key, parses JSON, validates via `isValidAppState`, returns `DEFAULT_APP_STATE` on failure/missing
- [ ] Export `saveState(state: AppState): void` — sets `state.lastUpdated = nowISO()`, serialises and writes to `localStorage`
- [ ] Export `clearState(): void` — removes key from `localStorage` (used by reset-demo)
- [ ] Handle `JSON.parse` errors with try/catch; log a warning, return default
- [ ] Handle quota exceeded errors in `saveState` with try/catch; surface a visible warning
- [ ] On version mismatch: log warning, return `DEFAULT_APP_STATE` (do not silently corrupt)
- [ ] Export `migrateState(raw: unknown): AppState` — applies version migrations (even if v1 is a no-op, scaffold it now)

### 4.1 Unit Tests (`tests/unit/storage.test.ts`)
- [ ] Test: `loadState()` returns default when storage is empty
- [ ] Test: `saveState()` then `loadState()` round-trips correctly
- [ ] Test: `loadState()` with malformed JSON returns default (not throw)
- [ ] Test: `loadState()` with wrong version returns default
- [ ] Test: a `pending` message remains `pending` after save/load cycle
- [ ] Test: `clearState()` causes next `loadState()` to return default

---

## 5 — Network Store (`src/store/network-store.ts`)

- [ ] Export `getNetworkMode(state: AppState): NetworkMode`
- [ ] Export `setNetworkMode(state: AppState, mode: NetworkMode): AppState` — returns updated state (immutable update pattern)
- [ ] Export `isConnected(mode: NetworkMode): boolean` — true only for `"normal"`
- [ ] Export `wasReconnect(prev: NetworkMode, next: NetworkMode): boolean` — true when prev was `"unstable"` or `"disconnected"` and next is `"normal"`
- [ ] Export `NetworkModeLabels: Record<NetworkMode, string>` — human-readable labels for UI

---

## 6 — Receiver Store (`src/store/receiver-store.ts`)

- [ ] Export `hasReceivedId(state: AppState, messageId: string): boolean` — checks `state.receivedIds`
- [ ] Export `recordDelivery(state: AppState, message: Message): AppState`:
  - If ID already in `receivedIds` → return state unchanged (idempotent)
  - Add ID to `receivedIds`
  - Add message (with `status: "delivered"`, `deliveredAt: nowISO()`) to `receiverInbox`
  - Return updated state
- [ ] Export `acknowledgeMessage(state: AppState, messageId: string): AppState`:
  - Find message in `receiverInbox` by ID
  - If not found or already `"acknowledged"` → return state unchanged (idempotent)
  - Set `status: "acknowledged"`, `acknowledgedAt: nowISO()`
  - Return updated state
- [ ] Export `getOrderedInbox(state: AppState): Message[]` — sorts by `sequence` asc, then `createdAt` asc
- [ ] Export `getUnacknowledgedMessages(state: AppState): Message[]`

### 6.1 Unit Tests (`tests/unit/receiver-store.test.ts`)
- [ ] Test: `recordDelivery` adds message to inbox
- [ ] Test: `recordDelivery` with duplicate ID → inbox length unchanged, no second entry
- [ ] Test: `recordDelivery` sets `deliveredAt` timestamp
- [ ] Test: `acknowledgeMessage` sets status to `"acknowledged"` and sets `acknowledgedAt`
- [ ] Test: `acknowledgeMessage` called twice → `acknowledgedAt` is the same timestamp (not overwritten)
- [ ] Test: `getOrderedInbox` returns messages sorted by sequence (regardless of insertion order)
- [ ] Test: `getOrderedInbox` uses `createdAt` as tie-breaker for same sequence (edge case)

---

## 7 — Message Service (`src/services/message-service.ts`)

- [ ] Export `confirmMessage(state: AppState, body: string): { state: AppState; message: Message } | { error: string }`:
  - Validate `body` is non-empty (trimmed); return error if empty
  - Generate stable `id: generateId()`
  - Set `sequence: state.nextSequence` and increment `nextSequence`
  - Set `createdAt: nowISO()`
  - Set `status: "pending"`
  - Set `attempts: 0`
  - Push to `state.senderHistory` and `state.outbox`
  - Return updated state + new message
- [ ] Export `markSent(state: AppState, messageId: string): AppState`:
  - Find message in outbox and history
  - Set `status: "sent"`, increment `attempts`
  - Return updated state
- [ ] Export `markDelivered(state: AppState, messageId: string): AppState`:
  - Find in outbox and history
  - Set `status: "delivered"`, `deliveredAt: nowISO()`
  - Remove from outbox
  - Return updated state
- [ ] Export `markPending(state: AppState, messageId: string, error?: string): AppState`:
  - Find in outbox and history
  - Set `status: "pending"`, set `lastError` if error provided
  - Return updated state (stays in outbox)
- [ ] Export `markAcknowledgedOnSender(state: AppState, messageId: string, acknowledgedAt: string): AppState`:
  - Find in history
  - Set `status: "acknowledged"`, `acknowledgedAt`
  - Return updated state
- [ ] Export `getPendingMessages(state: AppState): Message[]` — from outbox, status is `"pending"`
- [ ] Export `getOutbox(state: AppState): Message[]` — all outbox messages
- [ ] **NEVER** regenerate `id`, `sequence`, or `createdAt` on a retry

### 7.1 Unit Tests (`tests/unit/message-service.test.ts`)
- [ ] Test: `confirmMessage` with valid body creates message with correct fields
- [ ] Test: `confirmMessage` with empty string returns error, state unchanged
- [ ] Test: `confirmMessage` with whitespace-only returns error, state unchanged
- [ ] Test: `confirmMessage` increments `nextSequence` in state
- [ ] Test: Two confirms in sequence have `sequence` 1, 2 (or N, N+1)
- [ ] Test: `markSent` changes status to `"sent"`, increments attempts
- [ ] Test: `markPending` after `markSent` → status back to `"pending"`, error recorded
- [ ] Test: `markDelivered` removes message from outbox, sets `deliveredAt`
- [ ] Test: `markSent → markPending → markSent → markDelivered` — full retry cycle
- [ ] Test: Retry reuses same `id`, `createdAt`, `sequence` (not new values)

---

## 8 — Transport Simulator (`src/services/transport-simulator.ts`)

- [ ] Export `TransportConfig` interface:
  - `unstableFailRate: number` — 0.0–1.0 (default: 0 for deterministic demo; use a toggle)
  - `unstableDelayMs: number` — simulated delay (default: 2000)
  - `forceFailNext: boolean` — toggle for demo-safe forced failure
- [ ] Export `DEFAULT_TRANSPORT_CONFIG: TransportConfig`
- [ ] Export `deliver(message: Message, mode: NetworkMode, state: AppState, config?: TransportConfig): Promise<DeliveryResult>`:
  - **Normal:** call `recordDelivery` immediately, return `{ success: true, messageId }`
  - **Disconnected:** return `{ success: false, error: "Disconnected: message queued locally" }` without touching receiver store
  - **Unstable:** apply `config.unstableDelayMs` delay; if `forceFailNext` or `Math.random() < failRate` → return failure; else call `recordDelivery`, return success
- [ ] Export `setForceFailNext(config: TransportConfig, value: boolean): TransportConfig`
- [ ] The simulator must accept a callback/setter so the message service can update state after receiver write
- [ ] Add a `simulate_` JSDoc prefix on all exported symbols or a file-level comment: `// All delivery here is simulated. No real network is contacted.`

### 8.1 Unit Tests (`tests/unit/transport-simulator.test.ts`)
- [ ] Test: Normal mode → resolves with `success: true`
- [ ] Test: Normal mode → `receivedIds` contains message ID after delivery
- [ ] Test: Disconnected mode → resolves with `success: false`, `receivedIds` empty
- [ ] Test: Unstable with `forceFailNext: true` → resolves with `success: false`
- [ ] Test: Unstable with `forceFailNext: false` and `failRate: 0` → resolves with `success: true`
- [ ] Test: Duplicate call with same ID in Normal mode → `success: true` but inbox entry count stays at 1

---

## 9 — App State Controller (`src/services/app-controller.ts`)

> Central coordinator: wires message-service, transport-simulator, receiver-store, storage, and UI events.

- [ ] Export `AppController` class (or module with init/event functions):
  - `state: AppState` — in-memory reference
  - `transportConfig: TransportConfig`
- [ ] `init()`:
  - Load state from storage
  - Set up network mode change listener
  - Render initial UI
- [ ] `handleComposerConfirm(body: string)`:
  - Call `confirmMessage`; on error show UI error
  - Save state
  - Attempt delivery via transport
  - Update state based on result
  - Save state
  - Re-render sender dashboard
- [ ] `handleNetworkModeChange(newMode: NetworkMode)`:
  - Detect reconnect (`wasReconnect`)
  - Update state, save
  - If reconnect: call `retryPendingMessages()`
  - Re-render header + dashboards
- [ ] `retryPendingMessages()`:
  - Get pending messages sorted by `sequence` asc
  - Attempt delivery for each in order (sequential, not parallel)
  - Update state after each attempt
  - Save state after each attempt
  - Re-render after each attempt (live progress)
- [ ] `handleAcknowledge(messageId: string)`:
  - Call `acknowledgeMessage` on receiver store
  - Sync acknowledgement back to sender history via `markAcknowledgedOnSender`
  - Save state
  - Re-render both dashboards
- [ ] `handleResetDemo()`:
  - Show confirm dialog: "This will clear all simulated local data. Continue?"
  - On confirm: `clearState()`, reload page
  - On cancel: do nothing
- [ ] `handleToggleForceFailNext()`:
  - Toggle `transportConfig.forceFailNext`
  - Re-render unstable controls

---

## 10 — Design System (`src/style.css`)

### 10.1 CSS Custom Properties (`:root`)
- [ ] `--color-bg`: deep dark navy `#0a0e1a`
- [ ] `--color-surface`: `#111827`
- [ ] `--color-surface-elevated`: `#1e2535`
- [ ] `--color-border`: `rgba(255,255,255,0.08)`
- [ ] `--color-accent`: `#3b82f6` (vivid blue)
- [ ] `--color-accent-hover`: `#2563eb`
- [ ] `--color-success`: `#10b981` (green — delivered/acknowledged)
- [ ] `--color-warning`: `#f59e0b` (amber — pending/unstable)
- [ ] `--color-danger`: `#ef4444` (red — failed/disconnected)
- [ ] `--color-text-primary`: `#f1f5f9`
- [ ] `--color-text-secondary`: `rgba(241,245,249,0.6)`
- [ ] `--color-text-muted`: `rgba(241,245,249,0.35)`
- [ ] `--font-family`: `'Inter', system-ui, sans-serif`
- [ ] `--font-size-xs`: `0.75rem`
- [ ] `--font-size-sm`: `0.875rem`
- [ ] `--font-size-base`: `1rem`
- [ ] `--font-size-lg`: `1.125rem`
- [ ] `--font-size-xl`: `1.25rem`
- [ ] `--font-size-2xl`: `1.5rem`
- [ ] `--font-size-3xl`: `1.875rem`
- [ ] `--radius-sm`: `6px`
- [ ] `--radius-md`: `10px`
- [ ] `--radius-lg`: `16px`
- [ ] `--radius-xl`: `24px`
- [ ] `--spacing-xs`: `4px`
- [ ] `--spacing-sm`: `8px`
- [ ] `--spacing-md`: `16px`
- [ ] `--spacing-lg`: `24px`
- [ ] `--spacing-xl`: `32px`
- [ ] `--spacing-2xl`: `48px`
- [ ] `--shadow-card`: `0 4px 24px rgba(0,0,0,0.4)`
- [ ] `--shadow-glow-blue`: `0 0 20px rgba(59,130,246,0.25)`
- [ ] `--transition-fast`: `150ms ease`
- [ ] `--transition-base`: `250ms ease`
- [ ] `--transition-slow`: `400ms ease`

### 10.2 Reset & Base
- [ ] CSS reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
- [ ] `body`: `font-family`, `background-color: var(--color-bg)`, `color: var(--color-text-primary)`, `min-height: 100vh`
- [ ] `a`: inherit colour, no underline by default
- [ ] `:focus-visible` outline: `2px solid var(--color-accent)`, `outline-offset: 3px` — NEVER `outline: none`
- [ ] Smooth scroll: `html { scroll-behavior: smooth }`

### 10.3 Layout Utilities
- [ ] `.container`: `max-width: 1200px`, `margin: 0 auto`, `padding: 0 var(--spacing-md)`
- [ ] `.flex`: `display: flex`
- [ ] `.flex-col`: `display: flex; flex-direction: column`
- [ ] `.gap-sm`, `.gap-md`, `.gap-lg` using `var(--spacing-*)`
- [ ] `.grid-two-col`: `display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg)`
  - Media query: stack to 1 col on `max-width: 768px`

### 10.4 Component Styles
- [ ] `.card`: background `var(--color-surface)`, border `var(--color-border)`, radius `var(--radius-lg)`, padding `var(--spacing-lg)`, shadow `var(--shadow-card)`, `transition: var(--transition-base)`
- [ ] `.card:hover`: subtle border brightness lift
- [ ] `.btn`: base button reset + padding + radius + font + transition + cursor + min height 44px + min width 44px
- [ ] `.btn-primary`: accent background, white text, hover darkens, active scales slightly
- [ ] `.btn-secondary`: transparent, border `var(--color-border)`, hover surface-elevated
- [ ] `.btn-danger`: danger background variant
- [ ] `.btn:disabled`: opacity 0.5, cursor not-allowed
- [ ] `.badge`: pill shape, `font-size: var(--font-size-xs)`, `padding: 2px 8px`, uppercase, `letter-spacing: 0.05em`
- [ ] `.badge-pending`: amber background + text
- [ ] `.badge-sent`: blue background + text
- [ ] `.badge-delivered`: green background + text
- [ ] `.badge-acknowledged`: deeper green/teal + text
- [ ] `.badge-disconnected`: danger background + text
- [ ] ⚠️ Each badge must have both a colour AND a text label — never colour alone
- [ ] `.textarea`: full-width, min-height 120px, padding, border, radius, background surface-elevated, text-primary, resize vertical, focus ring
- [ ] `.input`: single-line variant of textarea
- [ ] `.status-dot`: 8px circle, inline-block, margin-right; colours matched to badge colours
- [ ] `.divider`: `border-top: 1px solid var(--color-border)`, margin vertical
- [ ] `.prototype-banner`: small top bar or footer strip, muted text, `font-size: var(--font-size-xs)`, clearly visible

### 10.5 Animations
- [ ] `@keyframes fadeIn`: opacity 0 → 1
- [ ] `@keyframes slideUp`: translateY(12px) opacity 0 → translateY(0) opacity 1
- [ ] `@keyframes pulse`: subtle scale pulse for pending badge
- [ ] `@keyframes shimmer`: loading skeleton shimmer (optional, polish)
- [ ] Apply `animation: fadeIn var(--transition-base)` to new message cards
- [ ] Respect `@media (prefers-reduced-motion: reduce)` — disable animations

---

## 11 — Header & Shell UI (`src/ui/shell.ts`)

- [ ] Render `<header>` with:
  - Product name `SANKET` (styled prominently)
  - Tagline or subtitle (small, muted)
  - Prototype disclosure: `Prototype: simulated transport and local data` (always visible, cannot be dismissed)
- [ ] Render network simulator control:
  - `<fieldset>` or `<div role="group">` labelled "Network Condition"
  - Three `<button>` or `<radio>` options: `Normal`, `Unstable`, `Disconnected`
  - Active mode visually highlighted
  - Aria: `aria-pressed` or `aria-checked` for active state
  - Each button has `id` for keyboard access
- [ ] Render connection status indicator:
  - Coloured dot + text: "Connected (Normal)" / "Unstable" / "Disconnected"
  - Updates live when mode changes
- [ ] Render pending-message count badge (shows 0 when empty, hidden or greyed)
- [ ] Render dashboard switcher:
  - Two tabs/buttons: "Sender Dashboard" and "Receiver Dashboard"
  - Aria: `role="tab"`, `aria-selected`, `role="tabpanel"` for content
  - Keyboard: left/right arrow key navigation between tabs
- [ ] Render conversation info: conversation ID (abbreviated), simulated participant names
- [ ] Render Reset Demo button (secondary/danger, with confirmation gate)
- [ ] Render Unstable controls (visible only in Unstable mode):
  - "Force Next Failure" toggle button
  - Label explaining it is for demo control only

---

## 12 — Sender Dashboard UI (`src/ui/sender.ts`)

### 12.1 Composer Section
- [ ] Render section heading: "Compose Message"
- [ ] Render Wispr Flow instruction panel (always visible above composer):
  - Headline: "Voice Input (Wispr Flow)"
  - Instructions: "1. Click the composer below to focus it. 2. Activate Wispr Flow on your device. 3. Dictate your message — it will appear in the box. 4. Review and correct the transcript. 5. Press Confirm to send."
  - Disclaimer: "Wispr Flow types into the focused composer. SANKET does not call a Wispr API directly."
  - Style: distinct panel (slightly different background, border, icon)
- [ ] Render `<textarea id="message-composer" aria-label="Message composer — focus here before dictating">` 
  - Placeholder: "Focus here, then dictate with Wispr Flow…"
  - `autofocus` attribute
  - `spellcheck="true"`
  - `lang="hi en"` (mixed language hint)
- [ ] Render character count / word count (optional, polish)
- [ ] Render empty-transcript error: `<div role="alert" aria-live="assertive">` — only visible when user attempts confirm on empty

### 12.2 Confirm & Send
- [ ] Render "Confirm & Send" `<button id="btn-confirm-send">` (`.btn-primary`, large)
- [ ] Button is disabled when composer is empty
- [ ] On click: validate, call `handleComposerConfirm`, clear composer on success
- [ ] Show inline success/failure feedback after action (auto-dismisses after 3 s)

### 12.3 Status Explanation
- [ ] Render legend panel with three rows:
  - `Sent` → Accepted locally; transport attempt in progress
  - `Delivered` → Receiver has recorded the message
  - `Acknowledged` → Receiver has confirmed reading
- [ ] Each row: coloured badge + text explanation (never colour alone)

### 12.4 Outbox / Queue
- [ ] Render section heading: "Pending Queue"
- [ ] Empty state: "No pending messages" (muted text)
- [ ] Per-message card:
  - Message ID (truncated, full ID in `title` attribute for hover)
  - Sequence number: `#N`
  - Timestamp (`createdAt`, human-readable)
  - Status badge (`.badge-pending` / `.badge-sent`)
  - Attempt count: `Attempt N`
  - Last error (if any): muted red text
  - Body preview (first 80 chars, truncated with `…`)
- [ ] Cards animate in with `slideUp`
- [ ] Pending badge pulses subtly with CSS animation

### 12.5 Sender History
- [ ] Render section heading: "Message History"
- [ ] Empty state: "No confirmed messages yet"
- [ ] Per-message card (same fields as queue + delivered/acknowledged state):
  - `deliveredAt` timestamp if delivered
  - `acknowledgedAt` timestamp if acknowledged
  - Full status badge
- [ ] Most recent first (reverse `sequence` order for history display)
- [ ] History survives page refresh (loaded from storage)

---

## 13 — Receiver Dashboard UI (`src/ui/receiver.ts`)

### 13.1 Inbox
- [ ] Render section heading: "Incoming Messages"
- [ ] Empty state: "No messages received yet"
- [ ] Messages ordered by `sequence` ascending (oldest delivered first at top, newest at bottom)
- [ ] Per-message card:
  - Sender identity (name + role)
  - `body` — full message text (readable, large enough for field use)
  - Sequence: `#N`
  - Message ID (abbreviated, full on hover)
  - `createdAt` timestamp (original send time)
  - `deliveredAt` timestamp
  - Status badge: `Delivered` or `Acknowledged`
  - `acknowledgedAt` timestamp (if acknowledged)

### 13.2 New Message Notification
- [ ] When a new message arrives: flash/animate the inbox card (`.fadeIn`, brief highlight)
- [ ] Show an in-UI announcement banner: "New message received — Seq #N" using `role="status"` and `aria-live="polite"`
- [ ] Attempt browser `Notification` API (if permitted):
  - Request permission only once
  - Only fire if document is hidden
  - Label notification: "SANKET — New message from [SenderName]"
  - Do not throw if permission denied

### 13.3 Acknowledge Action
- [ ] Render "Acknowledge" `<button id="btn-ack-{messageId}">` on each `delivered` unacknowledged card
- [ ] Button disappears (or becomes "Acknowledged ✓") after action
- [ ] Acknowledgement is reflected immediately (optimistic UI + state save)
- [ ] Idempotent: pressing again does nothing (button already gone)
- [ ] `aria-label="Acknowledge message #N from [Sender]"`

---

## 14 — Accessibility (applies across all UI)

- [ ] All interactive elements reachable via `Tab` in logical order
- [ ] All `<button>` elements have descriptive `aria-label` or visible text
- [ ] All `<input>` / `<textarea>` elements have associated `<label>` or `aria-label`
- [ ] No `tabindex` greater than 0
- [ ] `role="tablist"`, `role="tab"`, `role="tabpanel"` on dashboard switcher with arrow key support
- [ ] `aria-live="polite"` on inbox for new message announcements
- [ ] `aria-live="assertive"` on empty-transcript error
- [ ] `aria-pressed` on network mode buttons when active
- [ ] `role="status"` on connection status display
- [ ] Focus returns to a logical element after modal/dialog dismiss
- [ ] All status colours paired with text — no colour-only information
- [ ] Min tap target: 44 × 44 px on all buttons
- [ ] Prototype disclosure text meets contrast ratio ≥ 4.5:1 against background
- [ ] Skip-to-content `<a href="#app">` link (visually hidden, appears on focus)

---

## 15 — Responsive Layout

- [ ] Mobile (< 480 px): single column, full-width cards, stacked tabs
- [ ] Tablet (480–768 px): single column, slightly more padding
- [ ] Desktop (> 768 px): two-column dashboard (Sender left / Receiver right, or tab-based)
- [ ] Network selector wraps gracefully on small screens
- [ ] No horizontal overflow at any breakpoint
- [ ] Test: rotate to landscape on mobile — layout still usable
- [ ] Font sizes remain readable on small screens (min 14px body)

---

## 16 — Sample / Demo Data (`src/utils/demo-data.ts`)

- [ ] Export `SAMPLE_MESSAGES: string[]` — 5–8 realistic messages in Hindi, English, and mixed:
  - `"Alpha team, hold position at sector 7. Reinforcements ETA 20 minutes."`
  - `"Kripya forward operating base ki sthiti confirm karein. Over."`
  - `"All units: weather update — visibility dropping to 200m. Proceed with caution."`
  - `"Sector 4 clear. Moving to extraction point. ETA 15 mins."`
  - `"Rasad ki zaroorat hai — ammunition aur water. Priority high."`
  - `"Medical evac requested at grid reference 447. One casualty, stable."`
  - etc.
- [ ] Label these clearly: `// Sample content for demo only. Not real operational data.`
- [ ] Export `loadSampleMessage(index: number): string` — returns sample at given index
- [ ] Add a "Load Sample" button in composer section (small, secondary) for demo convenience

---

## 17 — Main Entry Point (`src/main.ts`)

- [ ] Import `AppController` and call `init()`
- [ ] Import `src/style.css`
- [ ] Add `DOMContentLoaded` guard if needed
- [ ] Export nothing (this is the app entry)

---

## 18 — End-to-End Test (Manual, `tests/e2e/manual-checklist.md`)

Write a step-by-step manual test script covering all 10 quality gates:

- [ ] **Q1 — Transcript confirm:** Paste text → edit → confirm → verify localStorage body matches edited text
- [ ] **Q2 — Normal delivery:** Send in Normal → Receiver shows 1 message → sender badge shows Delivered
- [ ] **Q3 — Acknowledge:** Receiver clicks Acknowledge → both dashboards show Acknowledged + same timestamp
- [ ] **Q4 — Disconnected + refresh:** Set Disconnected → confirm → verify Pending badge → refresh → still Pending → set Normal → auto-delivers → Delivered
- [ ] **Q5 — Multi-message queue:** Confirm 3 messages Disconnected → refresh → set Normal → all 3 delivered in sequence 1,2,3 (not 3,1,2 or any other order)
- [ ] **Q6 — Unstable forced failure:** Set Unstable → toggle Force Next Failure → confirm → Pending + error info visible
- [ ] **Q7 — Duplicate prevention:** Manually trigger same message ID twice → receiver shows 1 card only
- [ ] **Q8 — No auto-ack:** Deliver a message → do not click acknowledge → reload → still Delivered not Acknowledged
- [ ] **Q9 — Responsive:** Chrome DevTools device toolbar → 375 px → all controls visible and tappable
- [ ] **Q10 — Keyboard-only:** Tab from start → reach composer → type text → Tab to Confirm → Enter → Tab to network controls → Tab to dashboard switch → Tab to Acknowledge → all visible focus rings

---

## 19 — Performance & Code Quality

- [ ] No `console.error` or uncaught exceptions during full demo flow
- [ ] No `any` types (TypeScript strict)
- [ ] No inline styles in HTML (all styles in CSS)
- [ ] State mutations only through the defined service functions (no direct property mutation)
- [ ] `saveState` called after every state change (no silent in-memory-only updates)
- [ ] All `async` paths have error handling
- [ ] `localStorage` calls guarded for private-browsing environments (try/catch)
- [ ] No `setTimeout` used for status transitions (only for simulated delays in transport, clearly labelled)
- [ ] Run `npm run test` and confirm 0 failures before moving to M5

---

## 20 — Repository & Submission Prep

### 20.1 `.gitignore`
- [ ] `node_modules/`
- [ ] `dist/`
- [ ] `.DS_Store`
- [ ] `*.local`

### 20.2 `README.md` (rewrite root)
- [ ] One-paragraph description of SANKET
- [ ] Prerequisites: Node.js ≥ 18, npm
- [ ] Setup: `git clone … && npm install && npm run dev`
- [ ] Open `http://localhost:5173`
- [ ] Section: "Simulated Message Lifecycle" — summarise states
- [ ] Section: "Network Modes" — Normal / Unstable / Disconnected table
- [ ] Section: "Wispr Flow Usage" — how to dictate, that it types into focused composer
- [ ] Section: "What is Tested" — list unit test files and manual Q-gates
- [ ] Section: "Prototype Limits" — no real radio, no defence integration, no offline Wispr, no production security
- [ ] Section: "Demo Recording" — link or path once available

### 20.3 Demo Recording
- [ ] Confirm full demo flow works end-to-end without errors
- [ ] Record exactly 3 minutes following `docs/DEMO_AND_ACCEPTANCE.md` script
- [ ] No unsupported claims in audio narration
- [ ] Prototype disclosure banner visible throughout
- [ ] Export as `.mp4` or upload to YouTube/Drive for submission link

### 20.4 Final Submission Checks
- [ ] GitHub repo is public
- [ ] `npm install && npm run dev` works from a clean clone
- [ ] All 10 quality gates pass (re-run after final code changes)
- [ ] All acceptance criteria in `docs/DEMO_AND_ACCEPTANCE.md` checked off
- [ ] All items in `docs/SUBMISSION_CHECKLIST.md` checked off
- [ ] Honesty checks: no over-claims anywhere in UI text, README, or narration

---

## Progress Summary

| Group | Total Items | Done | Remaining |
|---|---|---|---|
| 0 — Pre-build | 9 | 0 | 9 |
| 1 — Scaffolding | 28 | 0 | 28 |
| 2 — Types | 20 | 0 | 20 |
| 3 — Utils | 10 | 0 | 10 |
| 4 — Storage | 12 | 0 | 12 |
| 5 — Network Store | 6 | 0 | 6 |
| 6 — Receiver Store | 13 | 0 | 13 |
| 7 — Message Service | 15 | 0 | 15 |
| 8 — Transport Sim | 11 | 0 | 11 |
| 9 — App Controller | 10 | 0 | 10 |
| 10 — Design System | 55 | 0 | 55 |
| 11 — Shell UI | 16 | 0 | 16 |
| 12 — Sender UI | 22 | 0 | 22 |
| 13 — Receiver UI | 14 | 0 | 14 |
| 14 — Accessibility | 17 | 0 | 17 |
| 15 — Responsive | 7 | 0 | 7 |
| 16 — Demo Data | 6 | 0 | 6 |
| 17 — Entry Point | 3 | 0 | 3 |
| 18 — E2E Tests | 10 | 0 | 10 |
| 19 — Code Quality | 10 | 0 | 10 |
| 20 — Submission | 18 | 0 | 18 |
| **TOTAL** | **332** | **0** | **332** |

---

> ⚠️ **Priority Rule:** Never polish visuals before the message engine (Group 7) and transport simulation (Group 8) are fully tested and passing. The demo proof is reliable workflow, not aesthetics.

*Last updated: 2026-11-27*
