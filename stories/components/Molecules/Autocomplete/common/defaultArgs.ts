import type { AutocompleteProps } from '../../../../../src/index.js';

interface Option {
    label: string;
    id: number;
}

export const options: Option[] = [
    { label: 'Onet', id: 1 },
    { label: 'Fakt', id: 2 },
    { label: 'Komputer świat', id: 3 },
    { label: 'Newsweek', id: 4 },
    { label: 'Forbes', id: 5 },
    { label: 'Business insider', id: 6 },
    { label: 'LabelWithVeryLongTextThatShouldBeBreakToNextLine', id: 7 },
];

export interface OptionWithCaption extends Option {
    caption: string;
}

export const optionsWithCaption: OptionWithCaption[] = [
    { label: 'Onet', id: 1, caption: 'Onet portal' },
    { label: 'Fakt', id: 2, caption: 'Fakt o tym się mówi' },
    { label: 'Komputer świat', id: 3, caption: 'Porozmawiajmy o komputerach / O telefonach / O technologii' },
    { label: 'Newsweek', id: 4, caption: 'Newsweek' },
    { label: 'Forbes', id: 5, caption: 'Pieniądze' },
    { label: 'Business insider', id: 6, caption: 'O pieniądzach' },
];

export interface OptionWithAvatar extends Option {
    avatar: string;
}

export const optionsWithAvatar: OptionWithAvatar[] = [
    { label: 'Onet', id: 1, avatar: 'https://picsum.photos/seed/onet/48' },
    { label: 'Fakt', id: 2, avatar: 'https://picsum.photos/seed/fakt/48' },
    { label: 'Komputer świat', id: 3, avatar: 'https://picsum.photos/seed/komputer/48' },
    { label: 'Newsweek', id: 4, avatar: 'https://picsum.photos/seed/newsweek/48' },
    { label: 'Forbes', id: 5, avatar: 'https://picsum.photos/seed/forbes/48' },
    { label: 'Business insider', id: 6, avatar: 'https://picsum.photos/seed/business/48' },
];

export const defaultSx = { width: 300 };

const defaultArgs: Partial<AutocompleteProps> = {
    options,
    labels: { title: 'search by' },
    sx: defaultSx,
    showRecentlyUsed: false,
    recentlyUsedLimit: 3,
};

export default defaultArgs;

export type { Option };
