import { createRequire } from 'node:module';
import { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
// eslint-disable-next-line n/no-extraneous-import -- rollup is a transitive dep via vite; only types used
import type { LoggingFunction, RollupLog } from 'rollup';
import { getCodeEditorStaticDirs, getExtraStaticDir } from 'storybook-addon-code-editor/getStaticDirs';

const require = createRequire(import.meta.url);

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
        // Vite's optional-peer-dep plugin replaces `@tanstack/react-query` with
        // a stub when it sees `peerDependenciesMeta.optional` on this package,
        // even though it may be installed (devDependencies). Force the real
        // module for Storybook when the dep is present so the dynamic chunk
        // can resolve `QueryClient` etc.; if the dep is genuinely missing,
        // skip the alias and let the static path keep working — dynamic-loading
        // stories will then fail at the Suspense boundary, which is the
        // documented "you must install @tanstack/react-query to use loadItems"
        // failure mode.
        let reactQueryPath: string | null = null;

        try {
            reactQueryPath = require.resolve('@tanstack/react-query');
        } catch {
            // not installed — let the optional-peer-dep stub take over
        }

        return mergeConfig(config, {
            resolve: {
                alias: reactQueryPath ? [{ find: /^@tanstack\/react-query$/, replacement: reactQueryPath }] : [],
            },
            optimizeDeps: {
                include: reactQueryPath ? ['@tanstack/react-query'] : [],
            },
            esbuild: {
                keepNames: true,
            },
            build: {
                chunkSizeWarningLimit: 100,
                rollupOptions: {
                    onwarn(warning: RollupLog, warn: LoggingFunction) {
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
