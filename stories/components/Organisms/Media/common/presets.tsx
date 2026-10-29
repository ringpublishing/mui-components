import type React from 'react';
import { action } from 'storybook/actions';
import { AlarmClock, Image, Pencil, Snowflake, Star, Trash2 } from 'lucide-react';
import type { MediaProps } from '../../../../../src/index.js';
import { getImagePath, TestImage, ImageSize } from '../../../../helpers/imagesData.js';
import type { Presets } from '../../../../helpers.js';
import { photo } from './defaultArgs.js';

/** Sources the stories share. */
export const BROKEN_IMAGE_URL = 'https://example.invalid/missing-photo.jpg';
export const VIDEO_SRC = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';
export const AUDIO_SRC = 'https://cdn.pixabay.com/audio/2024/03/07/audio_5f609b17c4.mp3';

const photoLabel = (file: string, title: string): string =>
    `{ src: '${file}_large.jpg', thumbnailSrc: '${file}_small.jpg', title: '${title}' }`;

export const IMAGES: Presets<MediaProps['image']> = {
    beach: {
        value: photo(TestImage.BEACH, 'A person walking a dog on a rocky beach below white cliffs'),
        label: photoLabel('beach', 'A person walking a dog on a rocky beach below white cliffs'),
    },
    mountains: {
        value: photo(TestImage.MOUNTAINS, 'Snow-covered mountains above a frozen lake under a dark sky'),
        label: photoLabel('mountains', 'Snow-covered mountains above a frozen lake under a dark sky'),
    },
    forest: {
        value: photo(TestImage.FOREST, 'Tall pine trees seen from below against a pale sky'),
        label: photoLabel('forest', 'Tall pine trees seen from below against a pale sky'),
    },
    url: { value: getImagePath(TestImage.SEA, ImageSize.LARGE), label: "'sea_large.jpg'" },
    broken: { value: BROKEN_IMAGE_URL, label: `'${BROKEN_IMAGE_URL}'` },
    none: { value: undefined, label: 'undefined' },
};

export const STATUS_LABELS: Presets<MediaProps['statusLabels']> = {
    none: { value: undefined, label: 'undefined' },
    one: {
        value: [{ label: 'Main image', color: 'primary', icon: <Star /> }],
        label: "[{ label: 'Main image', color: 'primary', icon: <Star /> }]",
    },
    two: {
        value: [
            { label: 'Label 1', color: 'primary', icon: <AlarmClock /> },
            { label: 'Label 2, with a longer text', color: 'error', icon: <Image /> },
        ],
        label: "[{ label: 'Label 1', color: 'primary', icon: <AlarmClock /> }, { label: 'Label 2, with a longer text', color: 'error', icon: <Image /> }]",
    },
};

/** A handler that logs to the Actions tab; the stories pass it where a real app would act. */
const clicked = (label: string) => (): void => action('actions[].onClick')(label);

export const ACTIONS: Presets<MediaProps['actions']> = {
    none: { value: undefined, label: 'undefined' },
    two: {
        value: [
            { label: 'Action 1', icon: <Snowflake />, onClick: clicked('Action 1') },
            { label: 'Action 2', icon: <AlarmClock />, onClick: clicked('Action 2') },
        ],
        label: "[{ label: 'Action 1', icon: <Snowflake />, onClick }, { label: 'Action 2', icon: <AlarmClock />, onClick }]",
    },
    withDisabled: {
        value: [
            { label: 'Edit', icon: <Pencil />, onClick: clicked('Edit') },
            {
                label: 'Delete',
                icon: <Trash2 />,
                disabled: true,
                disabledReason: 'You cannot delete an image used in a published article',
                onClick: clicked('Delete'),
            },
        ],
        label: "[{ label: 'Edit', icon: <Pencil />, onClick }, { label: 'Delete', icon: <Trash2 />, disabled: true, disabledReason: '…', onClick }]",
    },
};

export const BOTTOM_TOOLTIPS: Presets<MediaProps['bottomTooltips']> = {
    none: { value: undefined, label: 'undefined' },
    two: {
        value: [
            { title: 'Tooltip text 1', icon: <Snowflake /> },
            { title: 'Tooltip text 2', icon: <AlarmClock /> },
        ],
        label: "[{ title: 'Tooltip text 1', icon: <Snowflake /> }, { title: 'Tooltip text 2', icon: <AlarmClock /> }]",
    },
};

export const HEIGHTS: Presets<MediaProps['height']> = {
    auto: { value: undefined, label: 'undefined' },
    '160px': { value: '160px', label: "'160px'" },
    '200px': { value: '200px', label: "'200px'" },
    '240px': { value: '240px', label: "'240px'" },
};

const submit = (name: string): Presets<MediaProps['onTitleSubmit']> => ({
    off: { value: undefined, label: 'undefined' },
    on: {
        value: (value: string): Promise<boolean> => {
            action(name)(value);

            return Promise.resolve(true);
        },
        label: '(value) => Promise.resolve(true)',
    },
});

export const TITLE_SUBMIT = submit('onTitleSubmit');
export const DESCRIPTION_SUBMIT = submit('onDescriptionSubmit');

const secondsOf = (event: React.SyntheticEvent): number =>
    Math.round((event.currentTarget as HTMLMediaElement).currentTime * 10) / 10;

/**
 * The story's `slotProps.media` with handlers that log what the media element reports; they take the place of the
 * story's own handlers of the same name. `<video>` and `<audio>` report a loaded source with `loadeddata`, not `load`.
 */
export const loggedMedia = (
    media: NonNullable<MediaProps['slotProps']>['media'],
): NonNullable<MediaProps['slotProps']>['media'] => ({
    ...media,
    onLoad: (event): void => action('slotProps.media.onLoad')((event.currentTarget as HTMLMediaElement).currentSrc),
    onLoadedData: (event): void =>
        action('slotProps.media.onLoadedData')((event.currentTarget as HTMLMediaElement).currentSrc),
    onError: (event): void => action('slotProps.media.onError')((event.currentTarget as HTMLMediaElement).currentSrc),
    onPlay: (event): void => action('slotProps.media.onPlay')(`at ${secondsOf(event)} s`),
    onPause: (event): void => action('slotProps.media.onPause')(`at ${secondsOf(event)} s`),
    onEnded: (event): void => action('slotProps.media.onEnded')(`at ${secondsOf(event)} s`),
});
