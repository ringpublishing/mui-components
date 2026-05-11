import { runComponentNameMigration } from '../../src/migration-utilities/component-name-migrator.js';
import { runMigration } from '../../src/migration-utilities/migration-runner.js';

async function main(): Promise<void> {
    const OLD_COMPONENT_NAME = 'Skeleton';
    const NEW_COMPONENT_NAME = 'DataView';
    const targetDir = process.argv[2] || '.';

    await runMigration(
        {
            title: `${OLD_COMPONENT_NAME} → ${NEW_COMPONENT_NAME} Migration Tool`,
            description: `This script will migrate all imports and usages of the ${OLD_COMPONENT_NAME} component to ${NEW_COMPONENT_NAME}.`,
            steps: [
                'Find all .js, .jsx, .ts, .tsx files in the directory',
                "Update import statements from '@ringpublishing/mui-components'",
                'Update JSX component usages',
            ],
            warnings: [
                'This is a potentially destructive operation. Make sure you have committed your changes or have a backup before proceeding.',
            ],
        },
        { targetDir, args: process.argv.slice(3) },
        ({ targetDir: resolvedDir }) => runComponentNameMigration(resolvedDir, OLD_COMPONENT_NAME, NEW_COMPONENT_NAME),
    );
}

main().catch((error) => {
    console.error('Migration failed with error:', error);
    process.exit(1);
});
