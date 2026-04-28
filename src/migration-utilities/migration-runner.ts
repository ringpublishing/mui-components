import path from 'path';
import * as readline from 'readline';
import { runComponentNameMigration } from './component-name-migrator.js';

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

function confirmMigration(): Promise<boolean> {
    const rl = createReadlineInterface();

    return new Promise((resolve) => {
        rl.question('Do you want to proceed with the migration? (y/N): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

export async function runMigration(migrationDir: string, oldComponentName: string, newComponentName: string) {
    const resolvedMigrationDir = path.isAbsolute(migrationDir)
        ? migrationDir
        : path.resolve(process.cwd(), migrationDir);

    console.info('=========================================');
    console.info(`${oldComponentName} to ${newComponentName} Migration Tool`);
    console.info('=========================================');
    console.info();
    console.info(
        `This script will migrate all imports and usages of the ${oldComponentName} component to ${newComponentName}.`,
    );
    console.info('Migration details:');
    console.info(`- From: ${oldComponentName}`);
    console.info(`- To: ${newComponentName}`);
    console.info(`- Target directory: ${resolvedMigrationDir}`);
    console.info();
    console.info('The script will:');
    console.info('1. Find all .js, .jsx, .ts, .tsx files in the directory');
    console.info('2. Update import statements from @ringpublishing/mui-components');
    console.info('3. Update JSX component usages');
    console.info();
    console.info('WARNING: This is a potentially destructive operation.');
    console.info('Make sure you have committed your changes or have a backup before proceeding.');
    console.info();

    const confirmed = await confirmMigration();

    if (confirmed) {
        console.info('Starting migration...');
        runComponentNameMigration(resolvedMigrationDir, oldComponentName, newComponentName);
    } else {
        console.info('Migration cancelled.');
        process.exit(0);
    }
}
