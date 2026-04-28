import { runMigration } from '../../src/migration-utilities/migration-runner.js';

async function main() {
    const OLD_COMPONENT_NAME = 'Skeleton';
    const NEW_COMPONENT_NAME = 'DataView';

    // Get directory from command line arguments or use current directory
    const migrationDir = process.argv[2] || '.';

    await runMigration(migrationDir, OLD_COMPONENT_NAME, NEW_COMPONENT_NAME);
}

main().catch((error) => {
    console.error('Migration failed with error:', error);
    process.exit(1);
});
