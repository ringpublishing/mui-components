// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Reads every source file synchronously: fast alone, slower when the whole suite competes for the CPU.
const FILE_SCAN_TIMEOUT_MS = 30_000;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = path.join(repoRoot, 'src');

// Atomic-design levels: a component imports only its own level or a lower one. `internal/` sits between molecules
// and organisms: it may use molecules, and organisms and templates may use it. `helpers/`, `theme/`, `icons/` and
// `types.ts` are below every level. Type-only imports are not a dependency at runtime and are not counted here —
// the lint rule (`@typescript-eslint/no-restricted-imports`, `allowTypeImports`) draws the same line.
const LEVELS: Record<string, number> = { Atoms: 1, Molecules: 2, Organisms: 3, Templates: 4 };
const INTERNAL_MAX_LEVEL = LEVELS.Molecules;

// Package entries are the roots of the graph, not components: they may import anything.
const ENTRIES = ['src/index.ts', 'src/icons/index.ts', 'src/treeDynamicLoading.ts'];

// Cycles that cross a module boundary and are known today. Any other one fails the spec; a cycle inside one
// component folder is that folder's own business.
const ALLOWED_CYCLES = ['components/Organisms/Detail <-> components/Organisms/LightBox <-> components/Organisms/Media'];

const parsedConfig = ts.getParsedCommandLineOfConfigFile(
    path.join(repoRoot, 'tsconfig.build.json'),
    {},
    {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
            throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        },
    },
);

if (!parsedConfig) {
    throw new Error('tsconfig.build.json could not be read');
}

const compilerOptions = parsedConfig.options;

const host = ts.createCompilerHost(compilerOptions);

function collectSourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return collectSourceFiles(entryPath);
        }

        return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [entryPath] : [];
    });
}

function toPosix(file: string): string {
    return path.relative(repoRoot, file).split(path.sep).join('/');
}

function inSrc(file: string): string[] {
    return path.relative(srcRoot, file).split(path.sep);
}

// `components/Atoms`, `components/internal`, `helpers`, `theme`, …
function zoneOf(file: string): { name: string; rank: number | null } {
    const parts = inSrc(file);

    if (parts[0] !== 'components') {
        return { name: parts[0].replace(/\.tsx?$/, ''), rank: 0 };
    }

    if (parts[1] === 'internal') {
        return { name: 'internal', rank: null };
    }

    return { name: parts[1], rank: LEVELS[parts[1]] ?? null };
}

// A module is a component folder (`Atoms/Alert`, `Molecules/Dates/DatePicker`), an `internal/<file or folder>`, or a
// top-level src folder. The nearest ancestor folder that has an index or a file named after it is the component.
function moduleOf(file: string): string {
    const parts = inSrc(file);

    if (parts[0] !== 'components') {
        return parts[0].replace(/\.tsx?$/, '');
    }

    if (parts[1] === 'internal') {
        return `components/internal/${(parts[2] ?? '').replace(/\.tsx?$/, '')}`;
    }

    for (let depth = parts.length - 1; depth >= 2; depth--) {
        const dir = path.join(srcRoot, ...parts.slice(0, depth));
        const name = parts[depth - 1];
        const owns = [`${name}.tsx`, `${name}.ts`, 'index.ts'].some((candidate) =>
            fs.existsSync(path.join(dir, candidate)),
        );

        if (owns) {
            return parts.slice(0, depth).join('/');
        }
    }

    return parts
        .slice(0, 3)
        .join('/')
        .replace(/\.tsx?$/, '');
}

function isUpward(from: string, to: string): boolean {
    const source = zoneOf(from);
    const target = zoneOf(to);

    if (target.rank === null) {
        return false;
    }

    if (source.name === 'internal') {
        return target.rank > INTERNAL_MAX_LEVEL;
    }

    return source.rank !== null && target.rank > source.rank;
}

interface Edge {
    from: string;
    to: string;
    line: number;
}

