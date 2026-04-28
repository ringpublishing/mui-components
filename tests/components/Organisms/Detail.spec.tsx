import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, RenderOptions, RenderResult } from '@testing-library/react';
import { Box, ThemeProvider } from '@mui/material';
import { Public, Web } from '@mui/icons-material';

import {
    DescriptionField,
    Detail,
    DetailDescriptionItemFieldDescription,
    DetailDescriptionItemFieldEditable,
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    DetailMain,
    DetailProps,
    EditableField,
    EditableFieldType,
    getCreatedTheme,
} from '../../../src/index.js';

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
                            icon: [<Web key={'0'} />, <Public key={'1'} />],
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

    it('should show placeholder when empty is true', () => {
        const { container, getByText } = renderDetail({ empty: true });

        expect(container).toMatchSnapshot();
        expect(getByText('Select an item to view its details')).toBeDefined();
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
