// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = path.join(repoRoot, 'src');
const componentsRoot = path.join(srcRoot, 'components');
const LEVELS = ['Atoms', 'Molecules', 'Organisms', 'Templates'];

const toPosix = (file: string): string => file.split(path.sep).join('/');
const hasIndex = (folder: string): boolean => fs.existsSync(path.join(folder, 'index.ts'));
const subfolders = (dir: string): string[] =>
    fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(dir, entry.name));

// A component folder sits directly under a level (`Atoms/Alert`) or one level deeper inside a grouping folder that has
// no interface of its own (`Atoms/Dates/DatePicker`, `Organisms/Filters/FiltersWrapper`). Deeper folders with an
// index (`LightBox/hooks`) belong to the component above them.
function collectComponentFolders(level: string): string[] {
    return subfolders(level).flatMap((folder) => (hasIndex(folder) ? [folder] : subfolders(folder).filter(hasIndex)));
}

// `Alert/Alert.tsx`, `DatePicker/DatePicker.tsx`: a folder named after a file in it is a component folder even before
// it gets an index.
function collectFoldersNamedAfterAFile(level: string): string[] {
    const namedAfterAFile = (folder: string): boolean =>
        ['.tsx', '.ts'].some((extension) => fs.existsSync(path.join(folder, path.basename(folder) + extension)));

    return subfolders(level).flatMap((folder) => [folder, ...subfolders(folder)].filter(namedAfterAFile));
}

function parse(file: string): ts.SourceFile {
    return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

function specifierOf(statement: ts.Statement): string | undefined {
    return ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : undefined;
}

describe('component folder interfaces', () => {
    const levels = LEVELS.map((level) => path.join(componentsRoot, level));
    const folders = levels
        .flatMap(collectComponentFolders)
        .map((folder) => toPosix(path.relative(componentsRoot, folder)))
        .sort();

    it('finds the component folders', () => {
        expect(folders.length).toBeGreaterThan(30);
    });

    it('every folder named after a file in it has an index.ts', () => {
        const missing = levels
            .flatMap(collectFoldersNamedAfterAFile)
            .filter((folder) => !hasIndex(folder))
            .map((folder) => toPosix(path.relative(componentsRoot, folder)));

        expect(missing, 'A new component folder gets an index.ts that names what it exports.').toEqual([]);
    });

    it('every component index.ts names what it exports', () => {
        const offenders = folders.flatMap((folder) =>
            parse(path.join(componentsRoot, folder, 'index.ts')).statements.flatMap((statement) => {
                const isNamedReExport =
                    ts.isExportDeclaration(statement) &&
                    statement.exportClause !== undefined &&
                    ts.isNamedExports(statement.exportClause) &&
                    specifierOf(statement) !== undefined;

                return isNamedReExport ? [] : [`${folder}/index.ts: ${statement.getText().split('\n')[0]}`];
            }),
        );

        expect(
            offenders,
            'The index.ts of a component folder is its public interface: only `export { … } from` / `export type { … } from` lines, every name spelled out, no `export *`.',
        ).toEqual([]);
    });

    it('src/components/index.ts re-exports exactly the component folder indexes', () => {
        const statements = parse(path.join(componentsRoot, 'index.ts')).statements;
        const notStarReExport = statements.filter(
            (statement) =>
                !ts.isExportDeclaration(statement) || statement.exportClause !== undefined || !specifierOf(statement),
        );
        const targets = statements.flatMap((statement) => {
            const specifier = specifierOf(statement);
            const match = specifier?.match(/^\.\/(.+)\/index\.js$/);

            return match ? [match[1]] : specifier ? [`(not a folder index) ${specifier}`] : [];
        });

        expect(
            notStarReExport.map((statement) => statement.getText().split('\n')[0]),
            "src/components/index.ts only composes the folder interfaces: `export * from './<Level>/<Component>/index.js'` lines, nothing else.",
        ).toEqual([]);
        expect(targets.sort()).toEqual(folders);
    });

    it('src/index.ts names every export apart from the components index', () => {
        const stars = parse(path.join(srcRoot, 'index.ts'))
            .statements.filter((statement) => ts.isExportDeclaration(statement) && statement.exportClause === undefined)
            .map(specifierOf);

        expect(stars).toEqual(['./components/index.js']);
    });
});
