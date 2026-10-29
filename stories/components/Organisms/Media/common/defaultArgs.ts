import { MediaProps } from '../../../../../src/index.js';
import { getImagePath, TestImage, ImageSize } from '../../../../helpers/imagesData.js';

/** A preview in a side panel. The test photos are 3:2, so a 3:2 frame with `contain` shows them without bars. */
export const MEDIA_WIDTH = 400;

/** `title` is the image's alt text. */
export const photo = (image: TestImage, title: string): Exclude<MediaProps['image'], string | undefined> => ({
    src: getImagePath(image, ImageSize.LARGE),
    thumbnailSrc: getImagePath(image, ImageSize.SMALL),
    title,
});

const defaultArgs: Partial<MediaProps> = {
    image: photo(TestImage.BEACH, 'A person walking a dog on a rocky beach below white cliffs'),
    type: 'Photo',
    // eslint-disable-next-line storybook/no-title-property-in-meta -- `title` is a Media prop, not a Storybook meta title
    title: 'A quiet beach in the early morning',
    description: 'Author / Source',
    ratio: '3/2',
    sx: { width: MEDIA_WIDTH },
};

export default defaultArgs;
