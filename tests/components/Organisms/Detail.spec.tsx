import { afterEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { fireEvent, render, RenderOptions, RenderResult } from '@testing-library/react';
import { Box, ThemeProvider } from '@mui/material';
import { Globe } from 'lucide-react';

import {
    Detail,
    DetailDescriptionItemFieldDescription,
    DetailDescriptionItemFieldEditable,
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    DetailMain,
    DetailProps,
    EditableFieldType,
    getCreatedTheme,
} from '../../../src/index.js';
import { DescriptionField, EditableField } from '../../../src/components/Organisms/Detail/Detail.js';
import { formatDate } from '../../../src/helpers/formatDate.js';

describe('Detail', () => {
    function renderDetail(mockProps: DetailProps, options: RenderOptions = {}): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <Detail {...mockProps} />
            </ThemeProvider>,
            options,
        );
    }

    it('should render correctly', () => {
        const mockProps: DetailProps = {
            main: {
                title: {
                    value: 'Test Title',
                    editable: true,
                    onSubmit: vi.fn(),
                    label: 'Test Label',
                },
                mediaProps: {
                    bottomIcons: [
                        {
                            icon: <div>Test Icon</div>,
                            onClick: vi.fn(),
                            tooltip: 'Test Tooltip',
                        },
                    ],
                    imageFullScreenPreview: true,
                    image: 'url',
                    fullScreenImageUrl: 'fullScreenUrl',
                    ratio: 'fixed',
                },
                onCloseClick: vi.fn(),
            },
            descriptionItems: [
                {
                    sectionTitle: 'Test Section',
                    fields: [
                        {
                            name: 'Test Field',
                            value: 'Test Value',
                        },
                        {
                            name: 'icons',
                            value: '',
                            icon: [<Globe key={'0'} />, <Globe key={'1'} />],
                        },
                        {
                            name: 'Editable Field',
                            value: 'Editable value',
                            type: DetailDescriptionItemFieldType.EDITABLE,
                            onSubmit: vi.fn(),
                        },
                        {
                            name: 'Description Field',
                            value: 'Description value',
                            type: DetailDescriptionItemFieldType.DESCRIPTION,
                            maxLength: 100,
                            showMoreLabel: 'Show More',
                            showLessLabel: 'Show Less',
                        },
                        {
                            name: 'Chips Field',
                            type: DetailDescriptionItemFieldType.CHIPS,
                            value: ['chip1', 'chip2'],
                        },
                    ],
                },
            ],
            bottomActions: [
                {
                    name: 'Test Action',
                    onClick: vi.fn(),
                    icon: <div>Test Icon</div>,
                },
            ],
            slots: {
                afterMain: <Box>Custom slot after main</Box>,
                afterDescriptionItems: <Box>Custom slot after description items</Box>,
                afterBottomActions: <Box>Custom slot after bottom actions</Box>,
            },
        };

        const { container } = renderDetail(mockProps);
        expect(container).toMatchSnapshot();
    });

    it('does not mutate descriptionItems — re-rendering with the same props object keeps values intact', () => {
        const isoDate = '2023-07-27T09:32:09Z';
        const mockProps: DetailProps = {
            descriptionItems: [
                {
                    sectionTitle: 'Test Section',
                    fields: [
                        {
                            name: 'Date formatted',
                            value: isoDate,
                            formatDate: true,
                        },
                        {
                            name: 'List of strings',
                            value: ['string 1', 'string 2'],
                        },
                    ],
                },
            ],
        };

        const theme = getCreatedTheme('light');
        const { rerender, getByText, queryByText } = renderDetail(mockProps);

        rerender(
            <ThemeProvider theme={theme}>
                <Detail {...mockProps} />
            </ThemeProvider>,
        );

        expect(queryByText('Invalid Date')).toBeNull();
        expect(getByText(formatDate(isoDate))).toBeDefined();
        expect(getByText('string 1, string 2')).toBeDefined();
        expect(mockProps.descriptionItems?.[0].fields[0].value).toBe(isoDate);
        expect(mockProps.descriptionItems?.[0].fields[1].value).toEqual(['string 1', 'string 2']);
    });

    it('composes an array sx on the root and keeps the internal defaults underneath', () => {
        const { getByTestId } = renderDetail({
            sx: [
                { padding: '8px' },
                (theme): { color: string } => ({ color: theme.palette.primary.main }),
                { width: '500px' },
            ],
        });

        const root = getComputedStyle(getByTestId('ring-detail'));
        expect(root.padding).toBe('8px');
        expect(root.color).not.toBe('');
        expect(root.width).toBe('500px');
        expect(root.height).toBe('100%');
        expect(root.overflow).toBe('auto');
    });

    it('applies a plain object sx on the root over the internal defaults', () => {
        const { getByTestId } = renderDetail({ sx: { overflow: 'hidden' } });

        const root = getComputedStyle(getByTestId('ring-detail'));
        expect(root.overflow).toBe('hidden');
        expect(root.width).toBe('340px');
    });

    describe('full-screen media props without a thumbnail', () => {
        const fullScreenImageUrl = 'https://example.com/full.jpg';
        const fullScreenWarnings = (warn: MockInstance<typeof console.warn>): unknown[][] =>
            warn.mock.calls.filter(([message]: unknown[]) => String(message).includes('fullScreenImageUrl'));

        afterEach(() => {
            vi.restoreAllMocks();
            vi.unstubAllEnvs();
        });

        it.each([
            { name: 'fullScreenImageUrl', mediaProps: { fullScreenImageUrl } },
            { name: 'imageFullScreenPreview', mediaProps: { imageFullScreenPreview: true } },
        ])('warns in development when only $name is provided', ({ mediaProps }) => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            renderDetail({ main: { mediaProps } });

            expect(fullScreenWarnings(warn)).toHaveLength(1);
            expect(fullScreenWarnings(warn)[0][0]).toContain('pass `main.mediaProps.image` too');
        });

        it.each([
            { name: 'image', mediaProps: { image: 'https://example.com/thumb.jpg' } },
            {
                name: 'slotProps.media.src',
                mediaProps: { slotProps: { media: { src: 'https://example.com/thumb.jpg' } } },
            },
            { name: 'slots.media', mediaProps: { slots: { media: <div /> } } },
        ])('does not warn when $name is provided', ({ mediaProps }) => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            renderDetail({ main: { mediaProps: { ...mediaProps, fullScreenImageUrl, imageFullScreenPreview: true } } });

            expect(fullScreenWarnings(warn)).toHaveLength(0);
        });

        it('does not warn in production', () => {
            vi.stubEnv('NODE_ENV', 'production');
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            renderDetail({ main: { mediaProps: { fullScreenImageUrl } } });

            expect(fullScreenWarnings(warn)).toHaveLength(0);
        });
    });

    describe('bottom icons type warning', () => {
        const image = 'https://example.com/thumb.jpg';
        const icon = { icon: <Globe />, onClick: vi.fn(), tooltip: 'Globe' };
        const chip = { type: 'chip' as const, chip: { label: 'Tag' } };

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it.each([
            { name: 'bottomIcons is not provided', bottomIcons: undefined },
            { name: 'all bottomIcons are icons', bottomIcons: [icon, icon] },
            { name: 'all bottomIcons are chips', bottomIcons: [chip, chip] },
        ])('does not warn when $name', ({ bottomIcons }) => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            renderDetail({ main: { mediaProps: { image, bottomIcons } } });

            expect(warn).not.toHaveBeenCalled();
        });

        it('warns when bottomIcons mixes chip and icon types', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            renderDetail({ main: { mediaProps: { image, bottomIcons: [icon, chip] } } });

            expect(warn).toHaveBeenCalledWith(
                'DetailMainBottomIcons: bottomIcons should be either all of type "chip" or all of type "icon".',
            );
        });
    });

    it('should show placeholder when empty is true', () => {
        const { container, getByText } = renderDetail({ empty: true });

        expect(container).toMatchSnapshot();
        expect(getByText('Select an item to view its details')).toBeDefined();
    });

    it('should show custom placeholder labels when empty is true', () => {
        const { getByRole, getByText } = renderDetail({
            empty: true,
            placeholderLabels: {
                empty: {
                    header: 'No item selected',
                    description: 'Choose one of the entries from the list to inspect its details.',
                    footer: 'Need help? Contact your administrator.',
                },
            },
        });

        expect(getByRole('heading', { level: 6, name: 'No item selected' })).toBeDefined();
        expect(getByText('Choose one of the entries from the list to inspect its details.')).toBeDefined();
        expect(getByText('Need help? Contact your administrator.')).toBeDefined();
    });

    it('should call onCloseClick when close button is clicked', () => {
        const onCloseClick = vi.fn();
        const mockProps: DetailProps = {
            main: {
                mediaProps: {
                    image: 'url',
                    bottomIcons: [],
                },
                title: {
                    value: 'Test Title',
                },
                onCloseClick,
            },
        };

        const { getByRole } = renderDetail(mockProps);
        fireEvent.click(getByRole('button'));
        expect(onCloseClick).toHaveBeenCalled();
    });

    it('should call onClick when bottom action is clicked', () => {
        const onClick = vi.fn();
        const mockProps = {
            main: {
                title: {
                    value: 'Test Title',
                    editable: true,
                    onSubmit: vi.fn(),
                    label: 'Test Label',
                },
            },
            bottomActions: [
                {
                    name: 'Test Action',
                    onClick,
                    icon: <div>Test Icon</div>,
                },
            ],
        };

        const { getByText } = renderDetail(mockProps);
        fireEvent.click(getByText('Test Action'));
        expect(onClick).toHaveBeenCalled();
    });

    it('should call onClick when chip is clicked', () => {
        const onClick = vi.fn();
        const mockProps: DetailProps = {
            descriptionItems: [
                {
                    sectionTitle: 'Test Section',
                    fields: [
                        {
                            name: 'Test Field',
                            value: [
                                {
                                    value: 'Test Chip',
                                    onClick,
                                },
                            ],
                            type: DetailDescriptionItemFieldType.CHIPS,
                        },
                    ],
                },
            ],
        };

        const { getByText } = renderDetail(mockProps);
        fireEvent.click(getByText('Test Chip'));
        expect(onClick).toHaveBeenCalled();
    });

    it('should suppress zoom/download bottom-icons when slots.media is provided alongside image', () => {
        const mockProps: DetailProps = {
            main: {
                title: { value: 'Test Title' },
                mediaProps: {
                    image: 'url',
                    imageFullScreenPreview: true,
                    slots: {
                        media: <div data-testid="custom-media">Custom</div>,
                    },
                },
            },
        };
        const { queryByTestId, getByTestId } = renderDetail(mockProps);

        // Custom slot replaces the default media render.
        expect(getByTestId('custom-media')).toBeDefined();
        // Zoom / download bottom-icons row is suppressed because the slot can host non-image media
        // (e.g. a video player) which the LightBox cannot show — see CHANGELOG 1.3.0.
        expect(queryByTestId('ring-detail-zoom-in-image')).toBeNull();
        expect(queryByTestId('ring-detail-download-image')).toBeNull();
    });

    it('calls handleFullScreenPreview and does not open the built-in LightBox when provided', () => {
        const handleFullScreenPreview = vi.fn();
        const image = 'https://example.com/picture.jpg';
        const { getByTestId, queryByRole } = renderDetail({
            main: {
                title: { value: 'Test Title' },
                mediaProps: {
                    image,
                    imageFullScreenPreview: true,
                    handleFullScreenPreview,
                },
            },
        });

        fireEvent.click(getByTestId('ring-detail-zoom-in-image'));

        // Custom handler receives the resolved image and the built-in LightBox never opens.
        expect(handleFullScreenPreview).toHaveBeenCalledWith(image);
        expect(queryByRole('dialog')).toBeNull();
    });

    it('forwards mediaProps.slotProps.lightBox to the built-in LightBox', () => {
        global.ResizeObserver = class ResizeObserver {
            public observe = vi.fn();

            public unobserve = vi.fn();

            public disconnect = vi.fn();
        };

        const { getByTestId } = renderDetail({
            main: {
                title: { value: 'Test Title' },
                mediaProps: {
                    image: 'https://example.com/picture.jpg',
                    imageFullScreenPreview: true,
                    slotProps: { lightBox: { dataTestIdSuffix: 'from-detail' } },
                },
            },
        });

        fireEvent.click(getByTestId('ring-detail-zoom-in-image'));

        // The forwarded dataTestIdSuffix reaches the built-in LightBox.
        expect(getByTestId('ring-lightbox-from-detail-close')).toBeDefined();
    });

    it('hides the full-screen (zoom) button when enableFullScreenIcon is false', () => {
        const { queryByTestId } = renderDetail({
            main: {
                title: { value: 'Test Title' },
                mediaProps: {
                    image: 'url',
                    imageFullScreenPreview: true,
                    enableFullScreenIcon: false,
                },
            },
        });

        expect(queryByTestId('ring-detail-zoom-in-image')).toBeNull();
    });

    it('hides the download button when enableDownloadIcon is false', () => {
        const { queryByTestId } = renderDetail({
            main: {
                title: { value: 'Test Title' },
                mediaProps: {
                    image: 'url',
                    imageFullScreenPreview: true,
                    enableDownloadIcon: false,
                },
            },
        });

        expect(queryByTestId('ring-detail-download-image')).toBeNull();
    });

    describe('EditableField', () => {
        it('should render correctly', () => {
            const mockProps: DetailDescriptionItemFieldEditable = {
                name: 'Test Field',
                value: 'Test Value',
                onSubmit: vi.fn(),
                layout: DetailDescriptionItemFieldLayout.HORIZONTAL,
                type: DetailDescriptionItemFieldType.EDITABLE,
            };

            const { container } = render(<EditableField {...mockProps} />);
            expect(container).toMatchSnapshot();
        });

        it('should render a select field when fieldType is SELECT', () => {
            const onSubmit = vi.fn().mockResolvedValue(true);
            const mockProps: DetailDescriptionItemFieldEditable = {
                name: 'Test Select Field',
                value: 'option2',
                onSubmit,
                type: DetailDescriptionItemFieldType.EDITABLE,
                fieldType: EditableFieldType.SELECT,
                options: [
                    { value: 'option1', label: 'First Option' },
                    { value: 'option2', label: 'Second Option' },
                    { value: 'option3', label: 'Third Option' },
                ],
            };

            const { getByText, getByRole, getAllByText } = render(
                <ThemeProvider theme={getCreatedTheme('light')}>
                    <EditableField {...mockProps} />
                </ThemeProvider>,
            );

            // Should display the label of the selected option
            expect(getByText('Second Option')).toBeDefined();

            // Click the edit button (find by icon or another attribute)
            const editButton = getByRole('button');
            fireEvent.click(editButton);

            expect(getAllByText('First Option')[0]).toBeDefined();
            expect(getAllByText('Second Option')[0]).toBeDefined();
            expect(getAllByText('Third Option')[0]).toBeDefined();

            // Select a different option
            const thirdOption = getAllByText('Third Option')[0];
            fireEvent.click(thirdOption);

            // Should call onSubmit with the new value
            expect(onSubmit).toHaveBeenCalledWith('option3');
        });
    });

    describe('DescriptionField', () => {
        it('should render correctly', () => {
            const mockProps: DetailDescriptionItemFieldDescription = {
                name: 'Test Field',
                value: 'Test Value',
                type: DetailDescriptionItemFieldType.DESCRIPTION,
                maxLength: 10,
                showMoreLabel: 'Show More',
                showLessLabel: 'Show Less',
            };

            const { container } = render(<DescriptionField {...mockProps} />);
            expect(container).toMatchSnapshot();
        });

        it('should show more/less when the button is clicked', () => {
            const mockProps: DetailDescriptionItemFieldDescription = {
                name: 'Test Field',
                value: 'Test Value that is longer than the maxLength',
                type: DetailDescriptionItemFieldType.DESCRIPTION,
                maxLength: 10,
                showMoreLabel: 'Show More',
                showLessLabel: 'Show Less',
            };

            const { getByText } = render(<DescriptionField {...mockProps} />);
            expect(getByText('Test Value...')).toBeDefined();
            expect(getByText('Show More')).toBeDefined();

            fireEvent.click(getByText('Show More'));
            expect(getByText('Test Value that is longer than the maxLength')).toBeDefined();
            expect(getByText('Show Less')).toBeDefined();

            fireEvent.click(getByText('Show Less'));
            expect(getByText('Test Value...')).toBeDefined();
            expect(getByText('Show More')).toBeDefined();
        });
    });

    describe('DetailMain', () => {
        it('should render properly without media props', () => {
            expect(render(<DetailMain title="Test Title" />).container).toMatchSnapshot();
        });
        it('should have a close button if onCloseClick is set', () => {
            const theme = getCreatedTheme('light');
            const onCloseClick = vi.fn();
            const { container, getByTestId } = render(
                <ThemeProvider theme={theme}>
                    <DetailMain onCloseClick={onCloseClick} />
                </ThemeProvider>,
            );
            expect(container).toMatchSnapshot();

            const closeButton = getByTestId('ring-detail-close');
            closeButton.click();
            expect(onCloseClick).toHaveBeenCalled();
        });
    });
});

