import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface ConditionalTarget {
    types: string;
    default: string;
}

interface PackageJson {
    main: string;
    types: string;
    exports: Record<string, ConditionalTarget | string>;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = <T>(relativePath: string): T => JSON.parse(readFileSync(join(root, relativePath), 'utf8')) as T;
const pkg = readJson<PackageJson>('package.json');
const hasBuild = existsSync(join(root, 'dist', 'index.js'));

describe('package.json exports', () => {
    it('exposes only the package root, /icons, /tree-dynamic-loading and package.json', () => {
        expect(Object.keys(pkg.exports)).toEqual(['.', './icons', './tree-dynamic-loading', './package.json']);
        expect(pkg.exports['.']).toEqual({ types: './dist/index.d.ts', default: './dist/index.js' });
        expect(pkg.exports['./icons']).toEqual({
            types: './dist/icons/index.d.ts',
            default: './dist/icons/index.js',
        });
        expect(pkg.exports['./tree-dynamic-loading']).toEqual({
            types: './dist/treeDynamicLoading.d.ts',
            default: './dist/treeDynamicLoading.js',
        });
        expect(pkg.exports['./package.json']).toBe('./package.json');
    });

    it('lists the types condition first in every entry', () => {
        // Conditions are matched in object order, so a `types` after `default` is never reached.
        for (const target of Object.values(pkg.exports)) {
            if (typeof target !== 'string') {
                expect(Object.keys(target)).toEqual(['types', 'default']);
            }
        }
    });

    it('keeps the fallbacks for resolvers without exports support on the same files', () => {
        // `moduleResolution: "node"` ignores `exports`: it reads `main` / `types`, and `<subpath>/package.json` for
        // /icons and /tree-dynamic-loading.
        const rootEntry = pkg.exports['.'] as ConditionalTarget;

        expect(posix.normalize(pkg.main)).toBe(posix.normalize(rootEntry.default));
        expect(posix.normalize(pkg.types)).toBe(posix.normalize(rootEntry.types));

        for (const subpath of ['icons', 'tree-dynamic-loading']) {
            const fallback = readJson<{ main: string; types: string }>(`${subpath}/package.json`);
            const entry = pkg.exports[`./${subpath}`] as ConditionalTarget;

            expect(posix.join(subpath, fallback.main)).toBe(posix.normalize(entry.default));
            expect(posix.join(subpath, fallback.types)).toBe(posix.normalize(entry.types));
        }
    });

    // Reads the build output: run `npm run build:library` first, otherwise the test is skipped.
    it.skipIf(!hasBuild)('points every target at a file in dist/ (skipped when dist/ is absent)', () => {
        const targets = Object.values(pkg.exports).flatMap((target) =>
            typeof target === 'string' ? [target] : Object.values(target),
        );

        expect(targets.filter((target) => !existsSync(join(root, target)))).toEqual([]);
    });
});
