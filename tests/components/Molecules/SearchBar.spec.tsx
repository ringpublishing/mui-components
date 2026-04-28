import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SearchBar } from '../../../src/components/Molecules/SearchBar/SearchBar.js';

describe('SearchBar', () => {
    it('should render correctly', () => {
        const mockProps = {
            defaultValue: '',
            searchFunc: vi.fn(),
            withClearButton: true,
            labels: {
                placeholder: 'Test Placeholder',
            },
        };

        expect(render(<SearchBar {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render children correctly', () => {
        const ChildComponent = (): React.JSX.Element => <div>Test Child</div>;

        const { getByText } = render(
            <SearchBar defaultValue="" searchFunc={vi.fn()}>
                <ChildComponent />
            </SearchBar>,
        );

        expect(getByText('Test Child')).toBeDefined();
    });

    it('should render correctly with sx selector for children stack', () => {
        const ChildComponent = (): React.JSX.Element => <div>Test Child</div>;

        const { container } = render(
            <SearchBar
                defaultValue=""
                searchFunc={vi.fn()}
                sx={{
                    '.ring-search-bar-children-stack': { justifyContent: 'space-between' },
                }}
            >
                <ChildComponent />
                <ChildComponent />
            </SearchBar>,
        );

        expect(container).toMatchSnapshot();
    });
});
