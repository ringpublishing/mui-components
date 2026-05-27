import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import type { ArgType, Component, Knowledge } from '../src/types.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = join(currentDir, '../..');
const ROOT_DIR = join(MCP_ROOT, '..');
const STORIES_DIR = join(ROOT_DIR, 'stories', 'components');
const OUTPUT_PATH = join(MCP_ROOT, 'data', 'knowledge.json');
const IMPORT_PATH = '@ringpublishing/mui-components';

interface CodeExample {
    fileName: string;
    code: string;
}

interface StoryMeta {
    argTypes: Record<string, ArgType>;
    componentDescription: string;
    stories: string[];
}

function walkDir(directory: string): string[] {
    const entries = readdirSync(directory);
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = join(directory, entry);

        if (statSync(fullPath).isDirectory()) {
            files.push(...walkDir(fullPath));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

function toKebab(value: string): string {
    return value
        .split('/')
        .map((segment) =>
            segment
                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                .replace(/\s+/g, '-')
                .replace(/_/g, '-')
                .toLowerCase(),
        )
        .join('-');
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
    if (
        ts.isAsExpression(expression) ||
        ts.isSatisfiesExpression(expression) ||
        ts.isParenthesizedExpression(expression)
    ) {
        return unwrapExpression(expression.expression);
    }

    return expression;
}

function getPropertyName(name: ts.PropertyName): string | null {
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
        return name.text;
    }

    return null;
}

function getObjectProperty(
    objectLiteral: ts.ObjectLiteralExpression,
    propertyName: string,
): ts.PropertyAssignment | null {
    for (const property of objectLiteral.properties) {
        if (ts.isPropertyAssignment(property) && property.name && getPropertyName(property.name) === propertyName) {
            return property;
        }
    }

    return null;
}

function getObjectLiteralProperty(
    objectLiteral: ts.ObjectLiteralExpression,
    propertyName: string,
): ts.ObjectLiteralExpression | null {
    const property = getObjectProperty(objectLiteral, propertyName);

    if (!property) {
        return null;
    }

    const initializer = unwrapExpression(property.initializer);

    return ts.isObjectLiteralExpression(initializer) ? initializer : null;
}

function evaluateStringExpression(expression: ts.Expression): string | undefined {
    const value = unwrapExpression(expression);

    if (ts.isStringLiteralLike(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
        return value.text;
    }

    if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        const left = evaluateStringExpression(value.left);
        const right = evaluateStringExpression(value.right);

        if (left !== undefined && right !== undefined) {
            return left + right;
        }
    }

    return undefined;
}

function getStringProperty(objectLiteral: ts.ObjectLiteralExpression, propertyName: string): string | undefined {
    const property = getObjectProperty(objectLiteral, propertyName);

    if (!property) {
        return undefined;
    }

    return evaluateStringExpression(property.initializer);
}

function getLiteralValue(expression: ts.Expression): string | number | boolean | undefined {
    const value = unwrapExpression(expression);

    if (ts.isStringLiteralLike(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
        return value.text;
    }

    if (ts.isNumericLiteral(value)) {
        return Number(value.text);
    }

    if (value.kind === ts.SyntaxKind.TrueKeyword) {
        return true;
    }

    if (value.kind === ts.SyntaxKind.FalseKeyword) {
        return false;
    }

    return undefined;
}

function findStoryFile(componentDir: string, storyName: string): string | null {
    const storyDir = join(componentDir, 'stories');

    for (const extension of ['.tsx', '.ts', '.jsx', '.js']) {
        const storyPath = join(storyDir, `${storyName}${extension}`);

        if (existsSync(storyPath)) {
            return storyPath;
        }
    }

    return null;
}

function extractCodeExample(componentDir: string, storyName: string): CodeExample | null {
    const storyPath = findStoryFile(componentDir, storyName);

    if (storyPath) {
        const storyText = readFileSync(storyPath, 'utf8');
        const codeImportMatch = storyText.match(/['"]\.\/code\/([^'"]+)\?raw['"]/);

        if (codeImportMatch) {
            const fileName = codeImportMatch[1];
            const filePath = join(dirname(storyPath), 'code', fileName);

            if (existsSync(filePath)) {
                return {
                    fileName,
                    code: readFileSync(filePath, 'utf8').trim(),
                };
            }
        }
    }

    const fallbackFileNames = [`${storyName}Example.tsx`, `${storyName}ExampleCode.tsx`];

    for (const fileName of fallbackFileNames) {
        const filePath = join(componentDir, 'stories', 'code', fileName);

        if (existsSync(filePath)) {
            return {
                fileName,
                code: readFileSync(filePath, 'utf8').trim(),
            };
        }
    }

    return null;
}

function removeQuickNavigationSection(mdxText: string): string {
    const lines = mdxText.split('\n');
    const result: string[] = [];
    let skip = false;

    for (const line of lines) {
        if (/^##\s+quick navigation\s*$/i.test(line.trim())) {
            skip = true;
            continue;
        }

        if (skip && /^##\s+/.test(line)) {
            skip = false;
        }

        if (!skip) {
            result.push(line);
        }
    }

    return result.join('\n');
}

function removeComponentApiSection(mdxText: string): string {
    const lines = mdxText.split('\n');
    const result: string[] = [];
    let skip = false;

    for (const line of lines) {
        if (/^##\s+component api\s*$/i.test(line.trim())) {
            skip = true;
            continue;
        }

        if (skip && /^##\s+/.test(line)) {
            skip = false;
        }

        if (!skip) {
            result.push(line);
        }
    }

    return result.join('\n');
}

function normalizeMdxWhitespace(mdxText: string): string {
    return mdxText
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function extractMdxText(mdxPath: string): string {
    try {
        return readFileSync(mdxPath, 'utf8');
    } catch {
        return '';
    }
}

function extractMainDescription(mdxText: string): string {
    if (!mdxText) {
        return '';
    }

    const lines = mdxText.split('\n');
    const firstHeadingIndex = lines.findIndex((line) => line.startsWith('# '));

    if (firstHeadingIndex === -1) {
        return '';
    }

    const content: string[] = [];

    for (let i = firstHeadingIndex + 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('## ')) {
            break;
        }

        if (line.startsWith('<') || line.startsWith('import ')) {
            continue;
        }

        content.push(line);
    }

    return (
        content
            .join('\n')
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .find(Boolean) || ''
    );
}

/**
 * Collect top-level object literal declarations (`const x = { ... }`) from a source file.
 */
function collectObjectDeclarations(sourceFile: ts.SourceFile): Map<string, ts.ObjectLiteralExpression> {
    const declarations = new Map<string, ts.ObjectLiteralExpression>();

    for (const statement of sourceFile.statements) {
        if (!ts.isVariableStatement(statement)) {
            continue;
        }

        for (const declaration of statement.declarationList.declarations) {
            if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
                continue;
            }

            const initializer = unwrapExpression(declaration.initializer);

            if (ts.isObjectLiteralExpression(initializer)) {
                declarations.set(declaration.name.text, initializer);
            }
        }
    }

    return declarations;
}

/**
 * Resolve relative imports and collect all object declarations from imported files.
 * Handles ESM `.js` → `.ts` convention.
 */
function resolveImportedDeclarations(
    storiesPath: string,
    sourceFile: ts.SourceFile,
): Map<string, ts.ObjectLiteralExpression> {
    const importedDeclarations = new Map<string, ts.ObjectLiteralExpression>();
    const storiesDir = dirname(storiesPath);

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.moduleSpecifier) {
            continue;
        }

        const moduleSpecifier = ts.isStringLiteral(statement.moduleSpecifier)
            ? statement.moduleSpecifier.text
            : undefined;

        // Only resolve relative imports (skip node_modules etc.)
        if (!moduleSpecifier?.startsWith('.')) {
            continue;
        }

        const basePath = join(storiesDir, moduleSpecifier);
        let resolvedPath: string | null = null;

        const candidates: string[] = [basePath];

        for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
            if (!basePath.endsWith(ext)) {
                candidates.push(`${basePath}${ext}`);
            }
        }

        // ESM .js → .ts convention
        if (basePath.endsWith('.js')) {
            candidates.push(basePath.replace(/\.js$/, '.ts'));
            candidates.push(basePath.replace(/\.js$/, '.tsx'));
        }

        for (const candidate of candidates) {
            if (existsSync(candidate)) {
                resolvedPath = candidate;
                break;
            }
        }

        if (!resolvedPath) {
            continue;
        }

        const importedSource = readFileSync(resolvedPath, 'utf8');
        const importedFile = ts.createSourceFile(
            resolvedPath,
            importedSource,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX,
        );

        // Include ALL declarations so spread references within them can be resolved
        for (const [name, value] of collectObjectDeclarations(importedFile)) {
            importedDeclarations.set(name, value);
        }
    }

    return importedDeclarations;
}

