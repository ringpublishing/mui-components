import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { keepAnchorInView, readAnchor } from '../../.storybook/docs/keepAnchorInView.js';

// jsdom has neither ResizeObserver nor layout; the test drives resizes by hand.
let resize: () => void = () => undefined;

class FakeResizeObserver {
    constructor(callback: () => void) {
        resize = callback;
    }

    public observe(): void {
        // Resizes are fired by the test through `resize()`.
    }

    public disconnect(): void {
        resize = (): void => undefined;
    }
}

let scrollTo: ReturnType<typeof vi.fn>;

const addHeading = (id: string, top = 0): void => {
    const heading = document.createElement('h2');

    heading.id = id;
    heading.getBoundingClientRect = (): DOMRect => ({ top }) as DOMRect;
    document.body.appendChild(heading);
};

describe('keepAnchorInView', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        scrollTo = vi.fn();
        vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo as unknown as typeof window.scrollTo);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('scrolls its own window to the heading at once when it is already rendered', () => {
        addHeading('section', 1200);

        keepAnchorInView(document, 'section');

        expect(scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'instant' });
    });

    it('scrolls to a heading that renders after the call', () => {
        keepAnchorInView(document, 'late');
        addHeading('late');

        resize();

        expect(scrollTo).toHaveBeenCalledTimes(1);
    });

    it('re-aligns on every resize until the layout has been still for settleMs', () => {
        addHeading('section');

        keepAnchorInView(document, 'section', { settleMs: 500 });
        vi.advanceTimersByTime(400);
        resize();
        vi.advanceTimersByTime(400);
        resize();
        vi.advanceTimersByTime(500);
        resize();

        expect(scrollTo).toHaveBeenCalledTimes(3);
    });

    it.each(['wheel', 'touchstart', 'keydown', 'pointerdown'])('hands the page back on %s', (type) => {
        addHeading('section');

        keepAnchorInView(document, 'section');
        document.dispatchEvent(new Event(type));
        resize();

        expect(scrollTo).toHaveBeenCalledTimes(1);
    });

    it('gives up after timeoutMs even if the page keeps resizing', () => {
        addHeading('section');

        keepAnchorInView(document, 'section', { settleMs: 1000, timeoutMs: 1500 });

        for (let elapsed = 0; elapsed < 2000; elapsed += 250) {
            vi.advanceTimersByTime(250);
            resize();
        }

        expect(scrollTo).toHaveBeenCalledTimes(6);
    });

    it('does nothing without an anchor', () => {
        addHeading('section');

        keepAnchorInView(document, '');
        resize();

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('stops when the returned function is called', () => {
        addHeading('section');
        const stop = keepAnchorInView(document, 'section');

        stop();
        resize();

        expect(scrollTo).toHaveBeenCalledTimes(1);
    });
});

describe('readAnchor', () => {
    const windowWith = (own: string, parent: () => string): Window =>
        ({
            location: { hash: own },
            get parent(): Window {
                return { location: { hash: parent() } } as Window;
            },
        }) as Window;

    it('prefers the hash of the window itself', () => {
        expect(readAnchor(windowWith('#own', () => '#parent'))).toBe('own');
    });

    it('falls back to the parent window, where the manager keeps it', () => {
        expect(readAnchor(windowWith('', () => '#200---accordion-label-typography'))).toBe(
            '200---accordion-label-typography',
        );
    });

    it('decodes the id', () => {
        expect(readAnchor(windowWith('#a%20b', () => ''))).toBe('a b');
    });

    it('returns nothing for a cross-origin parent', () => {
        const blocked = (): string => {
            throw new DOMException('Blocked a frame', 'SecurityError');
        };

        expect(readAnchor(windowWith('', blocked))).toBe('');
    });

    it('returns nothing for a malformed hash', () => {
        expect(readAnchor(windowWith('#%E0%A4%A', () => ''))).toBe('');
    });
});
