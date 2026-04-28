import React from 'react';
import { addons, types, useStorybookState } from 'storybook/manager-api';
import { ToolbarToggle } from './ToolbarToggle.js';

const ADDON_ID = 'ring-ui/dark-mode-switch';
const TOOL_ID = `${ADDON_ID}/tool`;

function DarkModeToggle(): React.JSX.Element | null {
    const state = useStorybookState();

    if (!state.storyId?.startsWith('components-') && !state.storyId?.startsWith('introduction-overview')) {
        return null;
    }

    return (
        <ToolbarToggle
            globalKey="theme"
            onValue="dark"
            offValue="light"
            onLabel="🌙"
            offLabel="☀️"
            onIcon="🌙"
            offIcon="☀️"
            onText="Dark"
            offText="Light"
            activeColor="#1976d2"
        />
    );
}

addons.register(ADDON_ID, () => {
    addons.add(TOOL_ID, {
        type: types.TOOL,
        title: 'Dark Mode',
        render: () => <DarkModeToggle />,
    });
});
