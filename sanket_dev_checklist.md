# SANKET — Complete Development Checklist (Revised)

> Real Node.js backend · Real Socket.io WebSocket · Real SQLite database · Real Web Speech API
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
- [ ] Confirm: Web Speech API = real browser mic → text; Wispr Flow = external tool that types into focused textarea
- [ ] Confirm: Socket.io = real WebSocket; NOT a military radio simulation label
- [ ] Confirm: SQLite = real local database; NOT labelled as defence-grade
- [ ] Confirm: localStorage = offline queue for pending messages only
- [ ] Confirm: `delivered` requires a real server SQLite write, never faked

---

## 1 — Project Scaffolding

### 1.1 Init & Config
- [ ] Run `npm create vite@latest . -- --template vanilla-ts` inside `/Users/mrhapile/Documents/Sanket`
- [ ] Verify `package.json`, `vite.config.ts`, `tsconfig.json` are created
- [ ] Set `"strict": true` in `tsconfig.json`
- [ ] Set `"noImplicitAny": true` in `tsconfig.json`
- [ ] Set `"moduleResolution": "bundler"` in `tsconfig.json`
- [ ] Install frontend dependencies: `npm install socket.io-client`
- [ ] Install backend dependencies: `npm install express socket.io better-sqlite3`
- [ ] Install backend type definitions: `npm install -D @types/express @types/better-sqlite3 @types/node`
- [ ] Install dev/test dependencies: `npm install -D vitest @vitest/ui jsdom tsx nodemon`
- [ ] Add scripts to `package.json`:
  - `"dev": "concurrently \"vite\" \"npm run server:dev\""`
  - `"server:dev": "nodemon --watch server --ext ts --exec tsx server/index.ts"`
  - `"server:start": "tsx server/index.ts"`
  - `"test": "vitest run"`
  - `"test:ui": "vitest --ui"`
  - `"test:integration": "vitest run tests/integration"`
  - `"build": "vite build"`
- [ ] Install `concurrently`: `npm install -D concurrently`
- [ ] Configure Vitest in `vite.config.ts`: `environment: 'jsdom'`, `globals: true`
- [ ] Run `npm run dev` and confirm blank page loads; server starts on port 3001

### 1.2 Directory Structure
- [ ] Create `src/types/` directory
- [ ] Create `src/store/` directory
- [ ] Create `src/services/` directory
- [ ] Create `src/ui/` directory
- [ ] Create `src/utils/` directory
- [ ] Create `server/` directory (backend lives here)
- [ ] Create `tests/unit/` directory
- [ ] Create `tests/integration/` directory
- [ ] Create `src/assets/` directory (icons if needed)
- [ ] Delete Vite boilerplate: `src/counter.ts`, `src/typescript.svg`, `public/vite.svg`
- [ ] Clear `src/main.ts` and `src/style.css` (keep files, empty content)
- [ ] Clear `index.html` body (keep root `<div id="app">` only)

