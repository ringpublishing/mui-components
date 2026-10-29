import { readFileSync, writeFileSync } from 'fs';

import { findFiles, SOURCE_FILE_EXTENSIONS } from './file-walker.js';

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mirrors the subpaths of the package's `exports` besides the root; any other subpath does not resolve.
const PUBLIC_SUBPATH = /^\/(icons|tree-dynamic-loading|package\.json)$/;

export function migratePackageNameInFile(filePath: string, oldPackageName: string, newPackageName: string): boolean {
    try {
        const content = readFileSync(filePath, 'utf8');
        const names = [oldPackageName, newPackageName].map(escapeRegex).join('|');

        // Matches the old or the new package name in:
        //   import ... from 'PKG' / 'PKG/sub'
        //   import 'PKG'
        //   require('PKG')
        //   import('PKG') (dynamic)
        // The old name becomes the new one; a subpath the package does not export (e.g. '/dist/foo') becomes the root.
        const importRegex = new RegExp(
            `(from\\s*|import\\s+|require\\s*\\(\\s*|import\\s*\\(\\s*)(['"])(${names})(\\/[^'"]*)?\\2`,
            'g',
        );

        const newContent = content.replace(
            importRegex,
            (match, prefix, quote, packageName, subpath?: string): string => {
                if (subpath && !PUBLIC_SUBPATH.test(subpath)) {
                    console.warn(
                        `! ${filePath}: '${packageName}${subpath}' → '${newPackageName}' — check that the imported names are exported from the package root`,
                    );

                    return `${prefix}${quote}${newPackageName}${quote}`;
                }

                return `${prefix}${quote}${newPackageName}${subpath ?? ''}${quote}`;
            },
        );

        if (newContent !== content) {
            writeFileSync(filePath, newContent, 'utf8');

            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);

        return false;
    }
}

export function runPackageNameMigration(migrationDir = '.', oldPackageName: string, newPackageName: string): void {
    try {
        const files = findFiles(migrationDir, SOURCE_FILE_EXTENSIONS);

        console.info(`Found ${files.length} files to process...`);

        let migratedCount = 0;

        for (const file of files) {
            const migrated = migratePackageNameInFile(file, oldPackageName, newPackageName);

            if (migrated) {
                migratedCount++;
                console.info(`✓ Updated imports in ${file}`);
            }
        }

        console.info(`Migration complete! Updated ${migratedCount} files.`);

        if (migratedCount === 0) {
            console.info('No files were modified. Possible reasons:');
            console.info(`- Your codebase may not import from '${oldPackageName}'`);
            console.info('- You might already be using the new package name');
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
