import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { fireEvent, act } from '@testing-library/react';
import { Media, MediaProps } from '../../../src/index.js';
import { renderWithTheme } from '../../test-utils/theme.js';

function TestIcon(): React.JSX.Element {
    return <div>test icon</div>;
}

describe('Media', () => {
    global.ResizeObserver = class ResizeObserver {
        public observe = vi.fn();

        public unobserve = vi.fn();

        public disconnect = vi.fn();
    };

    it('Should render correctly', () => {
        const props: MediaProps = {
            image: 'https://placehold.co/600x300/black/white',
            title: 'Image title',
            type: 'Image Type Title',
            statusLabels: [
                {
                    label: 'Label 1',
                    color: 'primary',
                    icon: <TestIcon />,
                },
                {
                    label: 'Label 2, with a longer text',
                    color: 'error',
                    icon: <TestIcon />,
                },
            ],
            bottomTooltips: [
                {
                    title: 'Tooltip text 1',
                    icon: <TestIcon />,
                },
            ],
            actions: [
                {
                    label: 'Action 1',
                    icon: <TestIcon />,
                    onClick: vi.fn(),
                },
            ],
        };

        const { container } = renderWithTheme(<Media {...props} />);
        expect(container).toMatchSnapshot();
    });

    it('Should render icon placeholder when no image, or slotProps.media.src URL is provided', () => {
        const props: MediaProps = {
            title: 'Image title',
            statusLabels: [
                {
                    label: 'Label 1',
                    color: 'primary',
                    icon: <TestIcon />,
                },
            ],
        };

        const { getByTestId } = renderWithTheme(<Media {...props} />);
        expect(getByTestId('ring-media-icon-placeholder')).toBeDefined();
    });

    describe('Full screen', () => {
        const props: MediaProps = {
            image: 'https://placehold.co/600x800/black/white',
            title: 'Image title',
            statusLabels: [
                {
                    label: 'Label 1',
                    color: 'primary',
                    icon: <TestIcon />,
                },
            ],
        };

        it('Should open full screen preview when image is clicked', () => {
            const { getByRole, queryByTestId } = renderWithTheme(<Media {...props} />);

            fireEvent.click(getByRole('img'));

            const element = queryByTestId('image');

            expect(element).toBeDefined();
        });

        it('Should not open full screen preview when disableFullScreenPreview is true', () => {
            const { getByRole, queryByTestId } = renderWithTheme(<Media {...props} disableFullScreenPreview={true} />);

            fireEvent.click(getByRole('img'));

            const element = queryByTestId('image');

            expect(element).toBeNull();
        });
    });

    describe('Component rendering', () => {
        it('should render image element', () => {
            renderWithTheme(<Media image="https://placehold.co/600x300/black/white" title="Image example" />);

            const image = document.querySelector('img');
            expect(image).toBeTruthy();
        });

        it('should render audio element', () => {
            renderWithTheme(
                <Media
                    title="Audio example"
                    slotProps={{
                        media: {
                            component: 'audio',
                            src: 'test-audio.mp3',
                        },
                    }}
                />,
            );

            const audio = document.querySelector('audio');
            expect(audio).toBeTruthy();
            expect(audio?.src).toContain('test-audio.mp3');
        });

        it('should render video element', () => {
            renderWithTheme(
                <Media
                    title="Video example"
                    ratio="16/9"
                    slotProps={{
                        media: {
                            component: 'video',
                            src: 'test-video.mp4',
                        },
                    }}
                />,
            );

            const video = document.querySelector('video');
            expect(video).toBeTruthy();
            expect(video?.src).toContain('test-video.mp4');
        });

        it('should render slots.media instead of the default <CardMedia> when both image and slots.media are provided', () => {
            const { getByTestId } = renderWithTheme(
                <Media
                    title="Custom slot"
                    image="https://placehold.co/600x300/black/white"
                    slots={{
                        media: <div data-testid="custom-media">Custom React node</div>,
                    }}
                />,
            );

            // Custom slot replaces the default render.
            expect(getByTestId('custom-media')).toBeDefined();
            // Default <img> should not be rendered when slots.media is provided.
            expect(document.querySelector('img')).toBeNull();
        });

        it('should render slots.media when height is provided', () => {
            const { getByTestId, container } = renderWithTheme(
                <Media
                    height="300px"
                    slots={{
                        media: <div data-testid="custom-media">Custom React node</div>,
                    }}
                />,
            );

            expect(getByTestId('custom-media')).toBeDefined();
            expect(container.querySelector('img')).toBeNull();
        });
    });

    describe('Caption', () => {
        it('should apply height only to media area when caption is present', () => {
            const { container, getByText } = renderWithTheme(
                <Media
                    height="300px"
                    image="https://placehold.co/600x300/black/white"
                    title="Image title"
                    description="Image description"
                />,
            );

            const figure = container.querySelector('figure') as HTMLElement;
            expect(figure).toBeTruthy();

            const figcaption = getByText('Image title').closest('figcaption');
            expect(figcaption).toBeTruthy();

            const mediaContainer = figcaption?.previousElementSibling as HTMLElement;
            expect(mediaContainer).toBeTruthy();
            expect(getComputedStyle(mediaContainer).height).toBe('300px');

            const card = figure.parentElement as HTMLElement;
            expect(card).toBeTruthy();
            expect(card.style.height).toBe('');
        });

        it.each(['contain', 'cover', 'fill', 'none', 'scale-down'] as const)(
            'should keep 200px media area and apply %s objectFit for 1:1 ratio',
            objectFit => {
                const { container, getByRole, getByText } = renderWithTheme(
                    <Media
                        image="https://placehold.co/600x300/black/white"
                        title="Square image"
                        description="Description"
                        ratio="1/1"
                        height="200px"
                        objectFit={objectFit}
                    />,
                );

                const figcaption = getByText('Square image').closest('figcaption');
                expect(figcaption).toBeTruthy();

                const mediaContainer = figcaption?.previousElementSibling as HTMLElement;
                expect(mediaContainer).toBeTruthy();
                expect(getComputedStyle(mediaContainer).height).toBe('200px');

                const image = getByRole('img');
                expect(getComputedStyle(image).objectFit).toBe(objectFit);

                const figure = container.querySelector('figure') as HTMLElement;
                expect(figure).toBeTruthy();
            },
        );

        it('should use the same default objectFit with and without height', () => {
            const withoutHeight = renderWithTheme(<Media image="https://placehold.co/600x300/black/white" />);
            const imageWithoutHeight = withoutHeight.container.querySelector('img') as HTMLElement;

            expect(imageWithoutHeight).toBeTruthy();
            expect(getComputedStyle(imageWithoutHeight).objectFit).toBe('contain');

            withoutHeight.unmount();

            const withHeight = renderWithTheme(
                <Media image="https://placehold.co/600x300/black/white" height="200px" ratio="1/1" />,
            );
            const imageWithHeight = withHeight.container.querySelector('img') as HTMLElement;

            expect(imageWithHeight).toBeTruthy();
            expect(getComputedStyle(imageWithHeight).objectFit).toBe('contain');
        });

        describe('title', () => {
            it('should render title as plain text when onTitleSubmit is not provided', () => {
                const { getByText } = renderWithTheme(<Media title="Image title" />);
                expect(getByText('Image title')).toBeDefined();
            });

            it('should render EditableText for title when onTitleSubmit is provided', () => {
                const onTitleSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId } = renderWithTheme(<Media title="Image title" onTitleSubmit={onTitleSubmit} />);
                expect(getByTestId('ring-editabletext-title-text')).toBeDefined();
            });

            it('should call onTitleSubmit with the new value when Enter is pressed', async () => {
                const onTitleSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId } = renderWithTheme(<Media title="Original title" onTitleSubmit={onTitleSubmit} />);

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-title-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-title-input'), {
                        target: { value: 'New title' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-title-input'), { key: 'Enter', code: 'Enter' });
                });

                expect(onTitleSubmit).toHaveBeenCalledWith('New title');
            });

            it('should not call onTitleSubmit and revert to original title when Escape is pressed', async () => {
                const onTitleSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId, getByText, queryByText } = renderWithTheme(
                    <Media title="Original title" onTitleSubmit={onTitleSubmit} />,
                );

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-title-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-title-input'), {
                        target: { value: 'New title' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-title-input'), { key: 'Escape', code: 'Escape' });
                });

                expect(onTitleSubmit).not.toHaveBeenCalled();
                expect(getByText('Original title')).toBeDefined();
                expect(queryByText('New title')).toBeNull();
            });

            it('should revert title to original value and report an error when onTitleSubmit rejects', async () => {
                const onTitleSubmit = vi.fn().mockRejectedValue(new Error('Submit failed'));
                const { getByTestId } = renderWithTheme(<Media title="Original title" onTitleSubmit={onTitleSubmit} />);
                const originalConsoleError = global.console.error;
                global.console.error = vi.fn();

                try {
                    await act(() => {
                        fireEvent.click(getByTestId('ring-editabletext-title-edit'));
                    });
                    await act(() => {
                        fireEvent.change(getByTestId('ring-editabletext-title-input'), {
                            target: { value: 'New title' },
                        });
                        fireEvent.keyDown(getByTestId('ring-editabletext-title-input'), {
                            key: 'Enter',
                            code: 'Enter',
                        });
                    });

                    // Edit mode stays open on error; input value is reverted to the original.
                    expect((getByTestId('ring-editabletext-title-input') as HTMLInputElement).value).toBe(
                        'Original title',
                    );
                    expect(global.console.error).toHaveBeenCalled();
                } finally {
                    global.console.error = originalConsoleError;
                }
            });

            it('should keep title editable after submitting an empty value', async () => {
                const onTitleSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId, getByText } = renderWithTheme(
                    <Media title="Original title" onTitleSubmit={onTitleSubmit} />,
                );

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-title-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-title-input'), {
                        target: { value: '' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-title-input'), { key: 'Enter', code: 'Enter' });
                });

                expect(onTitleSubmit).toHaveBeenCalledWith('');
                expect(getByTestId('ring-editabletext-title-text')).toBeDefined();
                expect(getByText('Enter title')).toBeDefined();

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-title-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-title-input'), {
                        target: { value: 'Restored title' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-title-input'), { key: 'Enter', code: 'Enter' });
                });

                expect(onTitleSubmit).toHaveBeenCalledWith('Restored title');
            });

            it('should render custom title placeholder when title is empty', () => {
                const onTitleSubmit = vi.fn().mockResolvedValue(true);
                const { getByText } = renderWithTheme(
                    <Media title="" onTitleSubmit={onTitleSubmit} titlePlaceholder="Add custom title" />,
                );

                expect(getByText('Add custom title')).toBeDefined();
            });
        });

        describe('description', () => {
            it('should render description as plain text when onDescriptionSubmit is not provided', () => {
                const { getByText } = renderWithTheme(<Media title="Title" description="Image description" />);
                expect(getByText('Image description')).toBeDefined();
            });

            it('should render EditableText for description when onDescriptionSubmit is provided', () => {
                const onDescriptionSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId } = renderWithTheme(
                    <Media title="Title" description="Image description" onDescriptionSubmit={onDescriptionSubmit} />,
                );
                expect(getByTestId('ring-editabletext-description-text')).toBeDefined();
            });

            it('should call onDescriptionSubmit with the new value when Enter is pressed', async () => {
                const onDescriptionSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId } = renderWithTheme(
                    <Media
                        title="Title"
                        description="Original description"
                        onDescriptionSubmit={onDescriptionSubmit}
                    />,
                );

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-description-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-description-input'), {
                        target: { value: 'New description' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-description-input'), {
                        key: 'Enter',
                        code: 'Enter',
                    });
                });

                expect(onDescriptionSubmit).toHaveBeenCalledWith('New description');
            });

            it('should not call onDescriptionSubmit and revert to original description when Escape is pressed', async () => {
                const onDescriptionSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId, getByText, queryByText } = renderWithTheme(
                    <Media
                        title="Title"
                        description="Original description"
                        onDescriptionSubmit={onDescriptionSubmit}
                    />,
                );

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-description-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-description-input'), {
                        target: { value: 'New description' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-description-input'), {
                        key: 'Escape',
                        code: 'Escape',
                    });
                });

                expect(onDescriptionSubmit).not.toHaveBeenCalled();
                expect(getByText('Original description')).toBeDefined();
                expect(queryByText('New description')).toBeNull();
            });

            it('should revert description to original value and report an error when onDescriptionSubmit rejects', async () => {
                const onDescriptionSubmit = vi.fn().mockRejectedValue(new Error('Submit failed'));
                const { getByTestId } = renderWithTheme(
                    <Media
                        title="Title"
                        description="Original description"
                        onDescriptionSubmit={onDescriptionSubmit}
                    />,
                );
                const originalConsoleError = global.console.error;
                global.console.error = vi.fn();

                try {
                    await act(() => {
                        fireEvent.click(getByTestId('ring-editabletext-description-edit'));
                    });
                    await act(() => {
                        fireEvent.change(getByTestId('ring-editabletext-description-input'), {
                            target: { value: 'New description' },
                        });
                        fireEvent.keyDown(getByTestId('ring-editabletext-description-input'), {
                            key: 'Enter',
                            code: 'Enter',
                        });
                    });

                    // Edit mode stays open on error; input value is reverted to the original.
                    expect((getByTestId('ring-editabletext-description-input') as HTMLInputElement).value).toBe(
                        'Original description',
                    );
                    expect(global.console.error).toHaveBeenCalled();
                } finally {
                    global.console.error = originalConsoleError;
                }
            });

            it('should keep description editable after submitting an empty value', async () => {
                const onDescriptionSubmit = vi.fn().mockResolvedValue(true);
                const { getByTestId, getByText } = renderWithTheme(
                    <Media title="Title" description="Original description" onDescriptionSubmit={onDescriptionSubmit} />,
                );

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-description-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-description-input'), {
                        target: { value: '' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-description-input'), {
                        key: 'Enter',
                        code: 'Enter',
                    });
                });

                expect(onDescriptionSubmit).toHaveBeenCalledWith('');
                expect(getByTestId('ring-editabletext-description-text')).toBeDefined();
                expect(getByText('Enter description')).toBeDefined();

                await act(() => {
                    fireEvent.click(getByTestId('ring-editabletext-description-edit'));
                });
                await act(() => {
                    fireEvent.change(getByTestId('ring-editabletext-description-input'), {
                        target: { value: 'Restored description' },
                    });
                    fireEvent.keyDown(getByTestId('ring-editabletext-description-input'), {
                        key: 'Enter',
                        code: 'Enter',
                    });
                });

                expect(onDescriptionSubmit).toHaveBeenCalledWith('Restored description');
            });

            it('should render custom description placeholder when description is empty', () => {
                const onDescriptionSubmit = vi.fn().mockResolvedValue(true);
                const { getByText } = renderWithTheme(
                    <Media
                        title="Title"
                        description=""
                        onDescriptionSubmit={onDescriptionSubmit}
                        descriptionPlaceholder="Add custom description"
                    />,
                );

                expect(getByText('Add custom description')).toBeDefined();
            });
        });
    });
});
