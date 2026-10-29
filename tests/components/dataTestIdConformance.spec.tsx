import { describe, expect, it } from 'vitest';
import React, { useEffect, useRef } from 'react';
import { render } from '../test-utils/customRenderer.js';

import { Alert } from '../../src/components/Atoms/Alert/Alert.js';
import { EditableText } from '../../src/components/Atoms/EditableText/EditableText.js';
import { FeaturedIcon } from '../../src/components/Atoms/FeaturedIcon/FeaturedIcon.js';
import { TextField } from '../../src/components/Molecules/TextField/TextField.js';
import { Tooltip } from '../../src/components/Atoms/Tooltip/Tooltip.js';
import { Accordion } from '../../src/components/Molecules/Accordion/Accordion.js';
import { ActionBox } from '../../src/components/Molecules/ActionBox/ActionBox.js';
import { Autocomplete } from '../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { ChipsGroup } from '../../src/components/Molecules/ChipsGroup/ChipsGroup.js';
import { Media } from '../../src/components/Organisms/Media/Media.js';
import { Placeholder } from '../../src/components/Molecules/Placeholder/Placeholder.js';
import { Ranges } from '../../src/components/Molecules/Ranges/Ranges.js';
import { SearchBar } from '../../src/components/Molecules/SearchBar/SearchBar.js';
import { SearchBox } from '../../src/components/Molecules/SearchBox/SearchBox.js';
import { SplitButton } from '../../src/components/Molecules/SplitButton/SplitButton.js';
import { ContentList } from '../../src/components/Organisms/ContentList/ContentList.js';
import { DataTree } from '../../src/components/Organisms/DataTree/DataTree.js';
import { MediaCard } from '../../src/components/Organisms/MediaCard/MediaCard.js';
import { SimpleTree } from '../../src/components/Organisms/SimpleTree/SimpleTree.js';
import { TreeView } from '../../src/components/Organisms/TreeView/TreeView.js';
import { TextEditor } from '../../src/components/Organisms/TextEditor/TextEditor.js';
import { FiltersWrapper } from '../../src/components/Organisms/Filters/FiltersWrapper/index.js';
import { SortableList } from '../../src/components/Organisms/SortableList/SortableList.js';

/**
 * MUI stamps its own icon test ids (`DeleteOutlineIcon`, …). Those are not ours and are
 * exempt from the `ring-` convention.
 */
const isMuiIconTestId = (id: string): boolean => /Icon$/.test(id);

/**
 * MUI's focus trap (via react-focus-lock, used by Menu/Modal/Popover) renders two hidden
 * boundary nodes with hardcoded `data-testid="sentinelStart"/"sentinelEnd"`. Those are not
 * part of any Ring component's own test id contract and are exempt from the `ring-` convention.
 */
const isFocusTrapSentinelTestId = (id: string): boolean => id === 'sentinelStart' || id === 'sentinelEnd';

// `ContentList` observes its container; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
    public observe = (): void => undefined;

    public unobserve = (): void => undefined;

    public disconnect = (): void => undefined;
} as unknown as typeof ResizeObserver;

const ringTestIds = ({ baseElement }: { baseElement: Element }): string[] =>
    Array.from(baseElement.querySelectorAll('[data-testid]'))
        .map((element) => element.getAttribute('data-testid') as string)
        .filter((id) => !isMuiIconTestId(id) && !isFocusTrapSentinelTestId(id));

const ActionBoxHarness: React.FC<{ dataTestIdSuffix?: string }> = ({ dataTestIdSuffix }) => {
    const anchorEl = useRef<HTMLButtonElement>(null);

    // ActionBox opens on anchor click, and only then mounts its (portalled) popper.
    useEffect(() => anchorEl.current?.click(), []);

    return (
        <>
            <button ref={anchorEl}>anchor</button>
            <ActionBox
                anchorEl={anchorEl}
                dataTestIdSuffix={dataTestIdSuffix}
                actions={[{ label: 'Edit', onClick: (): void => undefined }]}
            />
        </>
    );
};

const treeItems = [{ itemId: 'a', label: 'A' }];

