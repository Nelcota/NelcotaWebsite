/**
 * "Teste o limite" on /produtos/ratelimit: a GCRA simulation in the browser with the page's
 * rule. State lives in utils/rate-limit-state.ts and drawing in rate-limit-view.ts; this file
 * wires the buttons, the stream timer and the page lifecycle.
 */
import { RATE_LIMIT_DEMO } from '../../data/house/rate-limit.ts';
import {
  clearDemo,
  EMPTY_DEMO,
  sendRequest,
  toggleStoreDown,
} from '../../utils/rate-limit-state.ts';
import {
  findView,
  renderCounts,
  renderResult,
  renderTimeline,
  renderToggle,
} from './rate-limit-view.ts';

function setupDemo(root: HTMLElement): void {
  const view = findView(root);
  if (view == null) return;

  let state = EMPTY_DEMO;
  let streamTimer: number | null = null;

  const send = (): void => {
    const step = sendRequest(state, performance.now());
    state = step.state;
    renderCounts(view, state);
    renderTimeline(view, state);
    renderResult(view, step.decision);
  };

  const setStream = (isOn: boolean): void => {
    if (streamTimer != null) window.clearInterval(streamTimer);
    streamTimer = isOn ? window.setInterval(send, RATE_LIMIT_DEMO.streamIntervalMs) : null;
    renderToggle(view.stream, isOn, RATE_LIMIT_DEMO.streamOn, RATE_LIMIT_DEMO.streamOff);
  };

  const toggleDown = (): void => {
    state = toggleStoreDown(state);
    renderToggle(view.down, state.storeDown, RATE_LIMIT_DEMO.downOn, RATE_LIMIT_DEMO.downOff);
  };

  const clear = (): void => {
    state = clearDemo(state);
    renderCounts(view, state);
    renderTimeline(view, state);
    renderResult(view, null);
  };

  const actions: Readonly<Record<string, () => void>> = {
    one: send,
    burst: () => {
      for (let sent = 0; sent < RATE_LIMIT_DEMO.burstSize; sent += 1) send();
    },
    stream: () => setStream(streamTimer == null),
    down: toggleDown,
    clear,
  };

  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest<HTMLButtonElement>('[data-demo-action]');
    const action = actions[button?.dataset.demoAction ?? ''];
    if (action == null) return;

    action();
  });

  // No traffic in a hidden tab or after leaving the page.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && streamTimer != null) setStream(false);
  });
  window.addEventListener('pagehide', () => setStream(false));
}

for (const root of document.querySelectorAll<HTMLElement>('[data-rate-limit-demo]')) {
  setupDemo(root);
}
