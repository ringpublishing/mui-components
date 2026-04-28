import React from 'react';
import { addons, types, useParameter } from 'storybook/manager-api';
import { ToolbarToggle } from './ToolbarToggle.js';

const ADDON_ID = 'ring-ui/language-switch';
const TOOL_ID = `${ADDON_ID}/tool`;

function LanguageToggle(): React.JSX.Element | null {
    const withLanguageSupport = useParameter<boolean>('withLanguageSupport', false);

    if (!withLanguageSupport) {
        return null;
    }

    return (
        <ToolbarToggle
            globalKey="locale"
            onValue="plPL"
            offValue="enUS"
            onLabel="PL"
            offLabel="EN"
            activeColor="#1976d2"
        />
    );
}

addons.register(ADDON_ID, () => {
    addons.add(TOOL_ID, {
        type: types.TOOL,
        title: 'Language',
        render: () => <LanguageToggle />,
        match: ({ storyId }) => Boolean(storyId?.startsWith('components-')),
    });
});
