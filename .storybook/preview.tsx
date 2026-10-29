/// <reference types="vite/client" />

import { Box, PaletteMode } from '@mui/material';
import { Preview, ReactRenderer } from '@storybook/react-vite';
import type { ThemeVersion } from '@ringpublishing/mui-theme';
import { ThemeConfig } from '../src/theme/internalTheme.js';
import { enableTreeDynamicLoading } from '../src/treeDynamicLoading.js';
import { ArgTypes, Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs/blocks';
import { setupMonaco } from 'storybook-addon-code-editor';
import type * as Monaco from 'monaco-editor';
import { LicenseInfo } from '@mui/x-license';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import './styles.css';
import { CommonLanguages } from '../src/helpers/commonTypes.js';
import { getStorySourceCode } from '../stories/storySourceRegistry.js';

enableTreeDynamicLoading();
import { AnchoredDocsContainer } from './docs/AnchoredDocsContainer.js';

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
        // Matches the runtime default (`DEFAULT_THEME_VERSION`). Deliberately not a toolbar
        // switch: the two variants stopped being interchangeable at 2.0.0, so flipping one
        // story between them compares the current design against a look that no longer
        // receives updates. Still overridable per URL (`?globals=themeVersion:reference`).
        themeVersion: 'next',
    },

    decorators: [
        (Story, context): ReactRenderer['storyResult'] => {
            LicenseInfo.setLicenseKey(licenseKey);

            const mode = (context.globals.theme ?? 'light') as PaletteMode;
            const language = (context.globals.locale ?? CommonLanguages.enUS) as CommonLanguages;
            const version = (context.globals.themeVersion ?? 'next') as ThemeVersion;

            const isCentered = context.viewMode !== 'docs' && context.parameters?.layout === 'centered';

            return (
                <ThemeConfig mode={mode} language={language} version={version}>
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
            // Disable auto-binding of `on*` props — stories that want action logging
            // should add explicit `action:` to the argType instead.
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
            container: AnchoredDocsContainer,
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
                        'Atomic Design',
                        'Writing Stories',
                        'MCP Server',
                        '*',
                    ],
                    'Design',
                    ['Colors', 'Typography', 'Icons', 'AI color', 'Atomic Design', '*'],
                    'Components',
                    'Migration FAQ',
                    ['Breaking Version Upgrades', ['Docs', '2.0.0', '1.x', '0.x'], '*'],
                    '*',
                ],
            },
        },
    },

    tags: ['autodocs'],
};

export default preview;
