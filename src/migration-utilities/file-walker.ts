import { readdirSync } from 'fs';
import path from 'path';

export const DEFAULT_IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git', '.github'];
export const SOURCE_FILE_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];

export function findFiles(
    dir: string,
    extensions: string[] = SOURCE_FILE_EXTENSIONS,
    ignoreDirs: string[] = DEFAULT_IGNORE_DIRS,
): string[] {
    let results: string[] = [];

    if (
        ignoreDirs.some((ignoreDir) => {
            const relativePath = path.relative('.', dir);

            return relativePath === ignoreDir || relativePath.endsWith(ignoreDir) || dir === ignoreDir;
        })
    ) {
        return results;
    }

    console.info('Checking directory:', dir);

    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            results = results.concat(findFiles(fullPath, extensions, ignoreDirs));
        } else if (item.isFile()) {
            const ext = path.extname(item.name).slice(1);

            if (extensions.includes(ext)) {
                results.push(fullPath);
            }
        }
    }

    return results;
}
