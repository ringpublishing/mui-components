import { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
import { getCodeEditorStaticDirs, getExtraStaticDir } from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig = {
    addons: [
        'storybook-addon-code-editor',
        {
            name: '@storybook/addon-docs',
            options: {
                mdxPluginOptions: {
                    mdxCompileOptions: {
                        remarkPlugins: [remarkGfm],
                    },
                },
            },
        },
    ],

    core: {
        disableTelemetry: true,
        disableWhatsNewNotifications: true,
    },

    framework: {
        name: '@storybook/react-vite',
        options: {},
    },

    stories: [
        {
            titlePrefix: 'Introduction',
            directory: '../stories/introduction',
        },
        {
            titlePrefix: 'Components',
            directory: '../stories/components',
        },
        {
            titlePrefix: 'Migration FAQ',
            directory: '../stories/migrations',
        },
    ],

    staticDirs: [...getCodeEditorStaticDirs(), getExtraStaticDir('monaco-editor/min')],

    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },

    async viteFinal(config) {
        const { mergeConfig } = await import('vite');

        return mergeConfig(config, {
            build: {
                chunkSizeWarningLimit: 100,
                rollupOptions: {
                    onwarn(warning, warn) {
                        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                            return;
                        }

                        warn(warning);
                    },
                },
            },
        });
    },
};

export default config;
