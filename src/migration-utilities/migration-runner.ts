import path from 'path';
import * as readline from 'readline';

import { MigrationContext, MigrationExecutor, MigrationPlan } from './types.js';

function createReadlineInterface(): readline.Interface {
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

function printPlan(plan: MigrationPlan, context: MigrationContext): void {
    const banner = '='.repeat(plan.title.length);
    console.info(banner);
    console.info(plan.title);
    console.info(banner);
    console.info();
    console.info(plan.description);
    console.info();
    console.info(`Target directory: ${context.targetDir}`);
    console.info();

    if (plan.steps.length > 0) {
        console.info('The script will:');
        plan.steps.forEach((step, idx) => {
            console.info(`  ${idx + 1}. ${step}`);
        });
        console.info();
    }

    if (plan.warnings && plan.warnings.length > 0) {
        plan.warnings.forEach((warning) => {
            console.info(`WARNING: ${warning}`);
        });
        console.info();
    }
}

export async function runMigration(
    plan: MigrationPlan,
    context: MigrationContext,
    execute: MigrationExecutor,
): Promise<void> {
    const resolvedTargetDir = path.isAbsolute(context.targetDir)
        ? context.targetDir
        : path.resolve(process.cwd(), context.targetDir);

    const resolvedContext: MigrationContext = {
        ...context,
        targetDir: resolvedTargetDir,
    };

    printPlan(plan, resolvedContext);

    const confirmed = await confirmMigration();

    if (!confirmed) {
        console.info('Migration cancelled.');
        process.exit(0);
    }

    console.info('Starting migration...');
    await execute(resolvedContext);
}
