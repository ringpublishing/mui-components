import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { RocketLaunch } from '@mui/icons-material';
import { ContentList } from '../../../src/components/Organisms/ContentList/ContentList.js';
import { renderWithTheme } from '../../test-utils/theme.js';

// Mock ResizeObserver
class ResizeObserverMock {
    public observe = vi.fn();

    public unobserve = vi.fn();

    public disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock as any;

describe('Components: ContentList', () => {
    const inputData = [
        {
            header: 'Header1',
            additionalHeaderData: <RocketLaunch />,
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

    it('should render listHeader slot with JSX element', () => {
        const { getByText } = renderWithTheme(
            <ContentList
                inputData={inputData}
                listHeader={
                    <div data-testid="list-header">
                        <RocketLaunch />
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
