import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { SortableList } from '../../../src/index.js';

interface Item {
    id: string;
    name: string;
}

const ITEMS = [1, 2, 3, 4, 5].map<Item>((num) => ({ id: num.toString(), name: `Value ${num}` }));

describe('SortableList', () => {
    it('Should render correctly', () => {
        const onChange = vi.fn();
        const ItemElement = ({ item }: { item: Item }): React.JSX.Element => (
            <div id={`item-${item.id}`}>{item.name}</div>
        );

        const { container } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                renderItem={(item): React.JSX.Element => <ItemElement item={item} />}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it("Should allow elements with clickable actions in the list's element", () => {
        const onChange = vi.fn();
        const onClick = vi.fn();
        const ItemElement = ({ item }: { item: Item }): React.JSX.Element => (
            <div id={`item-${item.id}`}>
                {item.name}
                <button onClick={(): void => onClick(item.id)}>Click action for {item.id}</button>
            </div>
        );

        const { getByText } = render(
            <SortableList
                items={ITEMS}
                onChange={onChange}
                renderItem={(item): React.JSX.Element => <ItemElement item={item} />}
            />,
        );

        const button = getByText('Click action for 1');
        button.click();

        expect(onClick).toHaveBeenCalledWith('1');
    });

    // FIXME: Test the drag and drop functionality in jsdom
});
