// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { build, type Plugin, type Rollup } from 'vite';
import { describe, expect, it } from 'vitest';

// Bundles the library's own modules: under a second alone, much longer when the whole suite competes for the CPU.
const BUILD_TIMEOUT_MS = 120_000;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = path.join(repoRoot, 'src');
const libraryEntry = path.join(srcRoot, 'index.ts');
const dynamicLoadingEntry = path.join(srcRoot, 'treeDynamicLoading.ts');

const APP_ID = 'virtual:tree-dynamic-loading-app';
const PEER = '@tanstack/react-query';
// Same id and body as Vite 8 gives a missing optional peer (DESCOMP263-65): the id carries the library name, so
// an app's vendor `manualChunks` rule captures it, and evaluating it throws.
const MISSING_PEER_ID = `\0__vite-optional-peer-dep:${PEER}:@ringpublishing/mui-components`;
const MISSING_PEER_MESSAGE = `Could not resolve "${PEER}" imported by "@ringpublishing/mui-components". Is it installed?`;
// The emitted code escapes the quotes of the message, so chunks are matched on a quote-free part of it.
const MISSING_PEER_MARKER = 'Is it installed?';

// An app build drops the entry's exports, so the app renders its trees for them to stay in the bundle.
function appRendering(items: string, imports = ''): string {
    return `${imports}
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { DataTree, SimpleTree } from ${JSON.stringify(libraryEntry)};

const items = ${items};

createRoot(document.getElementById('root')).render([
    createElement(SimpleTree, { key: 'simple', items }),
    createElement(DataTree, { key: 'data', items }),
]);`;
}

interface BundleResult {
    /** Library modules that import `@tanstack/react-query`. */
    peerImporters: string[];
    /** Chunks that contain the throwing stub of the missing peer. */
    chunksWithStub: string[];
    /** Whether the real package ended up in the bundle. */
    bundlesReactQuery: boolean;
    /** The build error, when the build failed. */
    buildError: string | null;
}

// Builds an app with the library grouped into one vendor chunk by `manualChunks`. Without
// `reactQueryInstalled` the peer resolves to Vite 8's throwing stub, with it to the real package (a devDependency).
// Other third-party packages stay external so only the library's own modules are bundled.
async function bundleApp(appSource: string, options: { reactQueryInstalled: boolean }): Promise<BundleResult> {
    const peerImporters: string[] = [];
    const app: Plugin = {
        name: 'tree-dynamic-loading-app',
        enforce: 'pre',
        resolveId(id, importer) {
            if (id === APP_ID) {
                return `\0${APP_ID}`;
            }

            if (id === PEER) {
                peerImporters.push(path.relative(repoRoot, importer ?? ''));

                return options.reactQueryInstalled ? null : MISSING_PEER_ID;
            }

            return null;
        },
        load(id) {
            if (id === `\0${APP_ID}`) {
                return appSource;
            }

            if (id === MISSING_PEER_ID) {
                return `export default {}; throw new Error(${JSON.stringify(MISSING_PEER_MESSAGE)});`;
            }

            return null;
        },
    };

    let output: Rollup.RollupOutput;

    try {
        output = (await build({
            configFile: false,
            root: repoRoot,
            logLevel: 'silent',
            plugins: [app],
            build: {
                write: false,
                minify: false,
                rollupOptions: {
                    input: APP_ID,
                    external: (id) =>
                        id !== APP_ID &&
                        id !== PEER &&
                        !id.startsWith('\0') &&
                        !id.startsWith('.') &&
                        !path.isAbsolute(id),
                    output: {
                        manualChunks: (id) =>
                            id.startsWith(srcRoot) || id.includes('@ringpublishing/mui-components')
                                ? 'ui-vendor'
                                : undefined,
                    },
                },
            },
        })) as Rollup.RollupOutput;
    } catch (error) {
        return { peerImporters, chunksWithStub: [], bundlesReactQuery: false, buildError: String(error) };
    }

    const chunks = output.output.filter((file): file is Rollup.OutputChunk => file.type === 'chunk');

    return {
        peerImporters,
        chunksWithStub: chunks.filter((chunk) => chunk.code.includes(MISSING_PEER_MARKER)).map((chunk) => chunk.name),
        bundlesReactQuery: chunks.some((chunk) =>
            Object.keys(chunk.modules).some((id) => id.includes('/node_modules/@tanstack/react-query/')),
        ),
        buildError: null,
    };
}

