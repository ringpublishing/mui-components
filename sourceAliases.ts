import { fileURLToPath } from 'node:url';

const fromPackages = (relativePath: string): string => fileURLToPath(new URL(`../${relativePath}`, import.meta.url));

/**
 * Vite aliases that resolve the library and the theme to their sources, so Storybook and Vitest load them without a
 * build and pick up every edit. `tsconfig.build.json` maps the library the same way for TS.
 */
export const sourceAliases = [
    { find: /^@ringpublishing\/mui-components$/, replacement: fromPackages('components/src/index.ts') },
    { find: /^@ringpublishing\/mui-components\/icons$/, replacement: fromPackages('components/src/icons/index.ts') },
    {
        find: /^@ringpublishing\/mui-components\/tree-dynamic-loading$/,
        replacement: fromPackages('components/src/treeDynamicLoading.ts'),
    },
    { find: /^@ringpublishing\/mui-theme$/, replacement: fromPackages('theme/src/index.ts') },
    { find: /^@ringpublishing\/mui-theme\/mui-x$/, replacement: fromPackages('theme/src/theme-mui-x/index.ts') },
];
