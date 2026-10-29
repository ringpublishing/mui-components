// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Reads hundreds of files synchronously: ~0.1 s alone, but several seconds when the whole suite competes for the CPU.
const FILE_SCAN_TIMEOUT_MS = 30_000;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = path.join(repoRoot, 'src');

// Statements that only declare something. Anything else at the top level runs when the module is evaluated.
const DECLARATION_KINDS = new Set([
    ts.SyntaxKind.ImportDeclaration,
    ts.SyntaxKind.ImportEqualsDeclaration,
    ts.SyntaxKind.ExportDeclaration,
    ts.SyntaxKind.ExportAssignment,
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeAliasDeclaration,
    ts.SyntaxKind.EnumDeclaration,
    ts.SyntaxKind.ModuleDeclaration,
    ts.SyntaxKind.VariableStatement,
    ts.SyntaxKind.EmptyStatement,
]);

const STYLESHEET = /\.(css|scss|sass|less)$/;

// The imported module holds only `declare module` augmentations and compiles to `export {}`.
const TYPE_ONLY_IMPORTS = new Set(['src/theme/theme.tsx → ./muiAugmentation.js']);

function collectSourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return collectSourceFiles(entryPath);
        }

        return /\.tsx?$/.test(entry.name) && !/\.spec\./.test(entry.name) && !entry.name.endsWith('.d.ts')
            ? [entryPath]
            : [];
    });
}

function toPosix(from: string, file: string): string {
    return path.relative(from, file).split(path.sep).join('/');
}

function toDistPath(file: string): string {
    return `./dist/${toPosix(srcRoot, file).replace(/\.tsx?$/, '.js')}`;
}

function collectLocalBindings(source: ts.SourceFile): Set<string> {
    return new Set(
        source.statements.flatMap((statement) => {
            if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
                return [statement.name.text];
            }

            return ts.isVariableStatement(statement)
                ? statement.declarationList.declarations.flatMap((declaration) =>
                      ts.isIdentifier(declaration.name) ? [declaration.name.text] : [],
                  )
                : [];
        }),
    );
}

// `Alert.displayName = 'Alert'` or `SortableList.DragHandle = …` only completes the module's own export: it is kept
// whenever that export is used and is dropped together with it.
function isOwnBindingAssignment(statement: ts.Statement, localBindings: Set<string>): boolean {
    if (!ts.isExpressionStatement(statement) || !ts.isBinaryExpression(statement.expression)) {
        return false;
    }

    const { left, operatorToken } = statement.expression;

    return (
        operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(left) &&
        ts.isIdentifier(left.expression) &&
        localBindings.has(left.expression.text)
    );
}

// Code inside a function runs when the function is called, not when the module loads.
function isFunctionLike(node: ts.Node): boolean {
    return (
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node) ||
        ts.isConstructorDeclaration(node)
    );
}

// `export const x = (window.y = 1)` declares something, but its initializer writes at load time.
function findWritesInInitializers(statement: ts.VariableStatement): ts.Node[] {
    const writes: ts.Node[] = [];

    const visit = (node: ts.Node): void => {
        if (isFunctionLike(node)) {
            return;
        }

        const isAssignment =
            ts.isBinaryExpression(node) &&
            node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
            node.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
        const isIncrement =
            (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
            (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken);

        if (isAssignment || isIncrement || ts.isDeleteExpression(node)) {
            writes.push(node);

            return;
        }

        ts.forEachChild(node, visit);
    };

    statement.declarationList.declarations.forEach((declaration) => {
        if (declaration.initializer) {
            visit(declaration.initializer);
        }
    });

    return writes;
}

function findModuleLevelEffects(file: string): string[] {
    const relativeFile = toPosix(repoRoot, file);
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const localBindings = collectLocalBindings(source);
    const at = (node: ts.Node): string =>
        `${relativeFile}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;

    return source.statements.flatMap((statement) => {
        if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
            const specifier = statement.moduleSpecifier.text;

            if (STYLESHEET.test(specifier)) {
                return [`${at(statement)} — stylesheet import '${specifier}'`];
            }

            if (!statement.importClause && !TYPE_ONLY_IMPORTS.has(`${relativeFile} → ${specifier}`)) {
                return [`${at(statement)} — import for side effects '${specifier}'`];
            }

            return [];
        }

        if (ts.isVariableStatement(statement)) {
            return findWritesInInitializers(statement).map(
                (write) => `${at(write)} — write in a top-level initializer`,
            );
        }

        return DECLARATION_KINDS.has(statement.kind) || isOwnBindingAssignment(statement, localBindings)
            ? []
            : [`${at(statement)} — top-level ${ts.SyntaxKind[statement.kind]}`];
    });
}

describe('package sideEffects', () => {
    const { sideEffects } = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
        sideEffects?: unknown;
    };

    it('should list the modules that keep their side effects', () => {
        expect(Array.isArray(sideEffects), 'package.json must declare "sideEffects" as an array of dist paths').toBe(
            true,
        );
    });

    it(
        'should leave no module-level side effects outside the listed modules',
        () => {
            const declared = new Set(Array.isArray(sideEffects) ? sideEffects : []);
            const offenders = collectSourceFiles(srcRoot)
                .filter((file) => !declared.has(toDistPath(file)))
                .flatMap(findModuleLevelEffects);

            expect(
                offenders,
                'Bundlers drop these statements from consumer builds: package.json "sideEffects" marks every other module as free of side effects. Move the code into a function the module exports, or add its dist path to "sideEffects".',
            ).toEqual([]);
        },
        FILE_SCAN_TIMEOUT_MS,
    );
});
