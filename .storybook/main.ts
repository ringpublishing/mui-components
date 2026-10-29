import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
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

    features: {
        // No story defines a `play` function, so the Interactions panel would only ever be empty.
        interactions: false,
        // Its New / Modified / Related filters count stories changed since the last commit; the published
        // build has no git history, so they would always read 0.
        changeDetection: false,
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
            titlePrefix: 'Design',
            directory: '../stories/design',
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
        // can resolve `QueryClient` etc. It is a devDependency and has to be:
        // `preview.tsx` calls `enableTreeDynamicLoading()`, and without the
        // package the dynamic modules' named imports fail `storybook build`.
        let reactQueryPath: string | null = null;

        try {
            reactQueryPath = require.resolve('@tanstack/react-query');
        } catch {
            // not installed — let the optional-peer-dep stub take over
        }

        // The `stories/**/code/*Example.tsx` files are the snippets shown in the
        // Playground, so they import the library the way a consumer would. These
        // two aliases make them resolvable as real modules as well, so a story
        // can render the snippet it displays instead of keeping a second copy of
        // it. `tsconfig.build.json` already maps the package name for TS.
        const fromRoot = (relativePath: string): string => fileURLToPath(new URL(relativePath, import.meta.url));

        return mergeConfig(config, {
            resolve: {
                alias: [
                    ...(reactQueryPath ? [{ find: /^@tanstack\/react-query$/, replacement: reactQueryPath }] : []),
                    { find: /^@ringpublishing\/mui-components$/, replacement: fromRoot('../src/index.ts') },
                    {
                        find: /^@ringpublishing\/mui-components\/tree-dynamic-loading$/,
                        replacement: fromRoot('../src/treeDynamicLoading.ts'),
                    },
                    { find: /^RingDemoImages$/, replacement: fromRoot('../stories/helpers/imagesData.ts') },
                ],
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
