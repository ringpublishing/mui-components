import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Autocomplete, ChipsInputAutocompleteProps } from '../../../src/index.js';

describe('Autocomplete - chipsInput variant', () => {
    const Harness = (props: Partial<ChipsInputAutocompleteProps<string>>): React.JSX.Element => {
        const [value, setValue] = useState<Array<string>>([]);

        return (
            <Autocomplete<string>
                variant="chipsInput"
                labels={{ title: 'Tags' }}
                value={value}
                onChange={(event, next): void => setValue(next)}
                {...props}
            />
        );
    };

    const setup = (
        props: Partial<ChipsInputAutocompleteProps<string>> = {},
        ui?: React.JSX.Element,
    ): { input: HTMLInputElement; container: HTMLElement } => {
        const { container } = render(ui ?? <Harness {...props} />);

        return { input: container.querySelector('input') as HTMLInputElement, container };
    };

    const chipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? '');

    const enter = (input: HTMLInputElement, text: string): void => {
        fireEvent.change(input, { target: { value: text } });
        fireEvent.keyDown(input, { key: 'Enter' });
    };

    it('creates a chip on Enter without options', () => {
        const { input, container } = setup();

        enter(input, 'alpha');
        enter(input, 'beta');

        expect(chipLabels(container)).toEqual(['alpha', 'beta']);
        expect(input.value).toBe('');
    });

    it('creates a chip on Enter when options are provided but nothing is highlighted', () => {
        const { input, container } = setup({ options: ['Onet', 'Fakt'] });

        enter(input, 'custom');

        expect(chipLabels(container)).toEqual(['custom']);
    });

    it('works uncontrolled, accumulating chips without a value prop', () => {
        const { input, container } = setup(
            {},
            <Autocomplete<string> variant="chipsInput" labels={{ title: 'Tags' }} />,
        );

        enter(input, 'alpha');
        enter(input, 'beta');

        expect(chipLabels(container)).toEqual(['alpha', 'beta']);
    });

    it('does not open a popup when there are no options', () => {
        const { input } = setup();

        fireEvent.change(input, { target: { value: 'x' } });

        expect(document.querySelector('[role="listbox"]')).toBeNull();
    });

    const paste = (input: HTMLInputElement, text: string): boolean =>
        fireEvent.paste(input, { clipboardData: { getData: (): string => text } });

    describe('createChipsOnPaste', () => {
        it('splits pasted text into chips with one onChange call', () => {
            const onChange = vi.fn();
            const { input, container } = setup(
                {},
                <Autocomplete<string>
                    variant="chipsInput"
                    labels={{ title: 'Tags' }}
                    createChipsOnPaste={true}
                    onChange={onChange}
                />,
            );

            paste(input, 'a, b;c\nd');

            expect(chipLabels(container)).toEqual(['a', 'b', 'c', 'd']);
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange.mock.calls[0][1]).toEqual(['a', 'b', 'c', 'd']);
            expect(onChange.mock.calls[0][2]).toBe('createOption');
        });

        it('replaces the text typed in the input', () => {
            const { input, container } = setup({ createChipsOnPaste: true });

            fireEvent.change(input, { target: { value: 'typed' } });
            paste(input, 'x,y');

            expect(chipLabels(container)).toEqual(['x', 'y']);
            expect(input.value).toBe('');
        });

        it('creates one chip from a paste without separators', () => {
            const { input, container } = setup({ createChipsOnPaste: true });

            paste(input, 'single');

            expect(chipLabels(container)).toEqual(['single']);
        });

        it('handles CRLF-separated text', () => {
            const { input, container } = setup({ createChipsOnPaste: true });

            paste(input, 'a\r\nb\r\n');

            expect(chipLabels(container)).toEqual(['a', 'b']);
        });

        it('leaves the native paste alone when nothing is pasteable', () => {
            const { input, container } = setup({ createChipsOnPaste: true });

            const notCancelled = paste(input, ' , ;\n');

            expect(notCancelled).toBe(true);
            expect(chipLabels(container)).toEqual([]);
        });

        it('uses custom separators', () => {
            const { input, container } = setup({ createChipsOnPaste: true, pasteSeparators: ['|'] });

            paste(input, 'a,b|c');

            expect(chipLabels(container)).toEqual(['a,b', 'c']);
        });

        it('works uncontrolled', () => {
            const { input, container } = setup(
                {},
                <Autocomplete<string> variant="chipsInput" labels={{ title: 'Tags' }} createChipsOnPaste={true} />,
            );

            paste(input, 'a,b');
            paste(input, 'c');

            expect(chipLabels(container)).toEqual(['a', 'b', 'c']);
        });

        it('skips entries already present and repeats within the paste', () => {
            const { input, container } = setup({ createChipsOnPaste: true });

            paste(input, 'a,b');
            paste(input, 'b,c,c');

            expect(chipLabels(container)).toEqual(['a', 'b', 'c']);
        });
    });

    it('does not intercept a paste when createChipsOnPaste is off', () => {
        const { input, container } = setup();

        const notCancelled = paste(input, 'a,b');

        expect(notCancelled).toBe(true);
        expect(chipLabels(container)).toEqual([]);
    });

    describe('duplicate feedback', () => {
        const flush = (): Promise<void> => act(() => Promise.resolve());

        const helper = (container: HTMLElement): string | null =>
            container.querySelector('.MuiFormHelperText-root')?.textContent ?? null;

        it('reports a typed duplicate with the message and the callback', async () => {
            const onDuplicateEntry = vi.fn();
            const { input, container } = setup({
                duplicateEntryMessage: (entry): string => `"${entry}" is already on the list`,
                onDuplicateEntry,
            });

            enter(input, 'a');
            enter(input, 'a');
            await flush();

            expect(chipLabels(container)).toEqual(['a']);
            expect(helper(container)).toBe('"a" is already on the list');
            expect(onDuplicateEntry).toHaveBeenCalledTimes(1);
        });

        it('reports entries rejected from a paste: one message, one callback per entry', () => {
            const onDuplicateEntry = vi.fn();
            const { input, container } = setup({
                createChipsOnPaste: true,
                duplicateEntryMessage: (entry): string => `"${entry}" is already on the list`,
                onDuplicateEntry,
            });

            paste(input, 'a,b');
            paste(input, 'a,b,c,c');

            expect(chipLabels(container)).toEqual(['a', 'b', 'c']);
            expect(helper(container)).toBe('"a" is already on the list');
            expect(onDuplicateEntry.mock.calls.map((call) => call[1])).toEqual(['a', 'b', 'c']);
        });

        it('clears the message on the next input change', () => {
            const { input, container } = setup({
                createChipsOnPaste: true,
                duplicateEntryMessage: 'duplicate',
            });

            paste(input, 'a');
            paste(input, 'a');
            expect(helper(container)).toBe('duplicate');

            fireEvent.change(input, { target: { value: 'x' } });

            expect(helper(container)).toBeNull();
        });

        it('honours a custom isOptionEqualToValue for pasted entries', () => {
            const { input, container } = setup({
                createChipsOnPaste: true,
                isOptionEqualToValue: (option, value): boolean => option.toLowerCase() === value.toLowerCase(),
            });

            paste(input, 'Design');
            paste(input, 'design,DESIGN,Other');

            expect(chipLabels(container)).toEqual(['Design', 'Other']);
        });

        it('treats a null duplicateEntryMessage like no message, while the callback still fires', async () => {
            const onDuplicateEntry = vi.fn();
            const { input, container } = setup({
                createChipsOnPaste: true,
                duplicateEntryMessage: null,
                onDuplicateEntry,
            });

            enter(input, 'a');
            enter(input, 'a');
            await flush();
            paste(input, 'a');

            expect(helper(container)).toBeNull();
            expect(container.querySelector('.MuiFormLabel-root.Mui-error')).toBeNull();
            expect(onDuplicateEntry).toHaveBeenCalledTimes(2);
        });

        it('stays silent when a paste has no duplicates', () => {
            const onDuplicateEntry = vi.fn();
            const { input } = setup({ createChipsOnPaste: true, onDuplicateEntry });

            paste(input, 'a,b');

            expect(onDuplicateEntry).not.toHaveBeenCalled();
        });
    });

    describe('validateEntry', () => {
        const isNumeric = (entry: unknown): boolean => /^\d+$/.test(String(entry));
        const errorChips = (container: HTMLElement): string[] =>
            Array.from(container.querySelectorAll('.MuiChip-colorError .MuiChip-label')).map(
                (chip) => chip.textContent ?? '',
            );

        it('colours invalid entries with the error colour and leaves valid ones alone', () => {
            const { input, container } = setup({ validateEntry: isNumeric });

            enter(input, '12');
            enter(input, 'abc');

            expect(chipLabels(container)).toEqual(['12', 'abc']);
            expect(errorChips(container)).toEqual(['abc']);
        });

        it('still adds an invalid entry', () => {
            const { input, container } = setup(
                {},
                <Autocomplete<string> variant="chipsInput" labels={{ title: 'Tags' }} validateEntry={isNumeric} />,
            );

            enter(input, 'abc');

            expect(chipLabels(container)).toEqual(['abc']);
        });

        it('validates chips that arrive through value, not only typed ones', () => {
            const { container } = setup(
                {},
                <Autocomplete<string>
                    variant="chipsInput"
                    labels={{ title: 'Tags' }}
                    value={['1', 'x']}
                    validateEntry={isNumeric}
                />,
            );

            expect(errorChips(container)).toEqual(['x']);
        });

        it('lets slotProps.chip.color win over the error colour', () => {
            const { input, container } = setup({
                validateEntry: isNumeric,
                slotProps: { chip: { color: 'success' } },
            });

            enter(input, 'abc');

            expect(errorChips(container)).toEqual([]);
            expect(container.querySelectorAll('.MuiChip-colorSuccess')).toHaveLength(1);
        });

        it('passes invalid to renderChip', () => {
            const renderChip = vi.fn(({ label, invalid }): React.ReactNode => (
                <span data-testid={`chip-${label}`}>{String(invalid)}</span>
            ));
            const { input } = setup({ validateEntry: isNumeric, renderChip });

            enter(input, '1');
            enter(input, 'b');

            expect(renderChip).toHaveBeenCalledWith(expect.objectContaining({ label: 'b', invalid: true }));
            expect(renderChip).toHaveBeenCalledWith(expect.objectContaining({ label: '1', invalid: false }));
        });

        it('reports invalid as false when no validateEntry is given', () => {
            const renderChip = vi.fn((): React.ReactNode => null);
            const { input } = setup({ renderChip });

            enter(input, 'x');

            expect(renderChip).toHaveBeenCalledWith(expect.objectContaining({ invalid: false }));
        });
    });

    describe('chipMaxWidth', () => {
        const chipRoot = (container: HTMLElement): HTMLElement =>
            container.querySelector('.MuiChip-root') as HTMLElement;

        it('limits the chip to 150px by default', () => {
            const { input, container } = setup();

            enter(input, 'a very long entry that has to be truncated');

            expect(getComputedStyle(chipRoot(container)).maxWidth).toBe('150px');
        });

        it('takes a custom width', () => {
            const { input, container } = setup({ chipMaxWidth: 80 });

            enter(input, 'entry');

            expect(getComputedStyle(chipRoot(container)).maxWidth).toBe('80px');
        });

        it('accepts a CSS length string', () => {
            const { input, container } = setup({ chipMaxWidth: '50%' });

            enter(input, 'entry');

            expect(getComputedStyle(chipRoot(container)).maxWidth).toBe('50%');
        });

        it('keeps the other slotProps.chip.sx styles next to the width', () => {
            const { input, container } = setup({
                chipMaxWidth: 80,
                slotProps: { chip: { sx: { opacity: 0.5 } } },
            });

            enter(input, 'entry');

            const style = getComputedStyle(chipRoot(container));

            expect(style.maxWidth).toBe('80px');
            expect(style.opacity).toBe('0.5');
        });

        it('outranks the max-width MUI sets on Autocomplete tags, which jsdom computed styles cannot show', () => {
            const { input } = setup({ chipMaxWidth: 120 });

            enter(input, 'entry');

            // MUI sets `max-width: calc(100% - 6px)` through `.MuiAutocomplete-root .MuiAutocomplete-tag` (two
            // classes). A rule on the chip's own generated class alone (one class) loses to it in a real browser.
            const rules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules));
            const widthRule = rules.find(
                (rule): rule is CSSStyleRule =>
                    rule instanceof CSSStyleRule &&
                    rule.selectorText.includes('.MuiAutocomplete-tag') &&
                    rule.cssText.includes('max-width: 120px'),
            );

            expect(widthRule).toBeDefined();
            // Three classes, so it also beats the Chip's own base rule and the two-class tag rule.
            expect(widthRule?.selectorText.match(/\./g)?.length).toBeGreaterThanOrEqual(3);
        });

        it('does not constrain chips of the default variant', () => {
            const { container } = render(
                <Autocomplete<string> options={['one']} multiple={true} value={['one']} labels={{ title: 'Tags' }} />,
            );

            expect(getComputedStyle(chipRoot(container)).maxWidth).not.toBe('150px');
        });
    });

    describe('paste handler hygiene', () => {
        it('still calls a consumer slotProps.textField.onPaste in the chipsInput variant', () => {
            const onPaste = vi.fn();
            const { input } = setup({ createChipsOnPaste: true, slotProps: { textField: { onPaste } } });

            paste(input, 'a,b');

            expect(onPaste).toHaveBeenCalledTimes(1);
        });

        it('still calls a consumer slotProps.textField.onPaste in the default variant', () => {
            const onPaste = vi.fn();
            const { container } = render(
                <Autocomplete<string>
                    options={['one']}
                    labels={{ title: 'T' }}
                    slotProps={{ textField: { onPaste } }}
                />,
            );

            paste(container.querySelector('input') as HTMLInputElement, 'x');

            expect(onPaste).toHaveBeenCalledTimes(1);
        });

        it('does not create chips in a read-only field', () => {
            const onChange = vi.fn();
            const { input, container } = setup(
                {},
                <Autocomplete<string>
                    variant="chipsInput"
                    labels={{ title: 'Tags' }}
                    createChipsOnPaste={true}
                    readOnly={true}
                    defaultValue={['a']}
                    onChange={onChange}
                />,
            );

            const notCancelled = paste(input, 'b,c');

            expect(notCancelled).toBe(true);
            expect(chipLabels(container)).toEqual(['a']);
            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
