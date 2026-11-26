import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { Rocket } from 'lucide-react';
import { ContentList } from '../../../src/components/Organisms/ContentList/ContentList.js';
import { renderWithTheme } from '../../test-utils/theme.js';

describe('Components: ContentList', () => {
    const inputData = [
        {
            header: 'Header1',
            additionalHeaderData: <Rocket />,
            children: <div>Header1 children</div>,
        },
        {
            header: 'Header2',
            children: <div>Header2 children</div>,
        },
        {
            header: 'Header3',
            additionalHeaderData: 23,
            children: <div>Header3 children</div>,
        },
    ];

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const onHeaderClickCallbackMock = vi.fn();
    const scrollIntoViewMock = vi.fn();
    const scrollToMock = vi.fn();
    const getBoundingClientRectMock = vi.fn(
        () =>
            ({
                top: 0,
                bottom: 100,
                left: 0,
                right: 100,
                width: 100,
                height: 100,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            }) as DOMRect,
    );

    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    window.HTMLElement.prototype.scrollTo = scrollToMock;
    window.HTMLElement.prototype.getBoundingClientRect = getBoundingClientRectMock;

    it('should render component', () => {
        const { container } = renderWithTheme(<ContentList inputData={inputData} />);
        expect(container).toMatchSnapshot();
    });

    it('should call scrollTo and onHeaderClick when clicking on left list element', () => {
        const { getAllByText } = render(
            <ContentList inputData={inputData} onHeaderClick={onHeaderClickCallbackMock} />,
        );
        fireEvent.click(getAllByText('Header3')[0]);

        expect(onHeaderClickCallbackMock).toHaveBeenCalledWith(inputData[2], 2);
        // Check if either scrollTo or scrollTop was set (fallback for test environment)
        expect(scrollToMock).toBeCalled();
    });

    it('marks the item of the selected section as the current location', () => {
        const { getByRole } = renderWithTheme(<ContentList inputData={inputData} selectedItemIndex={1} />);

        expect(getByRole('button', { name: 'Header2' }).getAttribute('aria-current')).toBe('location');
        expect(getByRole('button', { name: 'Header1' }).hasAttribute('aria-current')).toBe(false);
    });

    it('keeps the generated data-testid of the navigation items', () => {
        const { getByRole } = renderWithTheme(<ContentList inputData={inputData} />);

        expect(getByRole('button', { name: 'Header2' }).getAttribute('data-testid')).toBe(
            'ring-contentlist-item-1-nav',
        );
    });

    it('should render listHeader slot with JSX element', () => {
        const { getByText } = renderWithTheme(
            <ContentList
                inputData={inputData}
                listHeader={
                    <div data-testid="list-header">
                        <Rocket />
                        <span>Custom Header</span>
                    </div>
                }
            />,
        );
        expect(getByText('Custom Header')).toBeTruthy();
    });

    it('should render listHeader slot with string', () => {
        const { getByText } = renderWithTheme(<ContentList inputData={inputData} listHeader="Simple String Header" />);
        expect(getByText('Simple String Header')).toBeTruthy();
    });

    it('should not render listHeader when not provided', () => {
        const { queryByText } = renderWithTheme(<ContentList inputData={inputData} />);
        expect(queryByText('Custom Header')).toBeNull();
        expect(queryByText('Simple String Header')).toBeNull();
    });

    it('sizes the navigation column by the longest word of its labels, between a quarter and a half of the width', () => {
        const { getByTestId } = renderWithTheme(<ContentList inputData={inputData} listHeader="Sections" />);
        const column = getByTestId('ring-contentlist-nav').parentElement as HTMLElement;
        const { flex, width, minWidth, maxWidth } = getComputedStyle(column);

        expect({ flex, width, minWidth, maxWidth }).toEqual({
            flex: '0 0 auto',
            width: 'min-content',
            minWidth: '25%',
            maxWidth: '50%',
        });
    });

    it('keeps the list header out of the width of the navigation column', () => {
        const { getByText } = renderWithTheme(<ContentList inputData={inputData} listHeader="Sections" />);
        const { width, minWidth } = getComputedStyle(getByText('Sections'));

        expect({ width, minWidth }).toEqual({ width: '0px', minWidth: '100%' });
    });

    it('lets the content column shrink to the width the navigation column leaves', () => {
        const { getByTestId } = renderWithTheme(<ContentList inputData={inputData} />);
        const content = (getByTestId('ring-contentlist-nav').parentElement as HTMLElement).nextElementSibling;
        const { flex, minWidth } = getComputedStyle(content as HTMLElement);

        expect({ flex, minWidth }).toEqual({ flex: '1 1 0px', minWidth: '0' });
    });

    it('should render with default data-testid', () => {
        const { container } = renderWithTheme(<ContentList inputData={inputData} />);
        const element = container.querySelector('[data-testid="ring-contentlist"]');
        expect(element).toBeTruthy();
    });

    it('should render with custom dataTestIdSuffix', () => {
        const { container } = renderWithTheme(<ContentList inputData={inputData} dataTestIdSuffix="custom-suffix" />);
        const element = container.querySelector('[data-testid="ring-contentlist-custom-suffix"]');
        expect(element).toBeTruthy();
    });

    it('should apply custom className', () => {
        const { container } = renderWithTheme(<ContentList inputData={inputData} className="custom-class" />);
        const element = container.querySelector('[data-testid="ring-contentlist"]');
        expect(element?.classList.contains('custom-class')).toBe(true);
    });

    it('should apply custom sx styles', () => {
        const { container } = renderWithTheme(<ContentList inputData={inputData} sx={{ backgroundColor: 'red' }} />);
        const element = container.querySelector('[data-testid="ring-contentlist"]');
        expect(element).toBeTruthy();
    });
});
