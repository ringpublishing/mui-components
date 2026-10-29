// Lists every name the package exports, per `exports` entry, as the TypeScript compiler sees it. Run through
// `npm run test:update:exports` it rewrites `tests/package/exports.snapshot.json`; `tests/package/exportsSnapshot.spec.ts`
// compares the live list with that file, so a changed public API fails the test run until the snapshot is updated on
// purpose.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export interface PackageExport {
    /** The `exports` entry the name is reachable from, e.g. `.` or `./icons`. */
    entry: string;
    name: string;
    /** `value` when the name exists at runtime (a merged interface + function counts as a value). */
    kind: 'value' | 'type';
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const SNAPSHOT_PATH = join(root, 'tests', 'package', 'exports.snapshot.json');

// Keep in sync with `exports` in package.json: `tests/package/exports.spec.ts` guards that side.
const ENTRIES: Record<string, string> = {
    '.': 'src/index.ts',
    './icons': 'src/icons/index.ts',
    './tree-dynamic-loading': 'src/treeDynamicLoading.ts',
};

export function collectPackageExports(): PackageExport[] {
    const config = ts.getParsedCommandLineOfConfigFile(
        join(root, 'tsconfig.build.json'),
        {},
        {
            ...ts.sys,
            onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
                throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
            },
        },
    );

    if (!config) {
        throw new Error('[exports-snapshot] tsconfig.build.json could not be parsed');
    }

    const program = ts.createProgram({
        rootNames: Object.values(ENTRIES).map((file) => join(root, file)),
        options: config.options,
    });
    const checker = program.getTypeChecker();

    return Object.entries(ENTRIES)
        .flatMap(([entry, file]) => {
            const source = program.getSourceFile(join(root, file));
            const moduleSymbol = source && checker.getSymbolAtLocation(source);

            if (!moduleSymbol) {
                throw new Error(`[exports-snapshot] ${file} is not a module of the program`);
            }

            return checker.getExportsOfModule(moduleSymbol).map((symbol): PackageExport => {
                const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
                // `export type { X }` erases the binding even when `X` is also a value (a merged interface + function).
                const specifier = symbol.declarations?.find(ts.isExportSpecifier);
                const typeOnly =
                    specifier !== undefined && (specifier.isTypeOnly || specifier.parent.parent.isTypeOnly);
                const isValue = !typeOnly && (target.flags & ts.SymbolFlags.Value) !== 0;

                return { entry, name: symbol.name, kind: isValue ? 'value' : 'type' };
            });
        })
        .sort((a, b) => a.entry.localeCompare(b.entry) || a.name.localeCompare(b.name));
}

export function readExportsSnapshot(): PackageExport[] {
    return JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as PackageExport[];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const packageExports = collectPackageExports();

    writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(packageExports, null, 4)}\n`);
    process.stdout.write(
        `[exports-snapshot] wrote ${packageExports.length} exports to tests/package/exports.snapshot.json\n`,
    );
}
