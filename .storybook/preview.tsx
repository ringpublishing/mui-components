/// <reference types="vite/client" />

import { Box, PaletteMode } from '@mui/material';
import { Preview, ReactRenderer } from '@storybook/react-vite';
import { ThemeConfig } from '../src/index.js';
import { ArgTypes, Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs/blocks';
import { setupMonaco } from 'storybook-addon-code-editor';
import type * as Monaco from 'monaco-editor';
import { LicenseInfo } from '@mui/x-license';

import './styles.css';
import { CommonLanguages } from '../src/helpers/commonTypes.js';
import { getStorySourceCode } from '../stories/storySourceRegistry.js';

setupMonaco({
    onMonacoLoad: (monaco: typeof Monaco) => {
        // Add type definitions for this library.
        monaco.languages.typescript.typescriptDefaults.addExtraLib('file:///node_modules/@mui/types/index.d.ts');
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
        });
    },
});

const licenseKey = import.meta.env.VITE_MUI_X_LICENSE_KEY ?? '';

const preview: Preview = {
    initialGlobals: {
        theme: 'light',
        locale: CommonLanguages.enUS,
    },

    decorators: [
        (Story, context): ReactRenderer['storyResult'] => {
            LicenseInfo.setLicenseKey(licenseKey);

            const mode = (context.globals.theme ?? 'light') as PaletteMode;
            const language = (context.globals.locale ?? CommonLanguages.enUS) as CommonLanguages;

            const isCentered = context.viewMode !== 'docs' && context.parameters?.layout === 'centered';

            return (
                <ThemeConfig mode={mode} language={language}>
                    <Box
                        sx={{
                            minHeight: context.viewMode === 'docs' ? undefined : '100vh',
                            bgcolor: 'background.default',
                            ...(isCentered && {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 3,
                            }),
                        }}
                    >
                        {context.viewMode !== 'docs' && context.parameters?.customButtons && (
                            <Box sx={{ display: 'flex', gap: 1, padding: '4px 8px' }}>
                                {context.parameters.customButtons}
                            </Box>
                        )}
                        <Story />
                    </Box>
                </ThemeConfig>
            );
        },
    ],
    parameters: {
        actions: {
            // Auto-binding every `on*` callback prop to a Storybook action
            // means components see a function for callbacks the consumer never
            // passed (e.g. `onDragAndDropEnd` is always non-undefined in
            // stories), which breaks any "is the callback present?" gating.
            // Stories that want action logging should add `action:` to the
            // specific argType (or call `action(...)` explicitly in render).
            argTypesRegex: null,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: { disable: true },
        layout: 'fullscreen',
        docs: {
            source: {
                transform: (src: string, storyContext: { id: string }): string =>
                    getStorySourceCode(storyContext.id) ?? src,
            },
            page: () => (
                <>
                    <Title />
                    <Subtitle />
                    <Description />
                    <Primary />
                    <ArgTypes />
                    <Stories includePrimary={false} />
                </>
            ),
        },
        liveCodeEditor: { disable: true },
        options: {
            storySort: {
                order: [
                    'Introduction',
                    [
                        'Docs',
                        'Setup',
                        'Contribution',
                        'Overview',
                        'Typography',
                        'Iconography',
                        'Colors',
                        'Atomic Design',
                        'Writing Stories',
                        '*',
                    ],
                    'Components',
                    '*',
                ],
            },
        },
    },

    tags: ['autodocs'],
};

export default preview;
