import { createElement, type ReactElement } from 'react';
import { addons, useStorybookState } from 'storybook/manager-api';
import type { API_HashEntry, API_IndexHash } from 'storybook/internal/types';
import { CURRENT_STORY_WAS_SET, STORY_CHANGED, STORY_PREPARED } from 'storybook/internal/core-events';
import { PACKAGE_VERSION } from '../src/version.generated.js';
import theme from './theme.js';
import './addons/darkModeSwitch.js';
import './addons/languageSwitch.js';

// `new@2.0`, `new@2.1` stay on the entry for the sidebar filter. The badge shows until the viewer opens
// the entry, for the RELEASE_WINDOW newest tagged versions up to the package version, so a reader who
// skipped a release still sees its news next to the current one.
const NEW_TAG = /^new@(\d+)\.(\d+)$/;
const RELEASE_WINDOW = 2;
const SEEN_STORAGE_KEY = 'ring-ui/seen-release-tags';

type Version = [major: number, minor: number];

const versionOf = (tag: string): Version | undefined => {
    const match = NEW_TAG.exec(tag);

    return match ? [Number(match[1]), Number(match[2])] : undefined;
};

const compareVersions = ([aMajor, aMinor]: Version, [bMajor, bMinor]: Version): number =>
    aMajor - bMajor || aMinor - bMinor;

const formatVersion = ([major, minor]: Version): string => `${major}.${minor}`;

const newest = (versions: Version[]): Version | undefined => [...versions].sort(compareVersions).pop();

const [currentMajor, currentMinor] = PACKAGE_VERSION.split('.').map(Number);
const CURRENT_VERSION: Version = [currentMajor, currentMinor];

const loadSeen = (): Set<string> => {
    try {
        return new Set(JSON.parse(localStorage.getItem(SEEN_STORAGE_KEY) ?? '[]') as string[]);
    } catch {
        return new Set();
    }
};

// Badges render from the snapshot taken at load, so whatever is opened during this visit
// keeps its badge until the next one.
const seenAtLoad = loadSeen();

// Keyed by tag as well, so an entry re-tagged for a later release shows its badge again.
const seenKey = (entryId: string, tag: string): string => `${entryId}|${tag}`;

// Counted from the tags, not from version numbers: a minor without news does not push an older one
// out, and the window carries over a major (at 3.0 the previous release is the last 2.x with news).
const windows = new WeakMap<API_IndexHash, Set<string>>();

const releaseWindow = (index: API_IndexHash): Set<string> => {
    const cached = windows.get(index);

    if (cached) return cached;

    const tagged = new Map<string, Version>();

    Object.values(index).forEach((entry) =>
        entry.tags.forEach((tag) => {
            const version = versionOf(tag);

            if (version && compareVersions(version, CURRENT_VERSION) <= 0) tagged.set(formatVersion(version), version);
        }),
    );

    const window = new Set([...tagged.values()].sort(compareVersions).slice(-RELEASE_WINDOW).map(formatVersion));

    windows.set(index, window);

    return window;
};

// The newest unseen version inside the window, of the entry or of anything below it.
const unseenVersion = (entry: API_HashEntry, hash: API_IndexHash, window: Set<string>): Version | undefined => {
    if (entry.type === 'story' || entry.type === 'docs') {
        return newest(
            entry.tags.flatMap((tag) => {
                const version = versionOf(tag);

                return version && window.has(formatVersion(version)) && !seenAtLoad.has(seenKey(entry.id, tag))
                    ? [version]
                    : [];
            }),
        );
    }

    if (entry.type === 'root') return undefined;

    return newest(
        entry.children.flatMap((id) => {
            const child = hash[id];
            const version = child ? unseenVersion(child, hash, window) : undefined;

            return version ? [version] : [];
        }),
    );
};

const badge = (version: Version): ReactElement =>
    createElement(
        'span',
        {
            style: {
                background: '#2e7d32',
                color: '#fff',
                borderRadius: 8,
                padding: '0 5px',
                fontSize: 9,
                fontWeight: 700,
                lineHeight: '14px',
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
            },
        },
        `NEW ${formatVersion(version)}`,
    );

// A component rather than a plain `renderLabel`, so a folder reads the index the sidebar shows:
// `api.resolveStory` ignores the tag filter and would advertise entries the filter hides.
const ReleaseLabel = ({ item }: { item: API_HashEntry }): ReactElement | string => {
    const { index = {}, filteredIndex } = useStorybookState();
    const version = unseenVersion(item, filteredIndex ?? index, releaseWindow(index));

    if (!version) return item.name;

    // The sidebar lets a name break anywhere; wrapping moves a badge that does not fit to its own
    // line instead of squeezing the name until it splits mid-word.
    return createElement(
        'span',
        { style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 2 } },
        item.name,
        badge(version),
    );
};

addons.setConfig({
    theme,
    sidebar: {
        renderLabel: (item) => createElement(ReleaseLabel, { item }),
    },
});

addons.register('ring-ui/release-badges', (api) => {
    const markSeen = (payload: string | { storyId?: string } | undefined): void => {
        const storyId = typeof payload === 'string' ? payload : payload?.storyId;
        const entry = storyId ? api.getData(storyId) : undefined;

        if (!entry) return;

        // Read back before writing: another tab may have saved what it opened since this one loaded.
        const seen = loadSeen();

        // Only the opened entry loses its badge; siblings keep theirs until each is opened.
        // Clicking a component opens its docs, so that clears the docs entry alone.
        const keys = entry.tags
            .filter((tag) => NEW_TAG.test(tag))
            .map((tag) => seenKey(entry.id, tag))
            .filter((key) => !seen.has(key));

        if (keys.length === 0) return;

        keys.forEach((key) => seen.add(key));

        try {
            localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen]));
        } catch {
            // private mode / blocked storage: badges simply stay visible
        }
    };

    api.on(STORY_CHANGED, markSeen);
    api.on(CURRENT_STORY_WAS_SET, markSeen);
});

// A story renders full-bleed (no addons panel) with `parameters: { hidePanel: true }` — for
// presentational pages where Controls/Actions add nothing and the panel only steals
// vertical space. Per-story `parameters.options.showPanel` is unreliable in SB9 (manager state often
// ignores it on first land), so the panel is toggled imperatively once the story's parameters reach
// the manager: STORY_PREPARED fires on every story selection, deep links and refreshes included.
addons.register('ring-ui/auto-hide-panel', (api) => {
    api.on(STORY_PREPARED, (): void => {
        api.togglePanel(api.getCurrentParameter<boolean>('hidePanel') !== true);
    });
});
