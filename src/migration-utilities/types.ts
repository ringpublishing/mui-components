export interface MigrationPlan {
    title: string;
    description: string;
    steps: string[];
    warnings?: string[];
}

export interface MigrationContext {
    targetDir: string;
    args: string[];
}

export type MigrationExecutor = (context: MigrationContext) => void | Promise<void>;