/**
 * Flatten an object literal's properties, recursively resolving spread elements.
 */
function flattenObjectProperties(
    objectLiteral: ts.ObjectLiteralExpression,
    knownDeclarations: Map<string, ts.ObjectLiteralExpression>,
): ts.PropertyAssignment[] {
    const result: ts.PropertyAssignment[] = [];

    for (const property of objectLiteral.properties) {
        if (ts.isPropertyAssignment(property)) {
            result.push(property);
        } else if (ts.isSpreadAssignment(property)) {
            const spreadExpr = unwrapExpression(property.expression);

            if (ts.isIdentifier(spreadExpr)) {
                const resolved = knownDeclarations.get(spreadExpr.text);

                if (resolved) {
                    result.push(...flattenObjectProperties(resolved, knownDeclarations));
                }
            }
        }
    }

    return result;
}

/**
 * Extract a single ArgType from a property assignment node.
 */
function extractArgType(propInitializer: ts.ObjectLiteralExpression): ArgType | null {
    const description = getStringProperty(propInitializer, 'description') || '';
    const controlProperty = getObjectProperty(propInitializer, 'control');
    const controlLiteral = controlProperty ? getLiteralValue(controlProperty.initializer) : undefined;
    const table = getObjectLiteralProperty(propInitializer, 'table');

    const disableProperty = table ? getObjectProperty(table, 'disable') : null;

    if (disableProperty && getLiteralValue(disableProperty.initializer) === true) {
        return null;
    }

    const category = table ? getStringProperty(table, 'category') : undefined;
    const typeObject = table ? getObjectLiteralProperty(table, 'type') : null;
    const typeSummary = typeObject ? getStringProperty(typeObject, 'summary') : undefined;
    const defaultValueObject = table ? getObjectLiteralProperty(table, 'defaultValue') : null;
    const defaultValue = defaultValueObject ? getStringProperty(defaultValueObject, 'summary') : undefined;
    const optionsProperty = getObjectProperty(propInitializer, 'options');
    const optionsInitializer = optionsProperty ? unwrapExpression(optionsProperty.initializer) : null;
    const options =
        optionsInitializer && ts.isArrayLiteralExpression(optionsInitializer)
            ? optionsInitializer.elements
                  .map((element) => getLiteralValue(element))
                  .filter((value): value is string | number | boolean => value !== undefined)
            : undefined;

    return {
        description,
        ...(controlLiteral === false ? { control: false } : {}),
        ...(typeof controlLiteral === 'string' ? { control: controlLiteral } : {}),
        ...(category ? { category } : {}),
        ...(typeSummary ? { type: typeSummary } : {}),
        ...(defaultValue ? { defaultValue } : {}),
        ...(options?.length ? { options } : {}),
    };
}

