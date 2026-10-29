export interface KeepAnchorInViewOptions {
    /** Stop once the page has not changed size for this long after the heading was reached. */
    settleMs?: number;
    /** Stop after this long no matter what, so a heading that never renders cannot pin the page. */
    timeoutMs?: number;
}

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/**
 * The heading id a docs page was opened at. In the manager the hash sits on the top-level URL (the
 * preview iframe URL has none); an `iframe.html#…` link carries it on the iframe itself.
 */
export function readAnchor(win: Window): string {
    let hash = win.location.hash;

    if (!hash) {
        try {
            hash = win.parent.location.hash;
        } catch {
            // A cross-origin parent hides its URL; there is nothing to scroll to then.
        }
    }

    try {
        return decodeURIComponent(hash.replace(/^#/, ''));
    } catch {
        return '';
    }
}

/**
 * Scrolls `doc` to the element with `id` and keeps it at the top while the page is still growing.
 *
 * Code blocks on a docs page render after the first paint and push every heading below them further
 * down, so a single scroll on mount ends above its target. Each resize of the body re-aligns the
 * heading; the first wheel, touch, key or pointer press hands the page back to the reader.
 *
 * Returns a function that stops the alignment early.
 */
export function keepAnchorInView(doc: Document, id: string, options: KeepAnchorInViewOptions = {}): () => void {
    const { settleMs = 1000, timeoutMs = 10000 } = options;
    const win = doc.defaultView;

    if (!id || !win || typeof win.ResizeObserver === 'undefined') {
        return (): void => undefined;
    }

    let settleTimer: number | undefined;
    let stopped = false;

    function stop(): void {
        if (stopped) {
            return;
        }

        stopped = true;
        observer.disconnect();
        win?.clearTimeout(settleTimer);
        win?.clearTimeout(timeoutTimer);
        USER_SCROLL_EVENTS.forEach((type): void => doc.removeEventListener(type, stop, true));
    }

    function align(): void {
        const target = doc.getElementById(id);

        if (stopped || !target || !win) {
            return;
        }

        // Scroll this document only; `scrollIntoView` would also scroll a page that embeds the docs in a frame.
        win.scrollTo({ top: win.scrollY + target.getBoundingClientRect().top, behavior: 'instant' });
        win.clearTimeout(settleTimer);
        settleTimer = win.setTimeout(stop, settleMs);
    }

    const observer = new win.ResizeObserver(align);
    const timeoutTimer = win.setTimeout(stop, timeoutMs);

    USER_SCROLL_EVENTS.forEach((type): void => doc.addEventListener(type, stop, { capture: true, passive: true }));
    observer.observe(doc.body);
    align();

    return stop;
}