const STATIC_ITEMS = `[{ itemId: 'a', label: 'A', items: [{ itemId: 'b', label: 'B' }] }]`;
const DYNAMIC_ITEMS = `[{ itemId: 'a', label: 'A', loadItems: async () => [] }]`;
const OPT_IN = `import { enableTreeDynamicLoading } from ${JSON.stringify(dynamicLoadingEntry)};\nenableTreeDynamicLoading();`;
const ONLY_DYNAMIC_MODULES = /(Dynamic\.tsx|treeQueryClient\.ts)$/;

describe('app build with the library in a vendor chunk', () => {
    describe('@tanstack/react-query not installed', () => {
        it(
            'static trees never reference the package, so the throwing stub stays out of the bundle',
            async () => {
                const result = await bundleApp(appRendering(STATIC_ITEMS), { reactQueryInstalled: false });

                expect(result).toEqual({
                    peerImporters: [],
                    chunksWithStub: [],
                    bundlesReactQuery: false,
                    buildError: null,
                });
            },
            BUILD_TIMEOUT_MS,
        );

        it(
            'enabling dynamic loading reaches the package only through the dynamic modules, and fails the build',
            async () => {
                const result = await bundleApp(appRendering(DYNAMIC_ITEMS, OPT_IN), { reactQueryInstalled: false });

                // Proves the static case above would catch a reference: through the entry, the stub is reached.
                expect(result.peerImporters.length).toBeGreaterThan(0);
                expect(result.peerImporters.every((importer) => ONLY_DYNAMIC_MODULES.test(importer))).toBe(true);
                // Rollup (Vite ≤ 7) rejects the named imports from the stub, as documented for this setup; Vite 8 only
                // warns and the app fails when the stub is evaluated.
                expect(result.buildError).toMatch(/is not exported by/);
            },
            BUILD_TIMEOUT_MS,
        );
    });

    describe('@tanstack/react-query installed', () => {
        it(
            'static trees leave the package out of the bundle',
            async () => {
                const result = await bundleApp(appRendering(STATIC_ITEMS), { reactQueryInstalled: true });

                expect(result).toEqual({
                    peerImporters: [],
                    chunksWithStub: [],
                    bundlesReactQuery: false,
                    buildError: null,
                });
            },
            BUILD_TIMEOUT_MS,
        );

        it(
            'enabling dynamic loading bundles the real package',
            async () => {
                const result = await bundleApp(appRendering(DYNAMIC_ITEMS, OPT_IN), { reactQueryInstalled: true });

                expect(result.peerImporters.every((importer) => ONLY_DYNAMIC_MODULES.test(importer))).toBe(true);
                expect(result.chunksWithStub).toEqual([]);
                expect(result.bundlesReactQuery).toBe(true);
                expect(result.buildError).toBeNull();
            },
            BUILD_TIMEOUT_MS,
        );
    });
});

// Every module specifier a file names in a way that can end up in its `.d.ts`: import / export declarations
// (`import type` included) and `import('…')` type queries. Runtime `import()` calls are left out: they don't shape
// the declaration output, and the build above covers them.
function declarationSpecifiers(file: string): string[] {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const specifiers: string[] = [];

    const visit = (node: ts.Node): void => {
        if (
            (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
        ) {
            specifiers.push(node.moduleSpecifier.text);
        }

        if (
            ts.isImportTypeNode(node) &&
            ts.isLiteralTypeNode(node.argument) &&
            ts.isStringLiteral(node.argument.literal)
        ) {
            specifiers.push(node.argument.literal.text);
        }

        ts.forEachChild(node, visit);
    };

    visit(source);

    return specifiers;
}

function resolveSource(fromFile: string, specifier: string): string | null {
    const base = path.resolve(path.dirname(fromFile), specifier.replace(/\.js$/, ''));
    const candidates = [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

describe('package root types', () => {
    it('never reference @tanstack/react-query', () => {
        const visited = new Set<string>();
        const referencing: string[] = [];
        const pending = [libraryEntry];

        while (pending.length > 0) {
            const file = pending.pop() as string;

            if (visited.has(file)) {
                continue;
            }

            visited.add(file);

            for (const specifier of declarationSpecifiers(file)) {
                if (specifier === PEER || specifier.startsWith(`${PEER}/`)) {
                    referencing.push(path.relative(repoRoot, file));
                } else if (specifier.startsWith('.')) {
                    const resolved = resolveSource(file, specifier);

                    if (resolved) {
                        pending.push(resolved);
                    }
                }
            }
        }

        // An app without the optional peer and with `skipLibCheck: false` would fail `tsc` on any of these.
        expect(referencing).toEqual([]);
        expect(visited.size).toBeGreaterThan(100);
    });
});
