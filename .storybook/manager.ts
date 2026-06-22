import { addons } from 'storybook/manager-api';
import { CURRENT_STORY_WAS_SET, STORY_CHANGED } from 'storybook/internal/core-events';
import theme from './theme.js';
import './addons/darkModeSwitch.js';
import './addons/languageSwitch.js';

addons.setConfig({
    theme,
});

// Story IDs that should render full-bleed (no addons panel). Overview is a
// presentational catalog — Controls/Actions/Interactions add no value and
// the panel just steals vertical space. Per-story `parameters.options.showPanel`
// is unreliable in SB9 (manager state often ignores it on first land), so we
// toggle imperatively on story navigation events.
const STORIES_WITHOUT_PANEL = new Set<string>([
    'introduction-overview--overview',
    'introduction-typography--typography',
]);

addons.register('ring-ui/auto-hide-panel', (api) => {
    const apply = (payload: string | { storyId?: string } | undefined): void => {
        const storyId = typeof payload === 'string' ? payload : payload?.storyId;

        if (!storyId) return;

        if (STORIES_WITHOUT_PANEL.has(storyId)) {
            api.togglePanel(false);
        } else {
            api.togglePanel(true);
        }
    };

    // STORY_CHANGED fires when navigating between stories; CURRENT_STORY_WAS_SET
    // also fires on initial load (deep-link / refresh). Listen to both so the
    // panel is hidden no matter how the user lands on the story.
    api.on(STORY_CHANGED, apply);
    api.on(CURRENT_STORY_WAS_SET, apply);
});
