import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        // The `stories/**/code/*Example.tsx` files import the library the way a consumer would; the same alias
        // as in `.storybook/main.ts` lets a spec render the example a docs page shows.
        alias: [
            {
                find: /^@ringpublishing\/mui-components$/,
                replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            },
            {
                find: /^@ringpublishing\/mui-components\/tree-dynamic-loading$/,
                replacement: fileURLToPath(new URL('./src/treeDynamicLoading.ts', import.meta.url)),
            },
        ],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        // `.claude/worktrees` holds checkouts of other branches of this same repo. Without
        // this entry a run collects their specs too, and `-u` rewrites their snapshots.
        exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', 'mcp-server/**', '**/.claude/worktrees/**'],
        coverage: {
            reporter: ['text', 'json', 'html'],
        },
        server: {
            deps: {
                inline: ['@mui/x-data-grid'],
            },
        },
    },
});