function extractStoryMeta(storiesPath: string): StoryMeta {
    const sourceText = readFileSync(storiesPath, 'utf8');
    const sourceFile = ts.createSourceFile(storiesPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const localDeclarations = collectObjectDeclarations(sourceFile);
    const importedDeclarations = resolveImportedDeclarations(storiesPath, sourceFile);
    const allDeclarations = new Map([...importedDeclarations, ...localDeclarations]);

    let metaObject: ts.ObjectLiteralExpression | null = null;
    const stories: string[] = [];
    const seenStories = new Set<string>();

    const addStory = (name: string): void => {
        if (!name || name === 'meta' || name === 'default' || seenStories.has(name)) {
            return;
        }

        seenStories.add(name);
        stories.push(name);
    };

    for (const statement of sourceFile.statements) {
        if (ts.isVariableStatement(statement)) {
            const isExported =
                statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;

            if (isExported) {
                for (const declaration of statement.declarationList.declarations) {
                    if (ts.isIdentifier(declaration.name)) {
                        addStory(declaration.name.text);
                    }
                }
            }
        }

        if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
            for (const element of statement.exportClause.elements) {
                addStory(element.name.text);
            }
        }

        if (ts.isExportAssignment(statement)) {
            const expression = unwrapExpression(statement.expression);

            if (ts.isIdentifier(expression)) {
                metaObject = allDeclarations.get(expression.text) || null;
            } else if (ts.isObjectLiteralExpression(expression)) {
                metaObject = expression;
            }
        }
    }

    if (!metaObject) {
        metaObject = allDeclarations.get('meta') || null;
    }

    const argTypes: Record<string, ArgType> = {};
    let componentDescription = '';

    if (metaObject) {
        // Resolve argTypes — inline object, identifier reference, or spread
        let argTypesObject: ts.ObjectLiteralExpression | null = null;
        const argTypesProp = getObjectProperty(metaObject, 'argTypes');

        if (argTypesProp) {
            const argTypesInit = unwrapExpression(argTypesProp.initializer);

            if (ts.isObjectLiteralExpression(argTypesInit)) {
                argTypesObject = argTypesInit;
            } else if (ts.isIdentifier(argTypesInit)) {
                argTypesObject = allDeclarations.get(argTypesInit.text) || null;
            }
        }

        if (argTypesObject) {
            const flatProperties = flattenObjectProperties(argTypesObject, allDeclarations);

            for (const property of flatProperties) {
                if (!property.name) {
                    continue;
                }

                const propName = getPropertyName(property.name);
                const propInitializer = unwrapExpression(property.initializer);

                if (!propName || !ts.isObjectLiteralExpression(propInitializer)) {
                    continue;
                }

                const argType = extractArgType(propInitializer);

                if (argType) {
                    argTypes[propName] = argType;
                }
            }
        }

        const parameters = getObjectLiteralProperty(metaObject, 'parameters');
        const docs = parameters ? getObjectLiteralProperty(parameters, 'docs') : null;
        const descriptionObj = docs ? getObjectLiteralProperty(docs, 'description') : null;
        componentDescription = descriptionObj ? getStringProperty(descriptionObj, 'component') || '' : '';
    }

    return {
        argTypes,
        componentDescription,
        stories,
    };
}

