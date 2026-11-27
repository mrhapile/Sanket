import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Prototype disclosure — always visible, never dismissable -->
    <div class="prototype-banner" role="note" aria-label="Prototype disclosure">
      ⚠️ Prototype: local WebSocket transport — not a military radio channel
    </div>

    <header class="app-header" role="banner">
      <div class="container header-inner">
        <div class="brand">
          <span class="brand-name">SANKET</span>
          <span class="brand-subtitle">Voice-First Communication Reliability</span>
        </div>

        <div class="flex items-center gap-md flex-wrap">
          <!-- Connection status -->
          <div
            id="connection-status"
            class="connection-status"
            role="status"
            aria-live="polite"
            aria-label="Socket.io connection status"
          >
            <span class="status-dot disconnected" id="status-dot"></span>
            <span id="status-text">Connecting…</span>
          </div>

          <!-- Pending message count -->
          <span
            id="pending-count"
            class="pending-count"
            aria-label="Pending messages"
            aria-live="polite"
          ></span>
        </div>
      </div>

      <div class="container" style="margin-top: var(--spacing-sm);">
        <!-- Network mode selector -->
        <div class="flex items-center gap-md flex-wrap" style="margin-bottom: var(--spacing-sm);">
          <div
            class="network-selector"
            role="group"
            aria-label="Network mode"
            id="network-selector"
          >
            <span class="network-selector-label">Network:</span>
            <button
              class="btn-network mode-normal"
              data-mode="normal"
              aria-pressed="true"
              id="btn-mode-normal"
            >🟢 Normal</button>
            <button
              class="btn-network mode-unstable"
              data-mode="unstable"
              aria-pressed="false"
              id="btn-mode-unstable"
            >🟡 Unstable</button>
            <button
              class="btn-network mode-disconnected"
              data-mode="disconnected"
              aria-pressed="false"
              id="btn-mode-disconnected"
            >🔴 Disconnected</button>
          </div>

          <!-- Conversation info -->
          <div class="conversation-info" aria-label="Conversation details">
            Room: <span class="room-id" id="room-id">room-alpha</span>
          </div>
        </div>

        <!-- Unstable mode controls (hidden by default) -->
        <div class="unstable-controls" id="unstable-controls" aria-label="Unstable mode demo controls">
          <span>🧪 Demo control:</span>
          <button class="btn btn-secondary" id="btn-force-fail" aria-pressed="false">
            Force Next Failure: OFF
          </button>
          <span class="text-muted text-sm">— deterministically fail next delivery attempt</span>
        </div>
      </div>

      <div class="container" style="margin-top: var(--spacing-sm); padding-bottom: var(--spacing-sm);">
        <!-- Dashboard tab switcher -->
        <div class="flex items-center gap-md flex-wrap">
          <div
            class="tab-switcher"
            role="tablist"
            aria-label="Dashboard"
            id="tab-switcher"
          >
            <button
              class="tab-btn"
              role="tab"
              aria-selected="true"
              aria-controls="panel-sender"
              id="tab-sender"
              data-panel="sender"
            >📤 Sender Dashboard</button>
            <button
              class="tab-btn"
              role="tab"
              aria-selected="false"
              aria-controls="panel-receiver"
              id="tab-receiver"
              data-panel="receiver"
            >📥 Receiver Dashboard</button>
          </div>

          <button class="btn btn-danger" id="btn-reset" style="margin-left: auto;">
            🗑 Reset Demo
          </button>
        </div>
      </div>
    </header>

    <main id="main-content" class="container" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-2xl);">
      <!-- Sender Panel -->
      <div
        id="panel-sender"
        class="dashboard-panel active"
        role="tabpanel"
        aria-labelledby="tab-sender"
      >
        <div class="empty-state">
          <div class="empty-state-icon">📤</div>
          <p>Sender dashboard loading…</p>
          <p class="text-sm text-muted" style="margin-top: var(--spacing-xs);">
            Types, storage, and services coming next.
          </p>
        </div>
      </div>

      <!-- Receiver Panel -->
      <div
        id="panel-receiver"
        class="dashboard-panel"
        role="tabpanel"
        aria-labelledby="tab-receiver"
      >
        <div class="empty-state">
          <div class="empty-state-icon">📥</div>
          <p>Receiver dashboard loading…</p>
          <p class="text-sm text-muted" style="margin-top: var(--spacing-xs);">
            Types, storage, and services coming next.
          </p>
        </div>
      </div>
    </main>
  `;

  // ── Tab switching ────────────────────────────────────────
  const tabList = document.getElementById('tab-switcher')!;
  const tabs = tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  const panels = document.querySelectorAll<HTMLElement>('.dashboard-panel');

  function activateTab(tab: HTMLButtonElement) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => p.classList.remove('active'));

    tab.setAttribute('aria-selected', 'true');
    const panelId = `panel-${tab.dataset.panel}`;
    document.getElementById(panelId)?.classList.add('active');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
  });

  // Arrow key navigation between tabs (accessibility)
  tabList.addEventListener('keydown', (e: KeyboardEvent) => {
    const current = tabList.querySelector<HTMLButtonElement>('[aria-selected="true"]')!;
    const tabArray = Array.from(tabs);
    const idx = tabArray.indexOf(current);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabArray[(idx + 1) % tabArray.length];
      next.focus();
      activateTab(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabArray[(idx - 1 + tabArray.length) % tabArray.length];
      prev.focus();
      activateTab(prev);
    }
  });

  // ── Network mode selector ────────────────────────────────
  const networkBtns = document.querySelectorAll<HTMLButtonElement>('.btn-network');

  function activateNetworkMode(mode: string) {
    networkBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.mode === mode ? 'true' : 'false');
    });

    const unstableControls = document.getElementById('unstable-controls')!;
    unstableControls.classList.toggle('visible', mode === 'unstable');
  }

  networkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode ?? 'normal';
      activateNetworkMode(mode);
    });
  });

  // Force fail toggle
  const forceFailBtn = document.getElementById('btn-force-fail')!;
  let forceFail = false;
  forceFailBtn.addEventListener('click', () => {
    forceFail = !forceFail;
    forceFailBtn.setAttribute('aria-pressed', String(forceFail));
    forceFailBtn.textContent = `Force Next Failure: ${forceFail ? 'ON' : 'OFF'}`;
  });

  // ── Reset Demo ───────────────────────────────────────────
  document.getElementById('btn-reset')!.addEventListener('click', () => {
    if (confirm('This will clear all local data. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  });
});
