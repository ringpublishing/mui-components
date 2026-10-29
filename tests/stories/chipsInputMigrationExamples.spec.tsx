import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';

import TagsExample from '../../stories/migrations/from-legacy-components/chips-input/code/TagsExample.js';
import IdFilterExample from '../../stories/migrations/from-legacy-components/chips-input/code/IdFilterExample.js';
import ObjectsExample from '../../stories/migrations/from-legacy-components/chips-input/code/ObjectsExample.js';
import PlaceholderExample from '../../stories/migrations/from-legacy-components/chips-input/code/PlaceholderExample.js';
import ColorsExample from '../../stories/migrations/from-legacy-components/chips-input/code/ColorsExample.js';
import SuggestionsExample from '../../stories/migrations/from-legacy-components/chips-input/code/SuggestionsExample.js';

/**
 * The migration guide renders these files and shows them as the code to copy, so a guide example that stops
 * doing what the text next to it says fails here rather than in a consumer's app.
 */
describe('ChipsInput → Autocomplete migration examples', () => {
    const UUID_A = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';
    const UUID_B = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const UUID_C = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

    const chips = (container: HTMLElement): { label: string; color: string }[] =>
        Array.from(container.querySelectorAll('.MuiChip-root')).map((chip) => ({
            label: chip.querySelector('.MuiChip-label')?.textContent ?? '',
            color: Array.from(chip.classList).find((name) => name.startsWith('MuiChip-color')) ?? '',
        }));
    const labels = (container: HTMLElement): string[] => chips(container).map((chip) => chip.label);
    const helper = (container: HTMLElement): string | null =>
        container.querySelector('.MuiFormHelperText-root')?.textContent ?? null;

    /** A rejected duplicate is reported from a microtask after the keydown, so each Enter flushes one. */
    const enter = async (input: HTMLInputElement, text: string): Promise<void> => {
        fireEvent.change(input, { target: { value: text } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await act(() => Promise.resolve());
    };

    const paste = (input: HTMLInputElement, text: string): void => {
        fireEvent.paste(input, { clipboardData: { getData: (): string => text } });
    };

    const setup = (Example: () => React.JSX.Element): { container: HTMLElement; input: HTMLInputElement } => {
        vi.spyOn(console, 'info').mockImplementation(() => undefined);
        const { container } = render(<Example />);

        return { container, input: container.querySelector('input') as HTMLInputElement };
    };

    it('a tags field: strings in, strings out, a duplicate rejected with the message', async () => {
        const { container, input } = setup(TagsExample);

        await enter(input, 'sport');
        await enter(input, 'news');

        expect(labels(container)).toEqual(['news', 'sport']);
        expect(helper(container)).toBe('"news" is already on the list');
    });

    it('an identifier filter: an invalid id is rejected with its own message, a valid one is added', async () => {
        const { container, input } = setup(IdFilterExample);

        await enter(input, 'not-an-id');
        expect(labels(container)).toEqual([UUID_A]);
        expect(helper(container)).toBe('"not-an-id" is not a valid identifier');

        await enter(input, UUID_B);
        expect(labels(container)).toEqual([UUID_A, UUID_B]);
        expect(helper(container)).toBeNull();
    });

    it('an identifier filter: a paste split on spaces keeps only valid ids and quotes the invalid one', () => {
        const { container, input } = setup(IdFilterExample);

        paste(input, `${UUID_B} not-an-id ${UUID_C}`);

        expect(labels(container)).toEqual([UUID_A, UUID_B, UUID_C]);
        expect(helper(container)).toBe('"not-an-id" is not a valid identifier');
    });

    it('an identifier filter: a paste holding an invalid id and a duplicate shows the duplicate message', () => {
        const { container, input } = setup(IdFilterExample);

        paste(input, `${UUID_B} not-an-id ${UUID_A}`);

        expect(labels(container)).toEqual([UUID_A, UUID_B]);
        expect(helper(container)).toBe(`"${UUID_A}" is already on the list`);
    });

    it('objects in state: chips from value are validated by label and a typed duplicate of an object is rejected', async () => {
        const { container, input } = setup(ObjectsExample);

        await enter(input, 'bad value!');
        await enter(input, 'variant-a');

        expect(chips(container)).toEqual([
            { label: 'variant-a', color: 'MuiChip-colorDefault' },
            { label: 'bad value!', color: 'MuiChip-colorError' },
        ]);
        expect(helper(container)).toBe('Value already added');
    });

    it('placeholder: the label is shrunk from the start, so the placeholder is not hidden', () => {
        const { container, input } = setup(PlaceholderExample);

        expect(container.querySelector('label')?.getAttribute('data-shrink')).toBe('true');
        expect(input.getAttribute('placeholder')).toBe('Insert or paste identifiers');
    });

    it('custom colours: renderChip paints valid and invalid entries with its own pair', () => {
        const { container } = setup(ColorsExample);

        expect(chips(container)).toEqual([
            { label: 'anna@example.com', color: 'MuiChip-colorSuccess' },
            { label: 'not-an-email', color: 'MuiChip-colorWarning' },
        ]);
    });

    it('suggestions: free entry still works next to the options', async () => {
        const { container, input } = setup(SuggestionsExample);

        await enter(input, 'custom');

        expect(labels(container)).toEqual(['design', 'custom']);
    });
});
