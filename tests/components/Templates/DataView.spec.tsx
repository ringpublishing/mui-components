import { ThemeProvider, useMediaQuery } from '@mui/material';
import { fireEvent, render, RenderOptions, RenderResult, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataView, DataViewProps, getCreatedTheme, RingDataGrid, RingDrawer } from '../../../src/index.js';

vi.mock('@mui/material', async () => {
    const actual = await vi.importActual('@mui/material');

    return {
        ...actual,
        useMediaQuery: vi.fn(),
    };
});

describe('Component: DataView', () => {
    global.ResizeObserver = class ResizeObserver {
        public observe = vi.fn();

        public unobserve = vi.fn();

        public disconnect = vi.fn();
    };

    function renderDataView(mockProps: DataViewProps, options: RenderOptions = {}): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <DataView {...mockProps} />
            </ThemeProvider>,
            options,
        );
    }

    it('should render correctly with required props', () => {
        const mockProps = {
            slots: {
                main: <div>Grid</div>,
                left: <div>Left Slot</div>,
            },
            slotProps: {
                top: {
                    defaultValue: '',
                    searchFunc: vi.fn(),
                },
            },
        };
        const { container } = renderDataView(mockProps);

        expect(container).toMatchSnapshot();
    });

    it('should update left slot width when leftSlotWidth prop changes', async () => {
        const theme = getCreatedTheme('light');
        const mockProps = {
            slots: {
                main: <div>Grid</div>,
                left: <div data-testid="left-slot-content">Left Slot</div>,
            },
            leftSlotDynamicWidth: {
                enabled: false,
                minWidth: 150,
                maxWidth: 500,
            },
        };

        const { getByTestId, rerender } = render(
            <ThemeProvider theme={theme}>
                <DataView {...mockProps} leftSlotWidth={220} />
            </ThemeProvider>,
        );

        const getLeftSlotContainer = (): HTMLElement => getByTestId('left-slot-content').parentElement as HTMLElement;

        await waitFor(() => {
            expect(getComputedStyle(getLeftSlotContainer()).width).toBe('220px');
        });

        rerender(
            <ThemeProvider theme={theme}>
                <DataView {...mockProps} leftSlotWidth={230} />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(getComputedStyle(getLeftSlotContainer()).width).toBe('230px');
        });
    });

    it('should not render SearchBar when searchBarProps is not passed', () => {
        const mockProps = {
            slots: {
                main: <div>Grid</div>,
            },
        };
        const { queryByTestId } = renderDataView(mockProps);

        expect(queryByTestId('ring-search-bar')).toBeNull();
    });
    it('should not render left and right slots on mobile when drawers are closed', () => {
        const mockProps = {
            slots: {
                main: <div>Grid</div>,
                left: <div>Left Slot</div>,
                right: <div>Right Slot</div>,
            },
            slotProps: {
                top: {
                    defaultValue: '',
                    searchFunc: vi.fn(),
                },
            },
        };

        const useMediaQueryMock = useMediaQuery as ReturnType<typeof vi.fn>;
        useMediaQueryMock.mockReturnValue(true);

        try {
            const { queryByText } = renderDataView(mockProps);

            expect(queryByText('Left Slot')).toBeNull();
            expect(queryByText('Right Slot')).toBeNull();
        } finally {
            useMediaQueryMock.mockReturnValue(undefined);
        }
    });

    it('should call setRightSlotOpen when open right slot icon is clicked', () => {
        const setRightSlotOpenMock = vi.fn();
        const mockProps = {
            slots: {
                main: <div>Grid</div>,
                left: <div>Left Slot</div>,
                right: <div>Right Slot</div>,
            },
            slotProps: {
                top: {
                    defaultValue: '',
                    searchFunc: vi.fn(),
                },
            },
            rightSlotOpen: true,
            setRightSlotOpen: setRightSlotOpenMock,
        };

        const { getByLabelText } = renderDataView(mockProps);

        fireEvent.click(getByLabelText('Close details'));

        expect(setRightSlotOpenMock).toHaveBeenCalledWith(false);
    });

    it('names the top slot actions menu button "More actions" by default', () => {
        const { getByRole } = renderDataView({
            slots: { main: <div>Grid</div> },
            slotProps: { top: { defaultValue: '', searchFunc: vi.fn(), menuActions: [{ label: 'Export' }] } },
        });

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('takes the top slot actions menu button name from menuActionsAriaLabel', () => {
        const { getByRole } = renderDataView({
            slots: { main: <div>Grid</div> },
            slotProps: {
                top: {
                    defaultValue: '',
                    searchFunc: vi.fn(),
                    menuActions: [{ label: 'Export' }],
                    menuActionsAriaLabel: 'View options',
                },
            },
        });

        expect(getByRole('button', { name: 'View options' })).toBeTruthy();
    });

    describe('Left Slot toggle functionality', () => {
        const mockProps = {
            slots: {
                main: <RingDataGrid columns={[]} rows={[]} totalRowCount={0} showRingToolbar={true} />,
                left: <div>Left Slot Component</div>,
                right: <div>Right Slot</div>,
            },
            slotProps: {
                top: {
                    defaultValue: '',
                    searchFunc: vi.fn(),
                },
            },
        };

        it('should render correctly RingDataGrid with RingToolbar and toggle left slot', () => {
            const { container, getByText, getByTestId, queryByText } = renderDataView(mockProps);
            expect(container).toMatchSnapshot();

            expect(getByText('Left Slot Component')).toBeDefined();
            const toggleButton = getByTestId('ring-datatoolbar-toggle-left-slot');

            fireEvent.click(toggleButton);
            expect(queryByText('Left Slot Component')).toBeNull();

            fireEvent.click(toggleButton);
            expect(getByText('Left Slot Component')).toBeDefined();
        });

        it('should not render left slot toggle button when showLeftSlotToggleButton is false', () => {
            const propsWithoutToggle = {
                ...mockProps,
                showLeftSlotToggleButton: false,
            };
            const { queryByTestId } = renderDataView(propsWithoutToggle);

            expect(queryByTestId('ring-datatoolbar-toggle-left-slot')).toBeNull();
        });
    });

    it('should use controlled mobile right slot drawer when props are provided', () => {
        (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(true);

        const onMobileRightSlotOpenMock = vi.fn();
        const mockProps = {
            slots: {
                main: <div>Grid</div>,
                right: <div data-testid="right-slot-content">Right Slot</div>,
            },
            isMobileRightSlotOpen: true,
            onMobileRightSlotOpen: onMobileRightSlotOpenMock,
        };

        const { getByTestId, getByLabelText } = renderDataView(mockProps);

        expect(getByTestId('right-slot-content')).toBeDefined();

        fireEvent.click(getByLabelText('Close'));
        expect(onMobileRightSlotOpenMock).toHaveBeenCalledWith(false);
    });

    describe('Component: RingDrawer', () => {
        it('should render correctly with required props', () => {
            const mockProps = {
                open: true,
                onClose: vi.fn(),
                children: <div>Children</div>,
            };

            const { container } = render(<RingDrawer {...mockProps} />);

            expect(container).toMatchSnapshot();
        });

        it('should call onClose when close icon is clicked', () => {
            const onCloseMock = vi.fn();
            const mockProps = {
                open: true,
                onClose: onCloseMock,
                children: <div>Children</div>,
            };

            const { getByLabelText } = render(<RingDrawer {...mockProps} />);

            fireEvent.click(getByLabelText('Close'));

            expect(onCloseMock).toHaveBeenCalled();
        });
    });
});
