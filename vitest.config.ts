import { defineConfig } from 'vitest/config';
import { sourceAliases } from './sourceAliases.js';

export default defineConfig({
    resolve: {
        alias: sourceAliases,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        // `.claude/worktrees` holds checkouts of other branches of this same repo. Without
        // this entry a run collects their specs too, and `-u` rewrites their snapshots.
        exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/worktrees/**'],
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
