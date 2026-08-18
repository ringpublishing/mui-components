import dayjs from 'dayjs';
import { FeatureTooltipProps } from '../../../../../src/index.js';

export const storyEndDate = dayjs().add(1, 'year').toISOString();

const defaultArgs: Partial<FeatureTooltipProps> = {
    message:
        'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form',
    endDate: storyEndDate,
};

export default defaultArgs;
