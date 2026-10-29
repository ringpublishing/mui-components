/** Accessible name of an icon-only button that opens a menu of further actions. */
export const DEFAULT_MORE_ACTIONS_ARIA_LABEL = 'More actions';

/**
 * Returns `ariaLabel`, or the default name when it is missing or blank: a blank name would leave
 * the icon-only button without an accessible name.
 */
export function resolveMoreActionsAriaLabel(ariaLabel: string | undefined): string {
    return ariaLabel?.trim() ? ariaLabel : DEFAULT_MORE_ACTIONS_ARIA_LABEL;
}
