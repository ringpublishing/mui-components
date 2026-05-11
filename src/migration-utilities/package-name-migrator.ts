import { readFileSync, writeFileSync } from 'fs';

import { findFiles, SOURCE_FILE_EXTENSIONS } from './file-walker.js';

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function migratePackageNameInFile(filePath: string, oldPackageName: string, newPackageName: string): boolean {
    try {
        const content = readFileSync(filePath, 'utf8');
        const escaped = escapeRegex(oldPackageName);

        // Matches the old package name in:
        //   import ... from 'OLD' / 'OLD/sub'
        //   import 'OLD'
        //   require('OLD')
        //   import('OLD') (dynamic)
        // Subpath segment (e.g. '/dist/foo') is preserved as-is.
        const importRegex = new RegExp(
            `(from\\s*|import\\s+|require\\s*\\(\\s*|import\\s*\\(\\s*)(['"])${escaped}(\\/[^'"]*)?\\2`,
            'g',
        );

        const newContent = content.replace(importRegex, (match, prefix, quote, subpath) => {
            return `${prefix}${quote}${newPackageName}${subpath ?? ''}${quote}`;
        });

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
