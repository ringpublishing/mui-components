import { runMigration } from '../../src/migration-utilities/migration-runner.js';
import { runPackageNameMigration } from '../../src/migration-utilities/package-name-migrator.js';

async function main(): Promise<void> {
    const OLD_PACKAGE_NAME = '@ring-internal/ui-components';
    const NEW_PACKAGE_NAME = '@ringpublishing/mui-components';
    const targetDir = process.argv[2] || '.';

    await runMigration(
        {
            title: `${OLD_PACKAGE_NAME} → ${NEW_PACKAGE_NAME} Migration Tool`,
            description: `This script will rewrite all import statements that reference '${OLD_PACKAGE_NAME}' to use '${NEW_PACKAGE_NAME}'. Subpath imports are preserved.`,
            steps: [
                'Find all .js, .jsx, .ts, .tsx files in the directory',
                `Replace static imports: from '${OLD_PACKAGE_NAME}' → from '${NEW_PACKAGE_NAME}'`,
                `Replace side-effect imports: import '${OLD_PACKAGE_NAME}' → import '${NEW_PACKAGE_NAME}'`,
                `Replace dynamic imports: import('${OLD_PACKAGE_NAME}') → import('${NEW_PACKAGE_NAME}')`,
                `Replace require calls: require('${OLD_PACKAGE_NAME}') → require('${NEW_PACKAGE_NAME}')`,
            ],
            warnings: [
                'This is a potentially destructive operation. Make sure you have committed your changes or have a backup before proceeding.',
                'package.json is NOT modified by this script — update the dependency entry manually and run your package manager install command.',
            ],
        },
        { targetDir, args: process.argv.slice(3) },
        ({ targetDir: resolvedDir }) => runPackageNameMigration(resolvedDir, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME),
    );
}

main().catch((error) => {
    console.error('Migration failed with error:', error);
    process.exit(1);
});
