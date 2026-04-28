import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { fireEvent } from '@testing-library/react';
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
    });
});
