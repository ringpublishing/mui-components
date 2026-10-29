import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { fireEvent, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Media, MediaProps } from '../../../src/index.js';
import { WithRingThemeHOC, renderWithTheme } from '../../test-utils/theme.js';

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
        expect(getByTestId('ring-media-icon-placeholder').querySelector('svg.lucide-image')).toBeTruthy();
    });

    it('shows ImageOff when the image fails to load, unlike a missing image', () => {
        const { container, getByTestId } = renderWithTheme(
            <Media image="https://example.invalid/broken.jpg" title="Broken image" />,
        );

        act(() => {
            fireEvent.error(container.querySelector('img') as HTMLImageElement);
        });

        expect(getByTestId('ring-media-icon-placeholder').querySelector('svg.lucide-image-off')).toBeTruthy();
    });

    it.each([
        ['video', 'lucide-video-off'],
        ['audio', 'lucide-file-music'],
    ] as const)('falls back to the placeholder when a %s source fails (%s)', (type, glyph) => {
        const { container, getByTestId } = renderWithTheme(
            <Media
                title="Broken source"
                slotProps={{ media: { component: type, src: 'https://example.invalid/missing' } }}
            />,
        );

        act(() => {
            fireEvent.error(container.querySelector(type) as HTMLMediaElement);
        });

        const placeholder = getByTestId('ring-media-icon-placeholder');

        expect(container.querySelector(type)).toBeNull();
        expect(placeholder.querySelector(`svg.${glyph}`)).toBeTruthy();
    });

    // The CSS of one element: its own class rules, so other tests' styles in the shared sheet do not count.
    const cssOf = (element: Element): string => {
        const className = Array.from(element.classList).find((name) => name.startsWith('css-')) ?? '';
        const css = document.head.textContent ?? '';

        return css
            .split('}')
            .filter((rule) => rule.includes(`.${className}`))
            .join('}');
    };

    it.each([
        ['a dark fill', 'rgb(1, 2, 3)', 'color-scheme:dark'],
        ['a light fill', 'rgb(245, 240, 230)', 'color-scheme:light'],
        ['a palette path', 'grey.900', 'color-scheme:dark'],
        ['no fill', undefined, 'color-scheme:light'],
    ])('paints the native audio player with its frame fill and controls that read on it: %s', (label, fill, scheme) => {
        const { container } = renderWithTheme(
            <Media
                title="Audio"
                slotProps={{
                    media: {
                        component: 'audio',
                        src: 'https://example.invalid/a.mp3',
                        ...(fill && { sx: { backgroundColor: fill } }),
                    },
                }}
            />,
        );

        const css = cssOf(container.querySelector('audio') as HTMLAudioElement);

        expect(css).toContain('::-webkit-media-controls-panel');
        expect(css).toContain(scheme);
    });

    it('keeps the image when the consumer prevents the error, until a failure it does not prevent', () => {
        const fallback = 'https://example.invalid/fallback.jpg';
        // `slotProps.media` takes a `div`, an `audio` and a `video` handler at once, so this one reads a plain element.
        const onError = vi.fn((event: React.SyntheticEvent<HTMLElement>): void => {
            const image = event.currentTarget;

            if (image.getAttribute('src') !== fallback) {
                event.preventDefault();
                image.setAttribute('src', fallback);
            }
        });
        const { container, queryByTestId } = renderWithTheme(
            <Media title="Fallback" image="https://example.invalid/broken.jpg" slotProps={{ media: { onError } }} />,
        );

        act(() => {
            fireEvent.error(container.querySelector('img') as HTMLImageElement);
        });
        expect(container.querySelector('img')?.getAttribute('src')).toBe(fallback);
        expect(queryByTestId('ring-media-icon-placeholder')).toBeNull();

        act(() => {
            fireEvent.error(container.querySelector('img') as HTMLImageElement);
        });
        expect(onError).toHaveBeenCalledTimes(2);
        expect(container.querySelector('img')).toBeNull();
        expect(queryByTestId('ring-media-icon-placeholder')?.querySelector('svg.lucide-image-off')).toBeTruthy();
    });

    it.each(['video', 'audio'] as const)('brings the %s back when a failed source is replaced', (type) => {
        const media = (src: string): React.JSX.Element => (
            <Media title="Changing source" slotProps={{ media: { component: type, src } }} />
        );
        const { container, rerender, queryByTestId } = renderWithTheme(media('https://example.invalid/missing'));

        act(() => {
            fireEvent.error(container.querySelector(type) as HTMLMediaElement);
        });
        expect(container.querySelector(type)).toBeNull();

        // Through the same wrapper, so the Media updates in place instead of mounting afresh.
        rerender(WithRingThemeHOC(media('https://example.invalid/fixed')));

        expect(container.querySelector(type)?.getAttribute('src')).toBe('https://example.invalid/fixed');
        expect(queryByTestId('ring-media-icon-placeholder')).toBeNull();
    });

    it('fills a height box with the placeholder, like an image', () => {
        const { getByTestId } = renderWithTheme(<Media title="No image" height="200px" />);
        const box = getByTestId('ring-media-icon-placeholder').parentElement as HTMLElement;

        expect(getComputedStyle(box).height).toBe('100%');
        expect(cssOf(box)).toContain('aspect-ratio:4/3');
    });

    it("runs the consumer's onLoad and onError and still falls back to the placeholder", () => {
        const onLoad = vi.fn();
        const onError = vi.fn();
        const { container, getByTestId } = renderWithTheme(
            <Media
                title="Broken image"
                image="https://example.invalid/broken.jpg"
                slotProps={{ media: { onLoad, onError } }}
            />,
        );

        act(() => {
            fireEvent.load(container.querySelector('img') as HTMLImageElement);
        });
        expect(onLoad).toHaveBeenCalledTimes(1);

        act(() => {
            fireEvent.error(container.querySelector('img') as HTMLImageElement);
        });
        expect(onError).toHaveBeenCalledTimes(1);
        expect(getByTestId('ring-media-icon-placeholder').querySelector('svg.lucide-image-off')).toBeTruthy();
    });

    describe('Actions button', () => {
        const actions = [{ label: 'Action 1', onClick: vi.fn() }];

        it('is a menu button named "More actions" by default', () => {
            const { getByRole } = renderWithTheme(<Media actions={actions} />);
            const button = getByRole('button', { name: 'More actions' });

            expect(button.getAttribute('aria-haspopup')).toBe('menu');

            fireEvent.click(button);

            expect(button.getAttribute('aria-expanded')).toBe('true');
            expect(button.getAttribute('aria-controls')).toBe(getByRole('menu').id);
        });

        it('takes its name from actionsAriaLabel', () => {
            const { getByRole } = renderWithTheme(<Media actions={actions} actionsAriaLabel="Więcej akcji" />);

            expect(getByRole('button', { name: 'Więcej akcji' })).toBeDefined();
        });

        it('falls back to the default name when actionsAriaLabel is blank', () => {
            const { getByRole } = renderWithTheme(<Media actions={actions} actionsAriaLabel="   " />);

            expect(getByRole('button', { name: 'More actions' })).toBeDefined();
        });
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
            const { getByRole, getByTestId } = renderWithTheme(<Media {...props} />);

            fireEvent.click(getByRole('button', { name: 'Open full-screen preview' }));

            expect(getByTestId('ring-lightbox')).toBeDefined();
        });

        it('Should not open full screen preview when disableFullScreenPreview is true', () => {
            const { getByRole, queryByTestId } = renderWithTheme(<Media {...props} disableFullScreenPreview={true} />);

            fireEvent.click(getByRole('img'));

            expect(queryByTestId('ring-lightbox')).toBeNull();
        });

        it.each([
            { keyName: 'Enter', key: '{Enter}' },
            { keyName: 'Space', key: ' ' },
        ])('Should open full screen preview with $keyName once the image is reached with Tab', async ({ key }) => {
            const user = userEvent.setup();
            const { getByTestId, queryByTestId } = renderWithTheme(<Media {...props} />);

            await user.tab();

            expect(document.activeElement).toBe(getByTestId('ring-media-image'));
            expect(queryByTestId('ring-lightbox')).toBeNull();

            await user.keyboard(key);

            expect(getByTestId('ring-lightbox')).toBeDefined();
        });

        it('Should name the image after its action and keep the alt text', () => {
            const { getByRole } = renderWithTheme(<Media {...props} />);

            const image = getByRole('button', { name: 'Open full-screen preview' });

            expect(image.tagName).toBe('IMG');
            expect(image.getAttribute('tabindex')).toBe('0');
            expect(image.getAttribute('alt')).toBe('Image title');
        });

        it('Should take the accessible name from fullScreenPreviewAriaLabel', () => {
            const { getByRole } = renderWithTheme(<Media {...props} fullScreenPreviewAriaLabel="Powiększ zdjęcie" />);

            expect(getByRole('button', { name: 'Powiększ zdjęcie' })).toBeDefined();
        });

        it('Should keep the image out of the tab order when disableFullScreenPreview is true', async () => {
            const user = userEvent.setup();
            const { getByRole, queryByRole } = renderWithTheme(<Media {...props} disableFullScreenPreview={true} />);

            const image = getByRole('img', { name: 'Image title' });

            expect(queryByRole('button', { name: 'Open full-screen preview' })).toBeNull();
            expect(image.hasAttribute('tabindex')).toBe(false);

            await user.tab();

            expect(document.activeElement).not.toBe(image);
        });

        it('Should not make a video focusable or give it an alt', () => {
            renderWithTheme(
                <Media title="Video example" slotProps={{ media: { component: 'video', src: 'test-video.mp4' } }} />,
            );

            const video = document.querySelector('video') as HTMLVideoElement;

            expect(video.hasAttribute('role')).toBe(false);
            expect(video.hasAttribute('tabindex')).toBe(false);
            expect(video.hasAttribute('aria-label')).toBe(false);
            expect(video.hasAttribute('alt')).toBe(false);
        });

        it('Should not make the image focusable when only slotProps.media.src is given', () => {
            const { getByRole, queryByRole } = renderWithTheme(
                <Media
                    title="Image title"
                    slotProps={{ media: { src: 'https://placehold.co/600x800/black/white' } }}
                />,
            );

            expect(getByRole('img', { name: 'Image title' })).toBeDefined();
            expect(queryByRole('button', { name: 'Open full-screen preview' })).toBeNull();
        });
    });

    describe('Alt text', () => {
        it('Should take the alt text from image.title', () => {
            const { getByTestId } = renderWithTheme(
                <Media
                    image={{ src: 'https://placehold.co/600x300/black/white', title: 'Beach at noon' }}
                    title="Caption"
                />,
            );

            expect(getByTestId('ring-media-image').getAttribute('alt')).toBe('Beach at noon');
        });

        it('Should fall back to title when the image has no title of its own', () => {
            const { getByTestId } = renderWithTheme(
                <Media image={{ src: 'https://placehold.co/600x300/black/white' }} title="Caption" />,
            );

            expect(getByTestId('ring-media-image').getAttribute('alt')).toBe('Caption');
        });

        it('Should leave the click handler off the image while the preview is disabled', () => {
            // Chromium keeps an alt="" image that has a click handler in the accessibility tree.
            const withPreview = renderWithTheme(<Media image="https://placehold.co/600x300/black/white" />);

            expect(withPreview.getByTestId('ring-media-image').onclick).toBeTypeOf('function');

            withPreview.unmount();

            const withoutPreview = renderWithTheme(
                <Media image="https://placehold.co/600x300/black/white" disableFullScreenPreview={true} />,
            );

            expect(withoutPreview.getByTestId('ring-media-image').onclick).toBeNull();
        });

        it('Should render an empty alt when there is no title at all', () => {
            const { getByTestId } = renderWithTheme(<Media image="https://placehold.co/600x300/black/white" />);

            expect(getByTestId('ring-media-image').getAttribute('alt')).toBe('');
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
            (objectFit) => {
                const { container, getByTestId, getByText } = renderWithTheme(
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

                const image = getByTestId('ring-media-image');
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
