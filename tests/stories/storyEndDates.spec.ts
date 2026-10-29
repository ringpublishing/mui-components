// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Reads hundreds of files synchronously: ~0.1 s alone, but several seconds when the whole suite competes for the CPU.
const FILE_SCAN_TIMEOUT_MS = 30_000;

const storiesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../stories/components');

const END_DATE_LITERAL = /endDate\s*[=:]\s*\{?\s*['"`](\d{4}-\d{2}-\d{2}[^'"`]*)['"`]/g;

function collectSourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return collectSourceFiles(entryPath);
        }

        return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
    });
}

describe('story sources', () => {
    it(
        'should never pin endDate to a date literal',
        () => {
            const offenders = collectSourceFiles(storiesRoot).flatMap((file) =>
                [...fs.readFileSync(file, 'utf8').matchAll(END_DATE_LITERAL)].map(
                    (match) => `${path.relative(storiesRoot, file)} → endDate "${match[1]}"`,
                ),
            );

            expect(
                offenders,
                'Hardcoded endDate expires and silently blanks the story. Derive it, e.g. dayjs().add(1, "year").toISOString().',
            ).toEqual([]);
        },
        FILE_SCAN_TIMEOUT_MS,
    );
});
