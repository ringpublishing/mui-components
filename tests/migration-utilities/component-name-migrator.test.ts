// migrate-skeleton-to-dataview.test.js
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { migrateFile, runComponentNameMigration } from '../../src/migration-utilities/component-name-migrator.js';

const TEST_PACKAGE_NAME = '@ring-internal/ui-components';

describe('Component name migration utils', () => {
    let TEST_DIR: string;

    beforeAll(async () => {
        TEST_DIR = await fs.mkdtemp(path.join(os.tmpdir(), 'migration-test-'));
    });

    beforeEach(async () => {
        // Create test directory
        await fs.mkdir(TEST_DIR, { recursive: true });
    });

    afterEach(async () => {
        // Clean up test directory
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    });

    describe('migrateFile', () => {
        it('should handle single line imports', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'single-line.js');
            await fs.writeFile(testFile, "import { Skeleton } from '@ring-internal/ui-components';");

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import { DataView } from '@ring-internal/ui-components';");
        });

        it('should handle multi-line imports', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'multi-line.js');
            await fs.writeFile(
                testFile,
                `import {
  Skeleton,
  LightBox
} from '@ring-internal/ui-components';`,
            );

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe(`import {
  DataView,
  LightBox
} from '@ring-internal/ui-components';`);
        });

        it('should handle aliased imports', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'aliased.js');
            await fs.writeFile(testFile, "import { Skeleton as Template } from '@ring-internal/ui-components';");

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import { DataView as Template } from '@ring-internal/ui-components';");
        });

        it('should handle multi-line aliased imports', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'multi-line-aliased.js');
            await fs.writeFile(
                testFile,
                `import {
  Skeleton as Template,
  LightBox
} from '@ring-internal/ui-components';`,
            );

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe(`import {
  DataView as Template,
  LightBox
} from '@ring-internal/ui-components';`);
        });

        it('should handle JSX usage', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'jsx-usage.jsx');
            await fs.writeFile(
                testFile,
                `
import { Skeleton } from '@ring-internal/ui-components';

function MyComponent() {
  return (
    <div>
      <Skeleton data={items} />
      <p>Some text</p>
      <Skeleton 
        loading={true}
        error={false}
      />
    </div>
  );
}
`,
            );

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toContain('<DataView data={items} />');
            expect(content).toContain('<DataView \n        loading={true}');
        });

        it('should handle closing JSX tags', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'jsx-closing.jsx');
            await fs.writeFile(
                testFile,
                `
import { Skeleton } from '@ring-internal/ui-components';

function MyComponent() {
  return (
    <div>
      <Skeleton>
        <div>Child content</div>
      </Skeleton>
    </div>
  );
}
`,
            );

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toContain('<DataView>');
            expect(content).toContain('</DataView>');
            expect(content).not.toContain('<Skeleton>');
            expect(content).not.toContain('</Skeleton>');
        });

        it('should not modify non-package imports', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'non-package.js');
            await fs.writeFile(testFile, "import { Skeleton } from './local-components';");

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import { Skeleton } from './local-components';");
        });

        it('should handle mixed imports from different packages', async () => {
            // Given
            const testFile = path.join(TEST_DIR, 'mixed.js');
            await fs.writeFile(
                testFile,
                `
import { Skeleton, LightBox } from '@ring-internal/ui-components';
import { Skeleton as MuiSkeleton } from '@mui/material';
`,
            );

            // When
            migrateFile(testFile, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toContain("import { DataView, LightBox } from '@ring-internal/ui-components'");
            expect(content).toContain("import { Skeleton as MuiSkeleton } from '@mui/material'");
        });
    });

    describe('runComponentNameMigration', () => {
        it('should ignore files in node_modules or dist directories', async () => {
            // Given
            const nodeModulesDir = path.join(TEST_DIR, 'node_modules');
            const distDir = path.join(TEST_DIR, 'dist');
            await fs.mkdir(nodeModulesDir, { recursive: true });
            await fs.mkdir(distDir, { recursive: true });
            const nodeModulesFile = path.join(nodeModulesDir, 'file.js');
            const distFile = path.join(distDir, 'file.js');
            await fs.writeFile(nodeModulesFile, "import { Skeleton } from '@ring-internal/ui-components';");
            await fs.writeFile(distFile, "import { Skeleton } from '@ring-internal/ui-components';");

            // When
            runComponentNameMigration(TEST_DIR, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const nodeModulesContent = await fs.readFile(nodeModulesFile, 'utf8');
            const distContent = await fs.readFile(distFile, 'utf8');
            expect(nodeModulesContent).toBe("import { Skeleton } from '@ring-internal/ui-components';");
            expect(distContent).toBe("import { Skeleton } from '@ring-internal/ui-components';");
        });

        it('should migrate multiple files in a directory', async () => {
            // Given
            const someDirectory = path.join(TEST_DIR, 'some-directory');
            const otherDirectory = path.join(TEST_DIR, 'other-directory');
            await fs.mkdir(someDirectory, { recursive: true });
            await fs.mkdir(otherDirectory, { recursive: true });
            const someFile = path.join(someDirectory, 'file.js');
            const otherFile = path.join(otherDirectory, 'file.js');
            await fs.writeFile(someFile, "import { Skeleton } from '@ring-internal/ui-components';");
            await fs.writeFile(otherFile, "import { Skeleton } from '@ring-internal/ui-components';");

            // When
            runComponentNameMigration(TEST_DIR, 'Skeleton', 'DataView', TEST_PACKAGE_NAME);

            // Then
            const someFileContent = await fs.readFile(someFile, 'utf8');
            const otherFileContent = await fs.readFile(otherFile, 'utf8');
            expect(someFileContent).toBe("import { DataView } from '@ring-internal/ui-components';");
            expect(otherFileContent).toBe("import { DataView } from '@ring-internal/ui-components';");
        });
    });
});
