import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Layers } from 'lucide-react';
import { addons, types, useStorybookState } from 'storybook/manager-api';
import { Button, TooltipLinkList, WithTooltip } from 'storybook/internal/components';
import { styled, type StorybookTheme } from 'storybook/theming';
import { PACKAGE_VERSION } from '../../src/version.generated.js';

const ADDON_ID = 'ring-ui/version-menu';
const TOOL_ID = `${ADDON_ID}/tool`;
const SIDEBAR_HOST_ID = 'ring-ui-version-menu';
const INDEX_TIMEOUT_MS = 3000;

const [major, minor] = PACKAGE_VERSION.split('.');
const CURRENT_VERSION = `v${major}.${minor}`;

// Drawn like the sidebar search field above it: same outline, height, radius, and text on the same columns
// (icon at 9px, text at 30px from the field's edge).
const Field = styled.div(({ theme }) => {
    const { appBorderColor, textMutedColor, color } = theme as StorybookTheme;

    return {
        display: 'flex',
        '& > div': {
            flex: 1,
        },
        '& .ring-version-button': {
            width: '100%',
            height: 32,
            gap: 7,
            padding: '0 12px 0 9px',
            justifyContent: 'flex-start',
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            boxShadow: `${appBorderColor} 0 0 0 1px inset`,
            color: textMutedColor,
            fontSize: 13,
            fontWeight: 400,
        },
        '& .ring-version-value': {
            marginLeft: 'auto',
            color: color.defaultText,
        },
        '& .ring-version-button::after': {
            content: '""',
            width: 5,
            height: 5,
            margin: '-3px 0 0 4px',
            borderRight: '1.5px solid currentColor',
            borderBottom: '1.5px solid currentColor',
            transform: 'rotate(45deg)',
        },
    };
});

// 8px under the search field, then a rule that closes the controls off from the first section.
const SidebarRow = styled(Field)(({ theme }) => ({
    marginTop: -8,
    paddingBottom: 16,
    borderBottom: `1px solid ${(theme as StorybookTheme).appBorderColor}`,
}));

const ToolbarField = styled(Field)({
    '& .ring-version-button': {
        width: 'auto',
        height: 28,
    },
    '& .ring-version-icon, & .ring-version-label': {
        display: 'none',
    },
    '& .ring-version-value': {
        marginLeft: 0,
    },
});

interface StorybookIndex {
    entries?: Record<string, unknown>;
}

async function fetchVersionOneEntries(): Promise<Record<string, unknown>> {
    try {
        const response = await fetch(new URL('v1/index.json', window.location.href), {
            signal: AbortSignal.timeout(INDEX_TIMEOUT_MS),
        });

        if (!response.ok) {
            return {};
        }

        const index = (await response.json()) as StorybookIndex;

        return index.entries ?? {};
    } catch {
        return {};
    }
}

// The same entry when 1.19 has it, otherwise the component's docs page, which survives story renames.
function versionOnePath(entries: Record<string, unknown>, storyId?: string, viewMode?: string): string | undefined {
    if (!storyId || !viewMode) {
        return undefined;
    }

    if (entries[storyId]) {
        return `/${viewMode}/${storyId}`;
    }

    const componentDocs = `${storyId.split('--')[0]}--docs`;

    return entries[componentDocs] ? `/docs/${componentDocs}` : undefined;
}

// v1/ is served by the documentation host, not by this build, so it returns 404 on a local Storybook.
async function openVersionOne(storyId: string | undefined, viewMode: string | undefined): Promise<void> {
    const target = new URL('v1/index.html', window.location.href);
    const path = versionOnePath(await fetchVersionOneEntries(), storyId, viewMode);

    if (path) {
        target.searchParams.set('path', path);
    }

    window.location.assign(target.toString());
}

// Storybook has no addon slot in the sidebar, so the menu is portalled in front of the explorer. The sidebar can
// re-render or unmount (mobile drawer), hence the observer that re-attaches the host.
function useSidebarHost(): HTMLElement | null {
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const attach = (): void => {
            const explorer = document.getElementById('storybook-explorer-menu');

            if (!explorer) {
                setHost(null);

                return;
            }

            let element = document.getElementById(SIDEBAR_HOST_ID);

            if (!element) {
                element = document.createElement('div');
                element.id = SIDEBAR_HOST_ID;
            }

            if (element.nextElementSibling !== explorer) {
                explorer.before(element);
            }

            setHost(element);
        };

        const observer = new MutationObserver(attach);

        attach();
        observer.observe(document.body, { childList: true, subtree: true });

        // An empty host would stay in the sidebar's flex column and add a gap of its own.
        return (): void => {
            observer.disconnect();
            document.getElementById(SIDEBAR_HOST_ID)?.remove();
        };
    }, []);

    return host;
}

// A menu rather than Storybook's Select: Select picks the option that receives focus, so arrowing through the
// list would already leave for another version.
function VersionPicker(): React.JSX.Element {
    const { storyId, viewMode } = useStorybookState();

    return (
        <WithTooltip
            trigger="click"
            closeOnOutsideClick={true}
            placement="bottom-start"
            tooltip={({ onHide }): React.JSX.Element => (
                <TooltipLinkList
                    links={[
                        { id: 'current', title: CURRENT_VERSION, center: 'Latest', active: true, onClick: onHide },
                        {
                            id: 'v1',
                            title: 'v1.19',
                            center: 'Previous major',
                            onClick: (): void => {
                                onHide();
                                void openVersionOne(storyId, viewMode);
                            },
                        },
                    ]}
                />
            )}
        >
            <Button
                className="ring-version-button"
                variant="ghost"
                ariaLabel={`Documentation version ${CURRENT_VERSION}`}
            >
                <Layers className="ring-version-icon" size={14} aria-hidden={true} />
                <span className="ring-version-label">Version</span>
                <span className="ring-version-value">{CURRENT_VERSION}</span>
            </Button>
        </WithTooltip>
    );
}

function VersionMenu(): React.JSX.Element {
    const host = useSidebarHost();

    if (host) {
        return createPortal(
            <SidebarRow>
                <VersionPicker />
            </SidebarRow>,
            host,
        );
    }

    return (
        <ToolbarField>
            <VersionPicker />
        </ToolbarField>
    );
}

addons.register(ADDON_ID, () => {
    addons.add(TOOL_ID, {
        type: types.TOOL,
        title: 'Version',
        render: () => <VersionMenu />,
    });
});