const cases: Array<{ name: string; render: (dataTestIdSuffix?: string) => React.JSX.Element }> = [
    { name: 'Accordion', render: (s) => <Accordion label="T" dataTestIdSuffix={s} /> },
    { name: 'ActionBox', render: (s) => <ActionBoxHarness dataTestIdSuffix={s} /> },
    { name: 'Alert', render: (s) => <Alert title="T" dataTestIdSuffix={s} /> },
    {
        name: 'Autocomplete',
        render: (s) => <Autocomplete options={[{ label: 'A', id: 1 }]} labels={{ title: 'T' }} dataTestIdSuffix={s} />,
    },
    { name: 'ChipsGroup', render: (s) => <ChipsGroup chips={[{ label: 'one' }]} dataTestIdSuffix={s} /> },
    {
        name: 'ContentList',
        render: (s) => <ContentList inputData={[{ header: 'H', children: <div>c</div> }]} dataTestIdSuffix={s} />,
    },
    { name: 'DataTree', render: (s) => <DataTree items={treeItems} dataTestIdSuffix={s} /> },
    {
        name: 'EditableText',
        render: (s) => (
            <EditableText text="hello" onSubmit={(): Promise<boolean> => Promise.resolve(true)} dataTestIdSuffix={s} />
        ),
    },
    { name: 'FeaturedIcon', render: (s) => <FeaturedIcon icon={<svg />} dataTestIdSuffix={s} /> },
    { name: 'Media', render: (s) => <Media title="T" dataTestIdSuffix={s} /> },
    { name: 'MediaCard', render: (s) => <MediaCard title="T" dataTestIdSuffix={s} /> },
    { name: 'Placeholder', render: (s) => <Placeholder dataTestIdSuffix={s} /> },
    {
        name: 'Ranges',
        render: (s) => (
            <Ranges
                rangeDefinitions={{ price: { label: 'Price' } }}
                labels={{
                    rangeSelect: 'Range',
                    addRangeButton: 'Add',
                    removeRangeButton: 'Remove',
                    fromInput: 'From',
                    toInput: 'To',
                }}
                onChange={(): void => undefined}
                dataTestIdSuffix={s}
            />
        ),
    },
    {
        name: 'SearchBar',
        render: (s) => <SearchBar defaultValue="" searchFunc={(): void => undefined} dataTestIdSuffix={s} />,
    },
    {
        name: 'SearchBox',
        render: (s) => <SearchBox defaultValue="" searchFunc={(): void => undefined} dataTestIdSuffix={s} />,
    },
    { name: 'SimpleTree', render: (s) => <SimpleTree items={treeItems} dataTestIdSuffix={s} /> },
    { name: 'SplitButton', render: (s) => <SplitButton actions={[{ label: 'One' }]} dataTestIdSuffix={s} /> },
    { name: 'TextField', render: (s) => <TextField label="L" dataTestIdSuffix={s} /> },
    {
        name: 'Tooltip',
        render: (s) => (
            <Tooltip title="tip" dataTestIdSuffix={s}>
                <span>child</span>
            </Tooltip>
        ),
    },
    { name: 'TreeView', render: (s) => <TreeView variant="default" items={treeItems} dataTestIdSuffix={s} /> },
    {
        name: 'TextEditor',
        render: (s) => <TextEditor content="hi" onUpdate={(): void => undefined} dataTestIdSuffix={s} />,
    },
    {
        name: 'FiltersWrapper',
        render: (s) => (
            <FiltersWrapper
                label="Filters"
                withClearButton={true}
                clearButtonLabel="Clear"
                onClear={(): void => undefined}
                dataTestIdSuffix={s}
            >
                <div>body</div>
            </FiltersWrapper>
        ),
    },
    {
        name: 'SortableList',
        render: (s) => (
            <SortableList
                items={[{ id: 'x' }]}
                renderItem={(item): React.ReactNode => <div>{String(item.id)}</div>}
                onChange={(): void => undefined}
                dataTestIdSuffix={s}
            />
        ),
    },
];

describe('data-testid conformance', () => {
    describe.each(cases)('$name', ({ render: renderCase }) => {
        it('emits at least one ring- prefixed test id', () => {
            expect(ringTestIds(render(renderCase())).length).toBeGreaterThan(0);
        });

        it('never renders the string "undefined" inside a test id', () => {
            const ids = [...ringTestIds(render(renderCase())), ...ringTestIds(render(renderCase('sfx')))];

            expect(ids.filter((id) => id.includes('undefined'))).toEqual([]);
        });

        it('prefixes every own test id with ring-', () => {
            const ids = ringTestIds(render(renderCase()));

            expect(ids.filter((id) => !id.startsWith('ring-'))).toEqual([]);
        });

        it('emits no test id twice, so getByTestId stays unambiguous', () => {
            const ids = ringTestIds(render(renderCase()));
            const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

            expect(duplicates).toEqual([]);
        });

        it('threads dataTestIdSuffix into every own test id', () => {
            const ids = ringTestIds(render(renderCase('sfx')));

            expect(ids.filter((id) => !id.includes('sfx'))).toEqual([]);
        });

        it('contains no whitespace, so attribute selectors stay valid', () => {
            const ids = ringTestIds(render(renderCase('sfx')));

            expect(ids.filter((id) => /\s/.test(id))).toEqual([]);
        });
    });
});
