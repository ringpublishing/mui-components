#!/usr/bin/env node
/* eslint n/hashbang: "off" */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type {
    Component,
    ComponentDetailsResult,
    ComponentDocsResult,
    Knowledge,
    ListComponentResult,
} from './types.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_PATH = join(currentDir, '../data/knowledge.json');
const PACKAGE_JSON_PATH = join(currentDir, '../package.json');

const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as { version?: string };
const SERVER_VERSION = packageJson.version ?? 'dev';

const knowledge = loadKnowledge();
const components = Object.values(knowledge.components);

function loadKnowledge(): Knowledge {
    const fileContent = readFileSync(KNOWLEDGE_PATH, 'utf8');
    const parsed = JSON.parse(fileContent) as Knowledge;
    const normalizedComponents = parsed.components ?? {};

    return {
        generated: parsed.generated || new Date().toISOString(),
        version: parsed.version ?? SERVER_VERSION,
        importPath: parsed.importPath || '@ringpublishing/mui-components',
        componentCount: parsed.componentCount ?? Object.keys(normalizedComponents).length,
        components: normalizedComponents,
    };
}

function summarizeComponent(component: Component): ListComponentResult {
    return {
        id: component.id,
        name: component.name,
        description: component.description,
        storyNames: component.storyNames,
        argTypesCount: Object.keys(component.argTypes).length,
    };
}

function getComponentDetails(component: Component): ComponentDetailsResult {
    return {
        id: component.id,
        name: component.name,
        description: component.description,
        storyNames: component.storyNames,
        argTypes: component.argTypes,
    };
}

function getComponentDocs(component: Component): ComponentDocsResult {
    return {
        id: component.id,
        name: component.name,
        docs: component.docs,
    };
}

function findComponent(query: string): Component | null {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
        return null;
    }

    const byId = knowledge.components[normalizedQuery];

    if (byId) {
        return byId;
    }

    const byName = components.find((component) => component.name === normalizedQuery);

    if (byName) {
        return byName;
    }

    const lowerQuery = normalizedQuery.toLowerCase();
    const byCaseInsensitiveName = components.find((component) => component.name.toLowerCase() === lowerQuery);

    if (byCaseInsensitiveName) {
        return byCaseInsensitiveName;
    }

    return null;
}

const mcpServer = new McpServer({
    name: 'mui-components-mcp',
    version: SERVER_VERSION,
});

mcpServer.registerTool(
    'list_components',
    {
        description: 'List all available Ring Publishing MUI components with names and short descriptions.',
    },
    () => {
        const allComponents = components.map((component) => summarizeComponent(component));

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            total: allComponents.length,
                            version: knowledge.version,
                            importPath: knowledge.importPath,
                            components: allComponents,
                        },
                        null,
                        2,
                    ),
                },
            ],
        };
    },
);

mcpServer.registerTool(
    'get_component_details',
    {
        description:
            'Get structured details for a specific component: description, prop definitions (argTypes) with types,' +
            ' defaults, and options, and available story names.' +
            ' Story names correspond to usage examples documented in the component docs — use get_component_docs to see them in full context.' +
            ' If an argType references a complex type, look it up directly in the source code or TypeScript exports' +
            ' of the @ringpublishing/mui-components library.' +
            ' Use this tool when you need to know how to use the component (what props to pass).',
        inputSchema: {
            name: z
                .string()
                .describe('Component name (e.g. "Accordion") or component id (e.g. "molecules-accordion").'),
        },
    },
    ({ name }) => {
        const component = findComponent(name);

        if (!component) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Component "${name}" not found. Use list_components to see available components.`,
                    },
                ],
            };
        }

        return {
            content: [{ type: 'text', text: JSON.stringify(getComponentDetails(component), null, 2) }],
        };
    },
);

mcpServer.registerTool(
    'get_component_docs',
    {
        description:
            'Get full prose documentation for a specific component: usage guidelines, behavior descriptions, and code examples.' +
            ' Use this when you need to understand how and when to use the component.',
        inputSchema: {
            name: z
                .string()
                .describe('Component name (e.g. "Accordion") or component id (e.g. "molecules-accordion").'),
        },
    },
    ({ name }) => {
        const component = findComponent(name);

        if (!component) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Component "${name}" not found. Use list_components to see available components.`,
                    },
                ],
            };
        }

        return {
            content: [{ type: 'text', text: JSON.stringify(getComponentDocs(component), null, 2) }],
        };
    },
);

async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
