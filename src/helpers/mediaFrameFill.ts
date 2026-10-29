import type { Theme } from '@mui/material';

/**
 * The fill behind a media asset and its placeholder wherever the asset does not cover its frame. It falls back to
 * the app-bar fill when the theme has no `components.media`, and to none when it has no `components` at all.
 */
export function mediaFrameFill(theme: Theme): string | undefined {
    const components: { media?: { backgroundFill?: string }; appBar?: { defaultFill?: string } } | undefined =
        theme.palette.components;

    return components?.media?.backgroundFill ?? components?.appBar?.defaultFill;
}
