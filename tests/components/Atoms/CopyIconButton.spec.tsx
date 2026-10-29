import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent } from '@testing-library/react';

import { render } from '../../test-utils/customRenderer.js';
import { CopyIconButton } from '../../../src/index.js';

const VALUE = 'https://rss.example.com/feed/0ebeedf7-aebc-4f09-8888-37715df857c0.xml';

function glyphOf(button: HTMLElement): string {
    return Array.from(button.querySelector('svg')?.classList ?? [])
        .filter((name) => name.startsWith('lucide-'))
        .join(' ');
}

describe('Components: CopyIconButton', () => {
    const writeText = vi.fn<(text: string) => Promise<void>>();

    beforeEach(() => {
        vi.useFakeTimers();
        writeText.mockReset().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    });

    it('renders a copy button with the default label and the copy glyph', () => {
        const { getByTestId } = render(<CopyIconButton value={VALUE} />);
        const button = getByTestId('ring-copyiconbutton');

        expect(button.getAttribute('aria-label')).toBe('Copy');
        expect(button.getAttribute('data-copied')).toBe('false');
        expect(button.classList).toContain('ring-copyiconbutton');
        expect(glyphOf(button)).toContain('lucide-copy');
    });

    it('writes the value to the clipboard and confirms, then returns to the copy state', async () => {
        const onCopied = vi.fn();
        const { getByTestId, container } = render(
            <CopyIconButton value={VALUE} onCopied={onCopied} labels={{ copy: 'Kopiuj', copied: 'Skopiowano' }} />,
        );
        const button = getByTestId('ring-copyiconbutton');

        expect(button.getAttribute('aria-label')).toBe('Kopiuj');

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });

        expect(writeText).toHaveBeenCalledWith(VALUE);
        expect(onCopied).toHaveBeenCalledWith(VALUE);
        expect(button.getAttribute('aria-label')).toBe('Skopiowano');
        expect(button.getAttribute('data-copied')).toBe('true');
        expect(glyphOf(button)).toContain('lucide-check');
        expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe('Skopiowano');

        act(() => {
            vi.advanceTimersByTime(1500);
        });

        expect(button.getAttribute('aria-label')).toBe('Kopiuj');
        expect(button.getAttribute('data-copied')).toBe('false');
        expect(glyphOf(button)).toContain('lucide-copy');
        expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe('');
    });

    it('honours copiedForMs', async () => {
        const { getByTestId } = render(<CopyIconButton value={VALUE} copiedForMs={300} />);
        const button = getByTestId('ring-copyiconbutton');

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });
        expect(button.getAttribute('data-copied')).toBe('true');

        act(() => {
            vi.advanceTimersByTime(299);
        });
        expect(button.getAttribute('data-copied')).toBe('true');

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(button.getAttribute('data-copied')).toBe('false');
    });

    it('restarts the confirmation on a repeated click', async () => {
        const { getByTestId } = render(<CopyIconButton value={VALUE} />);
        const button = getByTestId('ring-copyiconbutton');

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });
        act(() => {
            vi.advanceTimersByTime(1200);
        });
        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });

        act(() => {
            vi.advanceTimersByTime(1200);
        });
        expect(button.getAttribute('data-copied')).toBe('true');

        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(button.getAttribute('data-copied')).toBe('false');
    });

    it('falls back to execCommand when the Clipboard API is unavailable', async () => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
        const execCommand = vi.fn().mockReturnValue(true);

        document.execCommand = execCommand;

        const { getByTestId } = render(<CopyIconButton value={VALUE} />);
        const button = getByTestId('ring-copyiconbutton');

        button.focus();

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });

        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(button.getAttribute('data-copied')).toBe('true');
        expect(document.querySelector('textarea')).toBeNull();
        // The fallback must not leave focus on the removed textarea or on body.
        expect(document.activeElement).toBe(button);
    });

    it('copies through a textarea next to the button, focused when execCommand runs', async () => {
        writeText.mockRejectedValue(new Error('denied'));
        const onCopied = vi.fn();
        let atCopy: { focused: Element | null; host: boolean; value: string | undefined } | undefined;

        document.execCommand = vi.fn(() => {
            const focused = document.activeElement;

            atCopy = {
                focused,
                host: document.querySelector('[data-testid="host"]')?.contains(focused) ?? false,
                value: focused instanceof HTMLTextAreaElement ? focused.value : undefined,
            };

            return true;
        });

        const { getByTestId } = render(
            <div data-testid="host">
                <CopyIconButton value={VALUE} onCopied={onCopied} />
            </div>,
        );
        const button = getByTestId('ring-copyiconbutton');

        button.focus();

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(atCopy?.focused).toBeInstanceOf(HTMLTextAreaElement);
        expect(atCopy?.host).toBe(true);
        expect(atCopy?.value).toBe(VALUE);
        expect(onCopied).toHaveBeenCalledWith(VALUE);
        expect(button.getAttribute('data-copied')).toBe('true');
        expect(document.querySelector('textarea')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    it('does not confirm when a focus trap takes focus away from the textarea', async () => {
        writeText.mockRejectedValue(new Error('denied'));
        // `execCommand` reports success even when the selection is gone.
        document.execCommand = vi.fn().mockReturnValue(true);
        const onCopied = vi.fn();
        const onCopyError = vi.fn();

        const { getByTestId } = render(
            <div>
                <button data-testid="trap-root">trap</button>
                <CopyIconButton value={VALUE} onCopied={onCopied} onCopyError={onCopyError} />
            </div>,
        );
        const button = getByTestId('ring-copyiconbutton');
        const trapRoot = getByTestId('trap-root');

        const trap = (event: FocusEvent): void => {
            if (event.target instanceof HTMLTextAreaElement) {
                trapRoot.focus();
            }
        };

        document.addEventListener('focusin', trap);
        button.focus();

        try {
            await act(async () => {
                fireEvent.click(button);
                await Promise.resolve();
                await Promise.resolve();
            });
        } finally {
            document.removeEventListener('focusin', trap);
        }

        expect(onCopied).not.toHaveBeenCalled();
        expect(onCopyError).toHaveBeenCalledTimes(1);
        expect(button.getAttribute('aria-label')).toBe('Copy');
        expect(button.getAttribute('data-copied')).toBe('false');
        expect(document.querySelector('textarea')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    it('removes the textarea and restores focus when execCommand throws', async () => {
        writeText.mockRejectedValue(new Error('denied'));
        document.execCommand = vi.fn(() => {
            throw new Error('SecurityError');
        });
        const onCopyError = vi.fn();

        const { getByTestId } = render(<CopyIconButton value={VALUE} onCopyError={onCopyError} />);
        const button = getByTestId('ring-copyiconbutton');

        button.focus();

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(onCopyError).toHaveBeenCalledTimes(1);
        expect(button.getAttribute('data-copied')).toBe('false');
        expect(document.querySelector('textarea')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    it('reports a failure instead of confirming', async () => {
        writeText.mockRejectedValue(new Error('denied'));
        document.execCommand = vi.fn().mockReturnValue(false);
        const onCopyError = vi.fn();
        const onCopied = vi.fn();

        const { getByTestId } = render(<CopyIconButton value={VALUE} onCopied={onCopied} onCopyError={onCopyError} />);
        const button = getByTestId('ring-copyiconbutton');

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(onCopyError).toHaveBeenCalledTimes(1);
        expect(onCopied).not.toHaveBeenCalled();
        expect(button.getAttribute('data-copied')).toBe('false');
        expect(glyphOf(button)).toContain('lucide-copy');
    });

    it('takes a separate accessible name when ariaLabels is given', async () => {
        const { getByTestId } = render(
            <CopyIconButton value={VALUE} labels={{ copy: 'Kopiuj' }} ariaLabels={{ copy: 'Kopiuj adres RSS' }} />,
        );
        const button = getByTestId('ring-copyiconbutton');

        expect(button.getAttribute('aria-label')).toBe('Kopiuj adres RSS');

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });

        // The copied name falls back to the visible label.
        expect(button.getAttribute('aria-label')).toBe('Copied');
    });

    it('applies the test id suffix and forwards IconButton props', () => {
        const { getByTestId } = render(<CopyIconButton value={VALUE} dataTestIdSuffix="rss" size="small" />);
        const button = getByTestId('ring-copyiconbutton-rss');

        expect(button.classList).toContain('MuiIconButton-sizeSmall');
    });

    it('forwards the ref to the button, also when disabled', () => {
        const ref = createRef<HTMLButtonElement>();
        const disabledRef = createRef<HTMLButtonElement>();
        const { getByTestId } = render(
            <>
                <CopyIconButton ref={ref} value={VALUE} />
                <CopyIconButton ref={disabledRef} value={VALUE} dataTestIdSuffix="off" disabled={true} />
            </>,
        );

        expect(ref.current).toBe(getByTestId('ring-copyiconbutton'));
        expect(disabledRef.current).toBe(getByTestId('ring-copyiconbutton-off'));
    });

    // React 18 hands `ref` only to class and forwardRef components; React 19 passes it as a prop
    // either way, so the ref assertion above cannot tell the two apart.
    it('is a forwardRef component', () => {
        expect(typeof CopyIconButton).toBe('object');
        expect((CopyIconButton as unknown as { $$typeof: symbol }).$$typeof).toBe(Symbol.for('react.forward_ref'));
        expect(React.isValidElement(<CopyIconButton value={VALUE} />)).toBe(true);
    });
});
