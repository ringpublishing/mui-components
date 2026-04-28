import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const PACKAGE_NAME = '@ringpublishing/mui-components';

function findFiles(dir = '.', extensions: string[] = [], ignoreDirs: string[] = []): string[] {
    let results: string[] = [];

    // Check if directory should be ignored
    if (
        ignoreDirs.some((ignoreDir) => {
            const relativePath = path.relative('.', dir);

            return relativePath === ignoreDir || relativePath.endsWith(ignoreDir) || dir === ignoreDir;
        })
    ) {
        return results;
    }

    console.info('Checking directory:', dir);

    // Read directory contents
    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            // Recursively process subdirectories
            results = results.concat(findFiles(fullPath, extensions, ignoreDirs));
        } else if (item.isFile()) {
            // Check if file extension matches
            const ext = path.extname(item.name).slice(1);

            if (extensions.includes(ext)) {
                results.push(fullPath);
            }
        }
    }

    return results;
}

export function migrateFile(
    filePath: string,
    oldComponentName: string,
    newComponentName: string,
    packageName: string = PACKAGE_NAME,
): boolean {
    try {
        // Read file content
        const content = readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent: string = content;

        const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Handle multi-line named imports with regex that properly handles whitespace and newlines
        const multiLineImportRegex = new RegExp(
            `import\\s*{([\\s\\S]*?)(\\b${oldComponentName}\\b)([\\s\\S]*?)}\\s*from\\s*['"](${escapedPackageName})['"]`,
            'g',
        );
        newContent = newContent.replace(multiLineImportRegex, (match, before, component, after, pkg) => {
            modified = true;

            return `import {${before}${newComponentName}${after}} from '${pkg}'`;
        });

        // Handle renamed imports (as alias) in multi-line format
        const renamedImportRegex = new RegExp(
            `import\\s*{([\\s\\S]*?)(\\b${oldComponentName}\\s+as\\s+\\w+\\b)([\\s\\S]*?)}\\s*from\\s*['"](${escapedPackageName})['"]`,
            'g',
        );
        newContent = newContent.replace(renamedImportRegex, (match, before, renamed, after, pkg) => {
            modified = true;
            const updatedRenamed = renamed.replace(oldComponentName, newComponentName);

            return `import {${before}${updatedRenamed}${after}} from '${pkg}'`;
        });

        // Handle JSX usage
        const jsxRegex = new RegExp(`<\\s*${oldComponentName}\\b`, 'g');
        newContent = newContent.replace(jsxRegex, `<${newComponentName}`);

        const jsxClosingRegex = new RegExp(`</\\s*${oldComponentName}\\s*>`, 'g');
        newContent = newContent.replace(jsxClosingRegex, `</${newComponentName}>`);

        // Write changes back to file if modified
        if (modified || newContent !== content) {
            writeFileSync(filePath, newContent, 'utf8');

            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);

        return false;
    }
}

export function runComponentNameMigration(
    migrationDir = '.',
    oldComponentName: string,
    newComponentName: string,
    packageName: string = PACKAGE_NAME,
): void {
    try {
        const files = findFiles(
            migrationDir,
            ['js', 'jsx', 'ts', 'tsx'],
            ['node_modules', 'dist', 'build', '.git', '.github'],
        );

        console.info(`Found ${files.length} files to process...`);

        let migratedCount = 0;

        for (const file of files) {
            const migrated = migrateFile(file, oldComponentName, newComponentName, packageName);

            if (migrated) {
                migratedCount++;
                console.info(`✓ Updated imports in ${file}`);
            }
        }

        console.info(`Migration complete! Updated ${migratedCount} files.`);

        if (migratedCount === 0) {
            console.info('No files were modified. Possible reasons:');
            console.info('- Your codebase may not be using the Skeleton component');
            console.info('- The component might be imported from a different path than expected');
            console.info('- You might be using a different import pattern not covered by this script');
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
