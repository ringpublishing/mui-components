import type { Theme } from '@mui/material';

/**
 * Returns a per-property `sx` function that yields `remValue` as-is in the `rem` typography mode
 * and converted to px (base 16px, so `'0.75rem'` → `'12px'`) in the `deprecated-px` mode, for apps
 * with `html { font-size: 62.5% }`. It works at any depth of an `sx` object; call it immediately
 * (`tv('1rem')(theme)`) where a plain value is required, e.g. in `styled()` or a theme override.
 *
 * @example
 * // top-level sx property:
 * sx={{ fontSize: tv('0.75rem') }}
 *
 * // nested CSS selector:
 * sx={{ '& p': { fontSize: tv('1.25rem') } }}
 *
 * // plain value needed (styled, theme overrides):
 * sx={(theme) => ({ '& p': { fontSize: tv('1.25rem')(theme) } })}
 *
 * @param remValue - Target value in rem, e.g. `'0.75rem'`
 */
export function tv(remValue: string): (theme: Theme) => string {
    return (theme: Theme): string => {
        if (theme.typographyMode === 'deprecated-px') {
            return `${parseFloat(remValue) * 16}px`;
        }

        return remValue;
    };
}
