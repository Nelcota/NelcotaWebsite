/**
 * Copy-to-clipboard buttons. Each button names its source with data-copy; the
 * result is shown on the button and announced through the layout's live region.
 */
const RESET_AFTER_MS = 2000;

type CopyState = 'done' | 'failed';

async function copyText(text: string): Promise<CopyState> {
  try {
    await navigator.clipboard.writeText(text);

    return 'done';
  } catch (error: unknown) {
    // Clipboard access can be denied (permissions, insecure context): report it to the user.
    console.warn('[nelcota] copy failed', error);

    return 'failed';
  }
}

function setupCopyButton(button: HTMLButtonElement, status: HTMLElement | null): void {
  const sourceId = button.dataset.copy;
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  if (sourceId == null || label == null) return;

  const idleText = label.textContent;
  const messages: Readonly<Record<CopyState, string | undefined>> = {
    done: button.dataset.copied,
    failed: button.dataset.failed,
  };
  let resetTimer = 0;

  button.addEventListener('click', async () => {
    const source = document.getElementById(sourceId);
    if (source == null) return;

    const state = await copyText(source.textContent);
    // A button without data-copied/data-failed keeps its own label rather than going blank.
    const message = messages[state] ?? idleText;

    button.dataset.state = state;
    label.textContent = message;
    if (status != null) status.textContent = message;

    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      label.textContent = idleText;
      delete button.dataset.state;
    }, RESET_AFTER_MS);
  });
}

const liveRegion = document.querySelector<HTMLElement>('[data-copy-status]');

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  setupCopyButton(button, liveRegion);
}

// A module, so top-level names stay private to this file.
export {};