describe('Detail: long values', () => {
    const url = 'https://rss.example.com/0ebeedf7-aebc-4f09-8888-37715df857c0.3f2a9c1e5b7d4a6f8e0c2b4d6f8a1c3e.xml';

    function renderField(field: Record<string, unknown>): RenderResult {
        return render(
            <ThemeProvider theme={getCreatedTheme('light')}>
                <Detail
                    descriptionItems={[
                        { sectionTitle: 'Section', fields: [{ name: 'Open RSS', value: url, url, ...field } as never] },
                    ]}
                />
            </ThemeProvider>,
        );
    }

    it('keeps the icon beside the value in one row', () => {
        const { getByRole, getByTestId } = renderField({ icon: <Globe data-testid="field-icon" /> });
        const link = getByRole('link', { name: url });
        const icon = getByTestId('field-icon');

        // The value and the icon wrapper are siblings in one flex row.
        expect(link.parentElement).toBe(icon.parentElement?.parentElement);
        expect(link.textContent).toBe(url);
    });

    it('puts each icon of an array in its own slot in the same row', () => {
        const { getByRole, getByTestId } = renderField({
            icon: [<Globe key="a" data-testid="icon-a" />, <Globe key="b" data-testid="icon-b" />],
        });
        const link = getByRole('link', { name: url });
        const slotA = getByTestId('icon-a').parentElement;
        const slotB = getByTestId('icon-b').parentElement;

        expect(slotA).not.toBe(slotB);
        expect(slotA?.parentElement).toBe(slotB?.parentElement);
        expect(link.parentElement).toBe(slotA?.parentElement?.parentElement);
    });

    it('renders an icon-only field without the empty-value dash', () => {
        const { getByTestId, queryByText } = renderField({
            value: undefined,
            url: undefined,
            icon: <Globe data-testid="field-icon" />,
        });

        expect(getByTestId('field-icon')).toBeTruthy();
        expect(queryByText('-')).toBeNull();
    });

    it('elides the middle of a plain value too', () => {
        const { getByText } = renderField({ url: undefined, truncate: 'middle' });
        const head = getByText(url.slice(0, -12));
        const tail = getByText(url.slice(-12));

        expect(head.parentElement).toBe(tail.parentElement);
        expect(head.parentElement?.getAttribute('aria-label')).toBe(url);
    });

    it('elides the middle of the value and keeps the full value for assistive technology', () => {
        const { getByRole } = renderField({ truncate: 'middle' });
        const link = getByRole('link', { name: url });
        const spans = link.querySelectorAll('span > span');

        expect(spans).toHaveLength(2);
        expect(spans[0].textContent).toBe(url.slice(0, -12));
        expect(spans[1].textContent).toBe(url.slice(-12));
        // The tooltip carries the full value as the accessible name of the elided span.
        expect(link.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe(url);
    });
});
