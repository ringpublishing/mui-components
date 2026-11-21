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
        // Pre-bundles the heavy dependencies once per run instead of transforming their
        // modules file by file in every test file.
        deps: {
            optimizer: {
                client: {
                    enabled: true,
                    include: [
                        '@mui/material',
                        '@mui/material/styles',
                        '@mui/x-data-grid',
                        '@mui/x-data-grid-pro',
                        '@mui/x-tree-view',
                        '@mui/x-date-pickers',
                        '@mui/x-date-pickers-pro',
                        'lucide-react',
                        '@emotion/react',
                        '@emotion/styled',
                        'react',
                        'react-dom',
                        'react-dom/client',
                        'react/jsx-runtime',
                        'react/jsx-dev-runtime',
                        '@testing-library/react',
                        'lodash',
                    ],
                },
            },
        },
    },
});
