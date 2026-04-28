import type { Theme } from '@mui/material';

/**
 * Returns a per-property `sx` function that resolves to the correct typography value
 * based on `theme.typographyMode`.
 *
 * - `rem` mode (default): returns the provided rem value as-is.
 * - `legacy-px` mode: converts rem to px (base 16px), e.g. `'0.75rem'` → `'12px'`.
 *   Intended for apps that still set `html { font-size: 62.5% }` globally (1rem = 10px)
 *   and cannot yet migrate to the standard rem scale.
 *
 * **Important:** per-property functions are only called by MUI for top-level `sx` properties.
 * Inside nested CSS selectors always use immediate invocation: `tv('1rem')(theme)`.
 *
 * @example
 * // ✅ top-level sx property — MUI calls the function directly:
 * sx={{ fontSize: tv('0.75rem') }}
 *
 * // ✅ nested CSS selector — must use immediate invocation:
 * sx={(theme) => ({ '& p': { fontSize: tv('1.25rem')(theme) } })}
 *
 * // ❌ nested CSS selector — per-property function NOT called by MUI:
 * sx={{ '& p': { fontSize: tv('1.25rem') } }}
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