### 1.3 HTML Shell (`index.html`)
- [ ] Set `<html lang="en">`
- [ ] Set `<meta charset="UTF-8">`
- [ ] Set `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] Set `<title>SANKET — Voice-First Communication Reliability</title>`
- [ ] Add `<meta name="description" content="SANKET is a voice-first communication reliability assistant for Indian defence personnel.">`
- [ ] Add Google Font (Inter): preconnect + stylesheet link before CSS
- [ ] Link `src/style.css`
- [ ] Add `<div id="app" role="main"></div>`
- [ ] Add `<script type="module" src="/src/main.ts"></script>`
- [ ] Add `<noscript>SANKET requires JavaScript to run.</noscript>`

### 1.4 Vite Proxy Config (`vite.config.ts`)
- [ ] Add server proxy: forward `/api/*` and `/socket.io/*` to `http://localhost:3001`
- [ ] Example:
  ```ts
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true }
    }
  }
  ```
- [ ] Verify proxy works: `GET /api/health` returns `{ status: "ok" }` from browser

### 1.5 `.gitignore`
- [ ] `node_modules/`
- [ ] `dist/`
- [ ] `.DS_Store`
- [ ] `*.local`
- [ ] `sanket.db` (SQLite file — do not commit)
- [ ] `sanket.db-shm`, `sanket.db-wal`

---

## 2 — TypeScript Types (`src/types/index.ts`)

- [ ] Export `NetworkMode`: `"normal" | "unstable" | "disconnected"`
- [ ] Export `MessageStatus`: `"pending" | "sent" | "delivered" | "acknowledged"`
- [ ] Export `Message` interface:
  - `id: string` — UUID v4, stable, never regenerated on retry
  - `conversationId: string`
  - `sequence: number` — per-conversation, assigned at confirmation only
  - `senderId: string`
  - `body: string` — confirmed transcript, immutable after confirm
  - `createdAt: string` — ISO 8601, set once at confirmation
  - `status: MessageStatus`
  - `attempts: number`
  - `deliveredAt?: string`
  - `acknowledgedAt?: string`
  - `receiverId?: string`
  - `lastError?: string`
- [ ] Export `Participant` interface: `{ id: string; name: string; role: "sender" | "receiver" }`
- [ ] Export `Conversation` interface: `{ id: string; participants: Participant[] }`
- [ ] Export `DeliveryResult` interface:
  - `success: boolean`
  - `messageId: string`
  - `deliveredAt?: string`
  - `error?: string`
- [ ] Export `AckPayload` interface: `{ messageId: string; receiverId: string; acknowledgedAt: string }`
- [ ] Export `RoomJoinPayload`: `{ conversationId: string; participantId: string; role: "sender" | "receiver" }`
- [ ] Export `AppState` interface:
  - `version: number`
  - `networkMode: NetworkMode`
  - `offlineQueue: Message[]` — pending messages not yet delivered
  - `senderHistory: Message[]` — all confirmed messages (all statuses) cached locally
  - `nextSequence: number`
  - `conversationId: string`
  - `participants: { sender: Participant; receiver: Participant }`
  - `lastUpdated: string`
- [ ] Export `CURRENT_STATE_VERSION: number = 1`
- [ ] Export `DEFAULT_APP_STATE: AppState` with sane empty defaults
- [ ] Write JSDoc comment on each exported type

---

## 3 — Utility Functions

### 3.1 ID Generation (`src/utils/id.ts`)
- [ ] Export `generateId(): string` — `crypto.randomUUID()`
- [ ] Export `generateConversationId(): string` — same, semantically named

### 3.2 Timestamp (`src/utils/time.ts`)
- [ ] Export `nowISO(): string` — `new Date().toISOString()`
- [ ] Export `formatTimestamp(iso: string): string` — e.g. `27 Nov, 11:45 AM`
- [ ] Export `formatRelativeTime(iso: string): string` — e.g. `2 min ago` (optional polish)

### 3.3 Validation (`src/utils/validation.ts`)
- [ ] Export `isEmptyTranscript(text: string): boolean` — trims, checks length === 0
- [ ] Export `isValidMessage(msg: unknown): msg is Message` — runtime type guard
- [ ] Export `isValidAppState(state: unknown): state is AppState` — checks version + arrays

---

## 4 — Backend: Database (`server/db.ts`)

- [ ] Import `better-sqlite3`
- [ ] Open database: `const db = new Database('sanket.db')`
- [ ] Enable WAL mode: `db.pragma('journal_mode = WAL')`
- [ ] Enable foreign keys: `db.pragma('foreign_keys = ON')`
- [ ] Run `initSchema()` on startup:
  ```sql
  CREATE TABLE IF NOT EXISTS messages (
    id             TEXT PRIMARY KEY,
    conversationId TEXT NOT NULL,
    sequence       INTEGER NOT NULL,
    senderId       TEXT NOT NULL,
    body           TEXT NOT NULL,
    createdAt      TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'delivered',
    attempts       INTEGER NOT NULL DEFAULT 0,
    deliveredAt    TEXT,
    acknowledgedAt TEXT,
    receiverId     TEXT,
    lastError      TEXT
  );

  CREATE TABLE IF NOT EXISTS received_ids (
    messageId  TEXT PRIMARY KEY,
    recordedAt TEXT NOT NULL
  );
  ```
- [ ] Export `insertMessage(message: Message): Message` — INSERT OR IGNORE; return existing row if duplicate
- [ ] Export `getMessage(id: string): Message | undefined`
- [ ] Export `getMessagesByConversation(conversationId: string): Message[]` — ORDER BY sequence ASC
- [ ] Export `acknowledgeMessage(messageId: string, receiverId: string, acknowledgedAt: string): boolean` — UPDATE only if acknowledgedAt IS NULL; return true if updated
- [ ] Export `hasReceivedId(messageId: string): boolean`
- [ ] Export `recordReceivedId(messageId: string): void` — INSERT OR IGNORE into received_ids
- [ ] Export `db` instance for use in handlers

### 4.1 Unit Tests (`tests/unit/db.test.ts`)
- [ ] Test: `insertMessage` inserts correctly
- [ ] Test: `insertMessage` with duplicate ID returns existing row, no second row
- [ ] Test: `getMessage` returns undefined for unknown ID
- [ ] Test: `getMessagesByConversation` returns in sequence order
- [ ] Test: `acknowledgeMessage` sets acknowledgedAt when null
- [ ] Test: `acknowledgeMessage` does NOT overwrite existing acknowledgedAt (idempotent)
- [ ] Test: `hasReceivedId` returns false before record, true after

---

## 5 — Backend: REST API (`server/rest-api.ts`)

- [ ] Export `registerRestRoutes(app: Express): void`
- [ ] `GET /api/health`:
  - Return `{ status: "ok", dbConnected: true, timestamp: nowISO() }`
  - 200 always (if server is up, DB is connected)
- [ ] `GET /api/messages?conversationId=<id>`:
  - Validate `conversationId` query param present; 400 if missing
  - Call `getMessagesByConversation(conversationId)`
  - Return `{ messages: Message[] }` ordered by sequence ASC
- [ ] All routes use `express.json()` middleware
- [ ] All routes handle errors with try/catch; return `{ error: string }` with appropriate status

---

## 6 — Backend: Socket.io Event Handlers (`server/message-handlers.ts`)

- [ ] Export `registerMessageHandlers(io: Server, socket: Socket): void`
- [ ] Handle `room:join` event:
  - Payload: `RoomJoinPayload`
  - Validate `conversationId` and `participantId`
  - `socket.join(conversationId)`
  - Fetch history: `getMessagesByConversation(conversationId)`
  - Emit `room:history` back to this socket only: `socket.emit('room:history', messages)`
  - Log join (server console)
- [ ] Handle `message:send` event:
  - Payload: `Message`
  - Validate required fields; emit `message:error` if invalid
  - Call `insertMessage(message)` — idempotent
  - Set `deliveredAt = nowISO()`, `status = "delivered"`
  - Call `recordReceivedId(message.id)`
  - Emit `message:delivered` to entire room: `io.to(conversationId).emit('message:delivered', deliveredMessage)`
  - If DB error: emit `message:error` back to sender socket: `socket.emit('message:error', { messageId, error })`
- [ ] Handle `message:acknowledge` event:
  - Payload: `AckPayload`
  - Call `acknowledgeMessage(messageId, receiverId, acknowledgedAt)` — idempotent
  - Emit `message:acknowledged` to entire room: `io.to(conversationId).emit('message:acknowledged', { messageId, acknowledgedAt, receiverId })`
- [ ] All handlers wrapped in try/catch; errors emitted to sender socket

### 6.1 Unit Tests (`tests/unit/message-handlers.test.ts`)
- [ ] Test: `message:send` → inserts into DB → emits `message:delivered` to room
- [ ] Test: `message:send` duplicate ID → emits `message:delivered` with existing row → no second DB row
- [ ] Test: `message:acknowledge` → updates DB → emits `message:acknowledged`
- [ ] Test: `message:acknowledge` repeated → second call does not change acknowledgedAt
- [ ] Test: `room:join` → socket joins room → receives history

---

## 7 — Backend: Server Entry (`server/index.ts`)

- [ ] Import Express, `http.createServer`, Socket.io `Server`
- [ ] Create Express app + HTTP server + Socket.io instance
- [ ] Configure CORS: allow `http://localhost:5173`
- [ ] Register `express.json()` middleware
- [ ] Register REST routes from `rest-api.ts`
- [ ] On Socket.io `connection`: call `registerMessageHandlers(io, socket)`
- [ ] Log connection/disconnection events to console
- [ ] Start server on `PORT = process.env.PORT || 3001`
- [ ] Log: `Server running on http://localhost:3001`
- [ ] Call `initSchema()` before server starts (synchronous)

---

## 8 — Frontend: localStorage Store (`src/store/storage.ts`)

- [ ] Storage key constant: `const STORAGE_KEY = "sanket_v1"`
- [ ] Export `loadState(): AppState` — parse, validate via `isValidAppState`, return `DEFAULT_APP_STATE` on failure
- [ ] Export `saveState(state: AppState): void` — sets `lastUpdated = nowISO()`, serialises, writes
- [ ] Export `clearState(): void` — removes key from localStorage
- [ ] Export `migrateState(raw: unknown): AppState` — version migration scaffold (v1 is no-op)
- [ ] Handle `JSON.parse` errors with try/catch; return default
- [ ] Handle quota exceeded in `saveState` with try/catch; log warning
- [ ] On version mismatch: return `DEFAULT_APP_STATE`
- [ ] Guard all localStorage calls for private-browsing with try/catch

### 8.1 Unit Tests (`tests/unit/storage.test.ts`)
- [ ] Test: `loadState()` returns default when storage empty
- [ ] Test: `saveState()` → `loadState()` round-trips correctly
- [ ] Test: `loadState()` with malformed JSON returns default
- [ ] Test: `loadState()` with wrong version returns default
- [ ] Test: a `pending` message survives save/load cycle with same ID, sequence, createdAt
- [ ] Test: `clearState()` → next `loadState()` returns default

---

## 9 — Frontend: Network Store (`src/store/network-store.ts`)

- [ ] Export `getNetworkMode(state: AppState): NetworkMode`
- [ ] Export `setNetworkMode(state: AppState, mode: NetworkMode): AppState` — immutable update
- [ ] Export `isConnected(mode: NetworkMode): boolean` — true only for `"normal"`
- [ ] Export `wasReconnect(prev: NetworkMode, next: NetworkMode): boolean` — true when going from unstable/disconnected → normal
- [ ] Export `NetworkModeLabels: Record<NetworkMode, string>` — UI-friendly labels
- [ ] Export `NetworkModeDescriptions: Record<NetworkMode, string>` — tooltip/legend descriptions

---

## 10 — Frontend: Message Service (`src/services/message-service.ts`)

- [ ] Export `confirmMessage(state: AppState, body: string): { state: AppState; message: Message } | { error: string }`:
  - Validate non-empty body (trimmed); return `{ error }` if empty
  - Generate stable `id: generateId()`
  - Assign `sequence: state.nextSequence`; increment `nextSequence` in state
  - Set `createdAt: nowISO()`; `status: "pending"`; `attempts: 0`
  - Push to `state.offlineQueue` and `state.senderHistory`
  - Return `{ state, message }`
- [ ] Export `markSent(state: AppState, messageId: string): AppState`:
  - Find in queue and history; set `status: "sent"`, increment `attempts`
- [ ] Export `markDelivered(state: AppState, messageId: string, deliveredAt: string): AppState`:
  - Find in queue and history; set `status: "delivered"`, `deliveredAt`
  - Remove from `offlineQueue`
- [ ] Export `markPending(state: AppState, messageId: string, error?: string): AppState`:
  - Find in queue and history; set `status: "pending"`, `lastError` if provided
  - Ensure message stays in `offlineQueue`
- [ ] Export `markAcknowledgedOnSender(state: AppState, messageId: string, acknowledgedAt: string, receiverId: string): AppState`:
  - Find in history; set `status: "acknowledged"`, `acknowledgedAt`, `receiverId`
- [ ] Export `getPendingMessages(state: AppState): Message[]` — from offlineQueue, status `"pending"`, sorted by sequence ASC
- [ ] **NEVER** regenerate `id`, `sequence`, or `createdAt` on retry

### 10.1 Unit Tests (`tests/unit/message-service.test.ts`)
- [ ] Test: `confirmMessage` valid body → creates message with correct all fields
- [ ] Test: `confirmMessage` empty string → returns error, state unchanged
- [ ] Test: `confirmMessage` whitespace-only → returns error
- [ ] Test: `confirmMessage` increments `nextSequence`
- [ ] Test: Two confirms → sequences N and N+1
- [ ] Test: `markSent` → status `"sent"`, attempts incremented
- [ ] Test: `markPending` after `markSent` → back to `"pending"`, error recorded
- [ ] Test: `markDelivered` → removes from offlineQueue, sets deliveredAt
- [ ] Test: Full retry cycle: `markSent → markPending → markSent → markDelivered`
- [ ] Test: Retry reuses same `id`, `createdAt`, `sequence`

---

## 11 — Frontend: Socket.io Client (`src/services/socket-client.ts`)

- [ ] Import `io` from `socket.io-client`
- [ ] Export `createSocketClient(conversationId: string, participantId: string, role: "sender" | "receiver")`
- [ ] Connect to `window.location.origin` (proxied to backend)
- [ ] On `connect`: emit `room:join` with `{ conversationId, participantId, role }`
- [ ] On `connect`: call registered `onConnect` callbacks
- [ ] On `disconnect`: call registered `onDisconnect` callbacks
- [ ] On `message:delivered`: call registered `onDelivered(message: Message)` callbacks
- [ ] On `message:acknowledged`: call registered `onAcknowledged(payload: AckPayload)` callbacks
- [ ] On `message:error`: call registered `onError(payload: { messageId, error })` callbacks
- [ ] On `room:history`: call registered `onHistory(messages: Message[])` callbacks
- [ ] Export `emitSend(message: Message): void`
- [ ] Export `emitAcknowledge(payload: AckPayload): void`
- [ ] Export `disconnect(): void`
- [ ] Export `isConnected(): boolean` — `socket.connected`
- [ ] Guard all emits: only emit if `socket.connected`

---

## 12 — Frontend: Speech Service (`src/services/speech-service.ts`)

- [ ] Check for `window.SpeechRecognition || window.webkitSpeechRecognition` on init
- [ ] Export `isSpeechSupported(): boolean`
- [ ] Export `createSpeechService()`:
  - Set `recognition.continuous = false`
  - Set `recognition.interimResults = true`
  - Set `recognition.lang = 'en-IN'` (Indian English default)
  - Support language toggle: `'hi-IN'` for Hindi, `'en-IN'` for English
- [ ] Export `start(onInterim: (text: string) => void, onFinal: (text: string) => void, onError: (error: string) => void): void`
  - On `onresult`: distinguish interim vs final results; call appropriate callback
  - On `onerror`: map error codes to user-friendly messages; call `onError`
  - On `onend`: call `onFinal` with last result if not already fired
- [ ] Export `stop(): void` — `recognition.stop()`
- [ ] Export `abort(): void` — `recognition.abort()` (discard current)
- [ ] Handle `not-allowed` error: surface clear message "Microphone permission denied"
- [ ] Handle `no-speech` error: surface "No speech detected — try again"
- [ ] Handle `network` error: surface "Speech recognition requires internet — use Wispr Flow instead"
- [ ] Never throw; always use `onError` callback

---

## 13 — Frontend: App Controller (`src/services/app-controller.ts`)

> Central coordinator: wires all services, handles UI events, manages state.

- [ ] Export `AppController` class with:
  - `state: AppState` — in-memory reference
  - `socket: ReturnType<typeof createSocketClient>`
  - `speech: ReturnType<typeof createSpeechService>`

- [ ] `init()`:
  - Load state from localStorage
  - Create Socket.io client; register all event handlers
  - Create speech service
  - Set up `navigator.onLine` listeners (`online` / `offline` events)
  - Set up Socket.io `connect`/`disconnect` listeners
  - Fetch message history from `GET /api/messages`
  - Merge server history into `senderHistory` and receiver inbox
  - Render initial shell and both dashboards
  - If `offlineQueue` has pending messages and connected: trigger `retryPendingMessages()`

- [ ] `handleComposerConfirm(body: string)`:
  - Call `confirmMessage`; on error show UI error, return
  - Save state to localStorage
  - If connected and networkMode === "normal": call `attemptDelivery(message)`
  - If disconnected: show pending badge, save state

- [ ] `attemptDelivery(message: Message)`:
  - Call `markSent` → save state → re-render
  - Emit `message:send` via socket
  - Timeout after 10 s: call `markPending` with timeout error → save → re-render

- [ ] `handleSocketDelivered(deliveredMessage: Message)`:
  - Call `markDelivered` with `deliveredMessage.deliveredAt`
  - Save state
  - Re-render sender dashboard
  - If current user is receiver: render message in inbox

- [ ] `handleSocketAcknowledged(payload: AckPayload)`:
  - Call `markAcknowledgedOnSender`
  - Save state
  - Re-render sender dashboard and receiver inbox

- [ ] `handleSocketError(payload: { messageId: string; error: string })`:
  - Call `markPending` with error
  - Save state
  - Re-render; show error on message card

- [ ] `handleNetworkModeChange(newMode: NetworkMode)`:
  - Detect reconnect (`wasReconnect`)
  - Update state, save
  - Re-render header
  - If reconnect: call `retryPendingMessages()`

- [ ] `retryPendingMessages()`:
  - Get `getPendingMessages()` sorted by sequence ASC
  - For each: await `attemptDelivery(message)` sequentially (not parallel)
  - Save state after each
  - Re-render after each (live progress visible)

- [ ] `handleAcknowledge(messageId: string)`:
  - Emit `message:acknowledge` via socket
  - Optimistically update receiver inbox UI
  - On `message:acknowledged` server event: update state, save, re-render

- [ ] `handleVoiceStart()`:
  - Check `isSpeechSupported()`: if not, show Wispr Flow fallback instruction
  - Call `speech.start(onInterim, onFinal, onError)`
  - `onInterim`: update composer text live
  - `onFinal`: set final transcript in composer, update start button to "stopped" state

- [ ] `handleVoiceStop()`:
  - Call `speech.stop()`

- [ ] `handleResetDemo()`:
  - Confirm: "This will clear all local data and disconnect. Continue?"
  - On confirm: `clearState()` → reload page
  - On cancel: do nothing

- [ ] `handlePageVisibilityChange()`:
  - On hidden: no action needed
  - On visible: check socket connection; reconnect if needed

---

## 14 — Frontend: Design System (`src/style.css`)

### 14.1 CSS Custom Properties (`:root`)
- [ ] `--color-bg`: `#0a0e1a`
- [ ] `--color-surface`: `#111827`
- [ ] `--color-surface-elevated`: `#1e2535`
- [ ] `--color-border`: `rgba(255,255,255,0.08)`
- [ ] `--color-accent`: `#3b82f6`
- [ ] `--color-accent-hover`: `#2563eb`
- [ ] `--color-success`: `#10b981`
- [ ] `--color-warning`: `#f59e0b`
- [ ] `--color-danger`: `#ef4444`
- [ ] `--color-text-primary`: `#f1f5f9`
- [ ] `--color-text-secondary`: `rgba(241,245,249,0.6)`
- [ ] `--color-text-muted`: `rgba(241,245,249,0.35)`
- [ ] `--font-family`: `'Inter', system-ui, sans-serif`
- [ ] `--font-size-xs` through `--font-size-3xl` (6 sizes)
- [ ] `--radius-sm` through `--radius-xl` (4 sizes)
- [ ] `--spacing-xs` through `--spacing-2xl` (6 sizes)
- [ ] `--shadow-card`: `0 4px 24px rgba(0,0,0,0.4)`
- [ ] `--shadow-glow-blue`: `0 0 20px rgba(59,130,246,0.25)`
- [ ] `--transition-fast`: `150ms ease`
- [ ] `--transition-base`: `250ms ease`
- [ ] `--transition-slow`: `400ms ease`

### 14.2 Reset & Base
- [ ] CSS reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }`
- [ ] `body`: font-family, background, color, `min-height: 100vh`
- [ ] `:focus-visible`: `2px solid var(--color-accent)`, `outline-offset: 3px` — NEVER `outline: none`
- [ ] `html { scroll-behavior: smooth }`

### 14.3 Layout Utilities
- [ ] `.container`: `max-width: 1200px`, `margin: 0 auto`, `padding: 0 var(--spacing-md)`
- [ ] `.flex`, `.flex-col`, `.gap-sm`, `.gap-md`, `.gap-lg`
- [ ] `.grid-two-col`: two columns on desktop, stacks on `max-width: 768px`

### 14.4 Component Styles
- [ ] `.card`: surface bg, border, radius lg, shadow, transition
- [ ] `.card:hover`: subtle border brightness lift
- [ ] `.btn`: base reset, padding, min 44×44 px, cursor, transition
- [ ] `.btn-primary`: accent bg, white text, hover, active scale
- [ ] `.btn-secondary`: transparent, border, hover surface-elevated
- [ ] `.btn-danger`: danger bg variant
- [ ] `.btn:disabled`: opacity 0.5, cursor not-allowed
- [ ] `.btn-voice`: special mic button — large, round or pill shape, accent with mic icon state
- [ ] `.btn-voice.listening`: pulsing ring animation while recording
- [ ] `.badge`: pill, `font-size: xs`, uppercase, letter-spacing
- [ ] `.badge-pending`: amber — text + colour
- [ ] `.badge-sent`: blue — text + colour
- [ ] `.badge-delivered`: green — text + colour
- [ ] `.badge-acknowledged`: teal — text + colour
- [ ] `.badge-disconnected`: danger — text + colour
- [ ] ⚠️ Each badge: colour + text label ALWAYS — never colour alone
- [ ] `.textarea`: full-width, min-height 120px, border, radius, bg surface-elevated, focus ring
- [ ] `.status-dot`: 8px circle, inline-block; colours match badges
- [ ] `.prototype-banner`: always-visible strip, muted text, `font-size: xs`
- [ ] `.connection-status`: dynamic label showing Socket.io state
- [ ] `.voice-instruction-panel`: distinct bg, border-left accent, padding — houses Wispr Flow / Web Speech instructions

### 14.5 Animations
- [ ] `@keyframes fadeIn`: opacity 0 → 1
- [ ] `@keyframes slideUp`: translateY(12px) opacity 0 → translateY(0) opacity 1
- [ ] `@keyframes pulse`: scale pulse for pending badge
- [ ] `@keyframes micRipple`: expanding ring for voice listening state
- [ ] Apply `fadeIn` to new message cards
- [ ] `@media (prefers-reduced-motion: reduce)` — disable all animations

---

## 15 — Frontend: Shell UI (`src/ui/shell.ts`)

- [ ] Render `<header>` with:
  - Product name `SANKET` (prominent)
  - Subtitle: `Voice-First Communication Reliability`
  - Prototype disclosure: `Prototype: local WebSocket transport — not a military radio channel` (always visible, never dismissable)
- [ ] Render network mode selector (`<fieldset>` or `role="group"`):
  - Three buttons: `Normal`, `Unstable`, `Disconnected`
  - `aria-pressed` on active button
  - On change: call `controller.handleNetworkModeChange(mode)`
- [ ] Render connection status indicator:
  - `🟢 Connected (Socket.io)` / `🟡 Unstable` / `🔴 Disconnected`
  - Updates on Socket.io `connect`/`disconnect` events AND on manual mode toggle
  - `role="status"` for screen readers
- [ ] Render pending message count badge (shows count; hidden when 0)
- [ ] Render dashboard switcher (`role="tablist"`):
  - `Sender Dashboard` tab (`role="tab"`, `aria-selected`)
  - `Receiver Dashboard` tab
  - Arrow key navigation between tabs
- [ ] Render conversation info: room ID (abbreviated), participant names
- [ ] Render Unstable mode controls (visible only in Unstable mode):
  - `Force Next Failure` toggle button
  - Label: "Demo control — deterministically fail next delivery attempt"
- [ ] Render Reset Demo button (secondary/danger, with confirm gate)
- [ ] Update all status elements reactively when state changes

---

## 16 — Frontend: Sender Dashboard (`src/ui/sender.ts`)

### 16.1 Voice Input Panel
- [ ] Render section: "Voice Input"
- [ ] Render instruction panel (`.voice-instruction-panel`):
  - **Option A — Browser Speech Recognition (Web Speech API)**
  - Steps: "1. Click 'Start Voice Input'. 2. Speak your message. 3. Transcript appears below. 4. Review and correct. 5. Confirm & Send."
  - Label: `Browser Speech Recognition (Web Speech API)`
  - Separator: "— or —"
  - **Option B — Wispr Flow**
  - Steps: "1. Focus the composer below. 2. Activate Wispr Flow on your device. 3. Dictate — text appears in the composer. 4. Confirm & Send."
  - Label: `Wispr Flow dictation`
  - Fine print: "SANKET does not call a Wispr API — Wispr Flow types into the focused textarea."
- [ ] Render language toggle: `English (en-IN)` / `Hindi (hi-IN)` — updates `recognition.lang`
- [ ] Render `Start Voice Input` button (`.btn-voice`) — only shown if `isSpeechSupported()`
- [ ] Button text changes: "Start Voice Input" → "🎙 Listening… (click to stop)" while recording
- [ ] `.btn-voice.listening` pulsing ring animation while active
- [ ] If speech not supported: show note "Browser Speech Recognition not available — use Wispr Flow"

### 16.2 Composer
- [ ] Render `<textarea id="message-composer" aria-label="Message composer — focus here before dictating with Wispr Flow">`
  - Placeholder: "Focus here, then dictate with Wispr Flow — or use the voice button above…"
  - `autofocus`
  - `spellcheck="true"`
- [ ] Live interim transcript updates composer text as Web Speech API fires
- [ ] Render character count (optional polish)
- [ ] Render empty-transcript error: `<div role="alert" aria-live="assertive">` — only on failed confirm

### 16.3 Confirm & Send
- [ ] `<button id="btn-confirm-send" class="btn btn-primary">Confirm & Send</button>`
- [ ] Disabled when composer is empty or voice is actively listening
- [ ] On click: call `controller.handleComposerConfirm(body)`, clear composer on success
- [ ] Show inline success toast: "Message queued" / "Message sent" (auto-dismiss 3 s)

### 16.4 Status Legend
- [ ] Three rows:
  - `SENT` — Accepted locally; Socket.io delivery in progress
  - `DELIVERED` — Server wrote to SQLite; Receiver has been notified
  - `ACKNOWLEDGED` — Receiver confirmed reading; timestamp recorded
- [ ] Colour badge + text on each row

### 16.5 Outbox / Queue
- [ ] Section heading: "Pending Queue"
- [ ] Empty state: "No pending messages — all delivered"
- [ ] Per-message card:
  - ID (truncated, full in `title` attribute)
  - Sequence: `#N`
  - Timestamp (`createdAt`, human-readable)
  - Status badge (`.badge-pending` / `.badge-sent`)
  - Attempt count: `Attempt N of …`
  - Last error (muted red text, only if present)
  - Body preview (first 80 chars + `…`)
- [ ] Cards animate in with `slideUp`
- [ ] Pending badge pulses

### 16.6 Sender History
- [ ] Section heading: "Message History"
- [ ] Empty state: "No confirmed messages yet"
- [ ] Per-message card: all queue fields + `deliveredAt` + `acknowledgedAt` + full status badge
- [ ] Most recent first (reverse sequence)
- [ ] Loaded from server `GET /api/messages` on page load + updated via Socket.io events

---

## 17 — Frontend: Receiver Dashboard (`src/ui/receiver.ts`)

### 17.1 Inbox
- [ ] Section heading: "Incoming Messages"
- [ ] Empty state: "No messages received yet — waiting…"
- [ ] Messages ordered by `sequence` ASC (oldest at top, newest at bottom)
- [ ] Per-message card:
  - Sender name + role
  - `body` (full text, large, readable)
  - Sequence: `#N`
  - Message ID (abbreviated, full on hover)
  - `createdAt` (original send time)
  - `deliveredAt` (server delivery time)
  - Status badge: `DELIVERED` or `ACKNOWLEDGED`
  - `acknowledgedAt` + receiver name (if acknowledged)

### 17.2 New Message Notification
- [ ] On `message:delivered` socket event: animate new card with `fadeIn` + brief highlight ring
- [ ] In-UI banner: `<div role="status" aria-live="polite">` — "New message received — Seq #N from [Sender]"
- [ ] Banner auto-dismisses after 4 s
- [ ] Browser `Notification` API (if permitted):
  - Request permission once on first message; do not re-request if denied
  - Fire only when `document.visibilityState === 'hidden'`
  - Title: "SANKET — New message from [SenderName]"
  - Body: first 60 chars of message body
  - Do not throw if permission denied

### 17.3 Acknowledge Action
- [ ] `<button class="btn btn-primary" aria-label="Acknowledge message #N from [Sender]">Acknowledge</button>`
- [ ] One per delivered + unacknowledged message card
- [ ] On click: call `controller.handleAcknowledge(messageId)`
- [ ] Optimistic UI: replace button with `Acknowledging…` spinner immediately
- [ ] On server `message:acknowledged` event: replace with `Acknowledged ✓` + timestamp
- [ ] Button is not re-rendered after acknowledgement (idempotent)

---

## 18 — Frontend: Main Entry (`src/main.ts`)

- [ ] Import `'./style.css'`
- [ ] Import and instantiate `AppController`
- [ ] Call `controller.init()` inside `DOMContentLoaded` listener
- [ ] Export nothing

---

## 19 — Sample / Demo Data (`src/utils/demo-data.ts`)

- [ ] Export `SAMPLE_MESSAGES: string[]` with 8 messages in Hindi, English, mixed:
  - `"Alpha team, hold position at Sector 7. Reinforcements ETA 20 minutes. Over."`
  - `"Kripya forward operating base ki sthiti confirm karein. Over."`
  - `"All units: weather update — visibility dropping to 200m. Proceed with caution."`
  - `"Sector 4 clear. Moving to extraction point. ETA 15 minutes."`
  - `"Rasad ki zaroorat hai — ammunition aur water. Priority high."`
  - `"Medical evac requested at grid reference 447. One casualty, stable condition."`
  - `"Command, this is Bravo-2. Radio interference on channel 3. Switching to channel 5."`
  - `"Sabhi sainikon ko suchit kiya jaye: 1800 bajey tak base camp par wapas aana hai."`
- [ ] Label file: `// Sample content for demo only. Not real operational data.`
- [ ] Export `getSampleMessage(index: number): string`
- [ ] Add "Load Sample" button in composer section — small, secondary, cycles through samples

---

## 20 — Accessibility Audit

- [ ] All interactive elements reachable via `Tab` in logical order
- [ ] All `<button>` elements have descriptive visible text or `aria-label`
- [ ] All `<textarea>` / `<input>` have associated `<label>` or `aria-label`
- [ ] No `tabindex > 0`
- [ ] `role="tablist"`, `role="tab"`, `role="tabpanel"` on dashboard switcher with arrow key support
- [ ] `aria-live="polite"` on receiver inbox for new message announcements
- [ ] `aria-live="assertive"` on empty-transcript error message
- [ ] `aria-pressed` on network mode buttons
- [ ] `role="status"` on connection status display
- [ ] Focus returns to logical element after any modal dismiss
- [ ] All status colours paired with text — never colour-only
- [ ] Min tap target: 44 × 44 px on all buttons
- [ ] Prototype disclosure text meets contrast ≥ 4.5:1
- [ ] Skip-to-content link (visually hidden, appears on focus)
- [ ] Voice input controls labelled correctly for screen readers
- [ ] `aria-disabled="true"` on disabled Confirm button (not just `disabled` attribute)

---

## 21 — Responsive Layout

- [ ] Mobile (< 480 px): single column, full-width cards, stacked tabs
- [ ] Tablet (480–768 px): single column, more padding
- [ ] Desktop (> 768 px): two-column dashboard (Sender left / Receiver right, or clear tab layout)
- [ ] Network selector wraps gracefully on small screens
- [ ] No horizontal overflow at any breakpoint
- [ ] Landscape mobile: layout still usable
- [ ] Font sizes min 14px on body text
- [ ] Voice input button large enough for field use on mobile

---

## 22 — Integration Tests (`tests/integration/`)

- [ ] `happy-path.test.ts`: confirm → socket emit → server write → push to receiver → acknowledge → sender sees Acknowledged
- [ ] `offline-queue.test.ts`: confirm offline → save to localStorage → reload simulation → reconnect → auto-drain → all delivered in order
- [ ] `duplicate-prevention.test.ts`: emit same message:send twice → one SQLite row → one receiver message
- [ ] `sequence-order.test.ts`: three messages queued offline → reconnect → delivered in sequence 1, 2, 3
- [ ] All integration tests use a test SQLite DB (not `sanket.db`)
- [ ] Integration tests clean up DB after each test

---

## 23 — Manual Quality Gates (`docs/TEST_PLAN.md` Q1–Q10)

Run all in two side-by-side Chrome windows before recording.

- [ ] **Q1**: Speak → correct → confirm → SQLite `body` matches corrected text
- [ ] **Q2**: Send Normal → Receiver gets message real-time → Sender shows `Delivered`
- [ ] **Q3**: Acknowledge → both windows show `Acknowledged` with same `acknowledgedAt`
- [ ] **Q4**: Confirm Disconnected → refresh Sender → still `Pending` → reconnect → auto-delivers
- [ ] **Q5**: Confirm 3 messages Disconnected → refresh → reconnect → all delivered in seq order
- [ ] **Q6**: Force fail in Unstable → `Pending` with attempt count + error visible
- [ ] **Q7**: Duplicate `message:send` emit → one SQLite row → one Receiver card
- [ ] **Q8**: Delivered + not acknowledged → reload both pages → still `Delivered`, never `Acknowledged`
- [ ] **Q9**: 375 px width in DevTools → all controls visible and tappable
- [ ] **Q10**: Tab-only: composer → voice button → confirm → network mode → tab switcher → acknowledge

---

## 24 — Manual Evidence to Capture

- [ ] Screenshot: Sender outbox with `Pending` queue before refresh
- [ ] Screenshot: same messages `Delivered` after reconnect, sequence intact
- [ ] Screenshot: `Acknowledged` on both Sender history and Receiver inbox simultaneously
- [ ] Screenshot: SQLite file open in DB Browser showing delivered rows
- [ ] Screenshot: Chrome DevTools Network tab showing `message:send` → `message:delivered` Socket.io event pair
- [ ] Console check: zero runtime errors, zero unhandled promise rejections during full demo path

---

## 25 — Repository & Submission Prep

### 25.1 Final README Check
- [ ] One-paragraph product description
- [ ] Prerequisites: Node.js ≥ 18, npm, Chrome for Web Speech API
- [ ] `npm install && npm run dev`
- [ ] Two-window instructions: `/sender` and `/receiver`
- [ ] Message lifecycle table
- [ ] Network modes table
- [ ] Voice input section: Web Speech API + Wispr Flow alternative
- [ ] What is tested section
- [ ] Prototype limits section
- [ ] Demo recording link

### 25.2 Demo Recording
- [ ] Clear SQLite DB (Reset Demo) before recording
- [ ] Confirm mic permission granted in Chrome
- [ ] Record at 1920×1080, two windows side by side
- [ ] Follow `docs/DEMO_AND_ACCEPTANCE.md` script exactly (3 minutes)
- [ ] No unsupported claims in narration
- [ ] Prototype disclosure banner visible throughout
- [ ] Export as `.mp4`; upload to YouTube/Drive; add link to README

### 25.3 Final Submission Checks
- [ ] GitHub repo is public
- [ ] `npm install && npm run dev` works from a clean clone
- [ ] `npm test` passes with 0 failures
- [ ] `GET /api/health` returns `{ status: "ok", dbConnected: true }`
- [ ] All items in `docs/SUBMISSION_CHECKLIST.md` checked off
- [ ] All items in `docs/DEMO_AND_ACCEPTANCE.md` release checklist checked off
- [ ] No over-claims in UI text, README, or narration

---

## Progress Summary

| Group | Total Items | Done | Remaining |
|---|---|---|---|
| 0 — Pre-build | 11 | 0 | 11 |
| 1 — Scaffolding | 35 | 0 | 35 |
| 2 — Types | 21 | 0 | 21 |
| 3 — Utils | 10 | 0 | 10 |
| 4 — DB module | 15 | 0 | 15 |
| 5 — REST API | 7 | 0 | 7 |
| 6 — Socket handlers | 15 | 0 | 15 |
| 7 — Server entry | 11 | 0 | 11 |
| 8 — localStorage store | 12 | 0 | 12 |
| 9 — Network store | 6 | 0 | 6 |
| 10 — Message service | 17 | 0 | 17 |
| 11 — Socket.io client | 14 | 0 | 14 |
| 12 — Speech service | 14 | 0 | 14 |
| 13 — App controller | 18 | 0 | 18 |
| 14 — Design system | 50 | 0 | 50 |
| 15 — Shell UI | 14 | 0 | 14 |
| 16 — Sender UI | 25 | 0 | 25 |
| 17 — Receiver UI | 14 | 0 | 14 |
| 18 — Entry point | 3 | 0 | 3 |
| 19 — Demo data | 6 | 0 | 6 |
| 20 — Accessibility | 16 | 0 | 16 |
| 21 — Responsive | 7 | 0 | 7 |
| 22 — Integration tests | 6 | 0 | 6 |
| 23 — Manual Q-gates | 10 | 0 | 10 |
| 24 — Evidence capture | 6 | 0 | 6 |
| 25 — Submission prep | 15 | 0 | 15 |
| **TOTAL** | **378** | **0** | **378** |

---

> ⚠️ **Priority Rule:** Never polish visuals before Groups 4–13 (backend + all services) are tested and passing. The demo proof is reliable workflow, not aesthetics.

> ℹ️ **Stack reminder:** Node.js + Express + Socket.io + SQLite (server) · Vite + TypeScript + Vanilla CSS (frontend) · Web Speech API (voice) · localStorage (offline queue only)

*Last updated: 2026-11-27*