function buildDocs(componentDir: string, mdxText: string): string {
    if (!mdxText) {
        return '';
    }

    let docs = mdxText
        .replace(/^import\s.+$/gm, '')
        .replace(/^\s*<Meta\b[^>]*\/>\s*$/gm, '')
        .replace(/^\s*<ArgTypes\s*\/>\s*$/gm, '');

    docs = removeQuickNavigationSection(docs);
    docs = removeComponentApiSection(docs);
    docs = docs.replace(/<Canvas\s+of=\{Stories\.([A-Za-z0-9_]+)\}\s*\/>/g, (match, storyName: string) => {
        void match;
        const codeExample = extractCodeExample(componentDir, storyName);

        if (!codeExample) {
            return '';
        }

        return `\`\`\`tsx\n// ${codeExample.fileName}\n${codeExample.code}\n\`\`\``;
    });

    return normalizeMdxWhitespace(docs);
}

function buildKnowledge(): Knowledge {
    const allFiles = walkDir(STORIES_DIR);
    const storiesFiles = allFiles.filter((filePath) => filePath.endsWith('.stories.tsx'));
    const components: Record<string, Component> = {};

    for (const storiesPath of storiesFiles) {
        const componentDir = dirname(storiesPath);
        const relativeDir = relative(STORIES_DIR, componentDir).replace(/\\/g, '/');
        const pathParts = relativeDir.split('/');
        const componentName = basename(componentDir);
        const category = pathParts[0];

        const mdxPath = join(componentDir, `${componentName}.mdx`);
        const mdxText = extractMdxText(mdxPath);
        const storyMeta = extractStoryMeta(storiesPath);

        const docs = buildDocs(componentDir, mdxText);
        const description = extractMainDescription(docs) || storyMeta.componentDescription;

        const componentId = toKebab(relativeDir);

        components[componentId] = {
            id: componentId,
            name: componentName,
            category,
            title: `Components/${relativeDir}`,
            description,
            argTypes: storyMeta.argTypes,
            storyNames: storyMeta.stories,
            docs,
        };
    }

    const packageInfo = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8')) as { version?: string };

    return {
        generated: new Date().toISOString(),
        version: packageInfo.version,
        importPath: IMPORT_PATH,
        componentCount: Object.keys(components).length,
        components,
    };
}

function main(): void {
    const output = buildKnowledge();
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

    console.info(`Generated ${OUTPUT_PATH} (${output.componentCount} components)`);
}

main();
