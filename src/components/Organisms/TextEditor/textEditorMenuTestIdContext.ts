import { createContext, useContext } from 'react';

/**
 * Carries the owning editor's resolved test id down to the controls passed through
 * `menuControls`. They are rendered as-is, so a context is the only way for a
 * consumer-supplied control to know which editor it belongs to.
 */
const TextEditorMenuTestIdContext = createContext<string | undefined>(undefined);

export const TextEditorMenuTestIdProvider = TextEditorMenuTestIdContext.Provider;

export function useMenuControlDataTestId(explicit: string | undefined, part: string): string | undefined {
    const ownerDataTestId = useContext(TextEditorMenuTestIdContext);

    return explicit ?? (ownerDataTestId ? `${ownerDataTestId}-menu-${part}` : undefined);
}