function collectRuntimeEdges(files: string[]): Edge[] {
    const tracked = new Set(files);

    return files.flatMap((file) => {
        const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

        return source.statements.flatMap((statement) => {
            const isImport = ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement);

            if (!isImport || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
                return [];
            }

            const typeOnly = ts.isImportDeclaration(statement)
                ? statement.importClause?.isTypeOnly === true
                : statement.isTypeOnly;

            if (typeOnly) {
                return [];
            }

            const resolved = ts.resolveModuleName(
                statement.moduleSpecifier.text,
                file,
                compilerOptions,
                host,
            ).resolvedModule;

            if (!resolved || !tracked.has(resolved.resolvedFileName)) {
                return [];
            }

            return [
                {
                    from: file,
                    to: resolved.resolvedFileName,
                    line: source.getLineAndCharacterOfPosition(statement.getStart()).line + 1,
                },
            ];
        });
    });
}

// Tarjan's strongly connected components; only sets of two or more files are returned.
function stronglyConnected(adjacency: Map<string, Set<string>>): string[][] {
    let index = 0;
    const stack: string[] = [];
    const onStack = new Set<string>();
    const indices = new Map<string, number>();
    const lowlink = new Map<string, number>();
    const result: string[][] = [];

    const visit = (node: string): void => {
        indices.set(node, index);
        lowlink.set(node, index);
        index += 1;
        stack.push(node);
        onStack.add(node);

        for (const next of adjacency.get(node) ?? []) {
            if (!indices.has(next)) {
                visit(next);
                lowlink.set(node, Math.min(lowlink.get(node) ?? 0, lowlink.get(next) ?? 0));
            } else if (onStack.has(next)) {
                lowlink.set(node, Math.min(lowlink.get(node) ?? 0, indices.get(next) ?? 0));
            }
        }

        if (lowlink.get(node) === indices.get(node)) {
            const component: string[] = [];
            let current: string | undefined;

            do {
                current = stack.pop();

                if (current === undefined) {
                    break;
                }

                onStack.delete(current);
                component.push(current);
            } while (current !== node);

            if (component.length > 1) {
                result.push(component);
            }
        }
    };

    for (const node of adjacency.keys()) {
        if (!indices.has(node)) {
            visit(node);
        }
    }

    return result;
}

describe('import graph', () => {
    const files = collectSourceFiles(srcRoot);
    const edges = collectRuntimeEdges(files);
    const entries = new Set(ENTRIES.map((entry) => path.join(repoRoot, entry)));

    it('finds the source files', () => {
        expect(files.length).toBeGreaterThan(100);
        expect(edges.length).toBeGreaterThan(100);
    });

    it(
        'imports go down the atomic-design levels, never up',
        () => {
            const upward = edges
                .filter((edge) => !entries.has(edge.from) && isUpward(edge.from, edge.to))
                .map((edge) => `${toPosix(edge.from)}:${edge.line} -> ${toPosix(edge.to)}`);

            expect(
                upward,
                'A lower level may describe a higher one with `import type`, but never run its code.',
            ).toEqual([]);
        },
        FILE_SCAN_TIMEOUT_MS,
    );

    it(
        'helpers, theme, icons and types do not import components',
        () => {
            const offenders = edges
                .filter((edge) => zoneOf(edge.from).rank === 0 && inSrc(edge.to)[0] === 'components')
                .filter((edge) => !entries.has(edge.from))
                .map((edge) => `${toPosix(edge.from)}:${edge.line} -> ${toPosix(edge.to)}`);

            expect(offenders).toEqual([]);
        },
        FILE_SCAN_TIMEOUT_MS,
    );

    it(
        'no import cycle crosses a module boundary except the ones listed',
        () => {
            const adjacency = new Map<string, Set<string>>(files.map((file) => [file, new Set<string>()]));

            for (const edge of edges) {
                adjacency.get(edge.from)?.add(edge.to);
            }

            const cycles = stronglyConnected(adjacency)
                .map((component) => [...new Set(component.map(moduleOf))].sort().join(' <-> '))
                .filter((cycle) => cycle.includes(' <-> '))
                .sort();

            expect(cycles).toEqual(ALLOWED_CYCLES);
        },
        FILE_SCAN_TIMEOUT_MS,
    );
});
