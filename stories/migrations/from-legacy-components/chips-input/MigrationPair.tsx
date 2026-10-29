import React, { useEffect, useRef, useState } from 'react';

/*
 * Docs-page chrome around the examples. It renders in the MDX itself, outside the story decorators, so
 * it uses plain elements: MUI components here would pick up MUI's default theme instead of the Ring one.
 * The examples themselves come in as `<Canvas of={…} />` and get the theme from the decorators.
 */

const muted = 'rgba(128, 128, 128, 0.9)';
const frame: React.CSSProperties = {
    border: '1px solid rgba(128, 128, 128, 0.25)',
    borderRadius: 8,
    minWidth: 0,
    padding: 16,
};
const caption: React.CSSProperties = {
    color: muted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    margin: '0 0 8px',
    textTransform: 'uppercase',
};

/* ── Callback log ─────────────────────────────────────────────────────────────────────────────
 * The examples report their callbacks with `console.info('onChange', …)`, as the library's other
 * examples do. Several live examples share the page, so a call is shown under the one the reader
 * touched last.
 */
type Listener = (line: string) => void;

const listeners = new Set<{ notify: Listener }>();
let active: { notify: Listener } | null = null;
let originalInfo: typeof console.info | null = null;

const stringify = (value: unknown): string => {
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const tapConsole = (): void => {
    if (originalInfo) {
        return;
    }

    originalInfo = console.info;

    console.info = (...args: unknown[]): void => {
        const [name, ...rest] = args;

        if (active && typeof name === 'string') {
            active.notify(`${name}(${rest.map(stringify).join(', ')})`);
        }

        originalInfo?.(...args);
    };
};

const untapConsole = (): void => {
    if (listeners.size === 0 && originalInfo) {
        console.info = originalInfo;
        originalInfo = null;
    }
};

/**
 * Storybook renders the docs in an iframe without `allow="clipboard-write"`, so the async Clipboard
 * API is refused there; the hidden-textarea `copy` command still works on a click.
 */
const copyText = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);

        return true;
    } catch {
        const area = document.createElement('textarea');

        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand('copy');

        area.remove();

        return copied;
    }
};

function CopySample({ text }: { text: string }): React.JSX.Element {
    const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

    return (
        <button
            type="button"
            onClick={(): void => {
                void copyText(text).then((copied): void => {
                    setStatus(copied ? 'copied' : 'failed');
                    window.setTimeout((): void => setStatus('idle'), 2000);
                });
            }}
            style={{
                background: 'transparent',
                border: '1px solid rgba(128, 128, 128, 0.4)',
                borderRadius: 6,
                color: 'inherit',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 12,
                padding: '4px 8px',
            }}
        >
            {status === 'copied'
                ? 'copied — paste it into the field'
                : status === 'failed'
                  ? 'copy blocked — select the text instead'
                  : `copy “${text.replace(/\n/g, '⏎')}”`}
        </button>
    );
}

export interface LiveExampleProps {
    /** The example, as `<Canvas of={Stories.X} />`. */
    children: React.ReactNode;
    /** Texts offered for pasting into the field. */
    samples?: string[];
}

/** A live example with the callbacks it reported, newest last. */
export function LiveExample({ children, samples }: LiveExampleProps): React.JSX.Element {
    const [lines, setLines] = useState<string[]>([]);
    const handle = useRef<{ notify: Listener }>({ notify: (): void => undefined });

    useEffect(() => {
        const entry = handle.current;

        entry.notify = (line): void => setLines((previous): string[] => [...previous, line].slice(-6));
        listeners.add(entry);
        tapConsole();

        return (): void => {
            listeners.delete(entry);

            if (active === entry) {
                active = null;
            }

            untapConsole();
        };
    }, []);

    const engage = (): void => {
        active = handle.current;
    };

    return (
        <div>
            {samples?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {samples.map((text): React.JSX.Element => (
                        <CopySample key={text} text={text} />
                    ))}
                </div>
            ) : null}
            <div
                data-migration-live=""
                onPointerDownCapture={engage}
                onFocusCapture={engage}
                onKeyDownCapture={engage}
                onPasteCapture={engage}
            >
                {children}
            </div>
            <p style={caption}>Callbacks</p>
            <div
                data-migration-log=""
                style={{
                    background: 'rgba(128, 128, 128, 0.08)',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    minHeight: 56,
                    padding: 8,
                    wordBreak: 'break-word',
                }}
            >
                {lines.length === 0 ? (
                    <div style={{ color: muted }}>Callbacks appear here as you use the field.</div>
                ) : (
                    lines.map((line, index): React.JSX.Element => <div key={index}>{line}</div>)
                )}
            </div>
        </div>
    );
}

export interface MigrationPairProps {
    /** The `Autocomplete` side, as `<Canvas of={Stories.X} />` — it shows the code it renders. */
    after: React.ReactNode;
    /** `false` for a recipe shown as code only; the callback log is left out. @default true */
    live?: boolean;
    samples?: string[];
    /** The `ChipsInput` side: code and a sentence on what it did. Static, so it outlives the component. */
    children: React.ReactNode;
}

/** `ChipsInput` code on the left, the `Autocomplete` replacement live — with its code — on the right. */
export function MigrationPair({ after, live = true, samples, children }: MigrationPairProps): React.JSX.Element {
    return (
        <div
            style={{
                display: 'grid',
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                margin: '16px 0',
            }}
        >
            <div style={frame}>
                <p style={caption}>Before — ChipsInput</p>
                {children}
            </div>
            <div style={frame}>
                <p style={caption}>After — Autocomplete variant=&quot;chipsInput&quot;</p>
                {live ? <LiveExample samples={samples}>{after}</LiveExample> : after}
            </div>
        </div>
    );
}
