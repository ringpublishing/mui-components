# @ringpublishing/mui-components-mcp

MCP server providing documentation knowledge base for Ring Publishing MUI Components.

## Usage in Claude Desktop / Cursor / VS Code / Copilot

Add to your MCP config:

```json
{
    "mcpServers": {
        "ring-mui": {
            "command": "npx",
            "args": ["-y", "@ringpublishing/mui-components-mcp"]
        }
    }
}
```

## Available tools

| Tool                    | Description                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `list_components`       | List all components with name, description, story names, and argTypes count                              |
| `get_component_details` | Structured component data: description, argTypes (with type, default, options), and story names          |
| `get_component_docs`    | Full prose documentation for a component: usage guidelines, behavior descriptions, and code examples     |

## Data pipeline

Knowledge is generated from Storybook source files (MDX + stories) by `scripts/generate-knowledge.ts`.

```
stories/**/*.mdx + stories/**/*.stories.tsx
        ↓  generate-knowledge.ts (tsc → dist-scripts/generate-knowledge.js)
    data/knowledge.json
        ↓  index.ts (MCP server)
    list_components / get_component_details / get_component_docs
```

## Scripts

| Script                       | Description                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `npm run build`              | Sync version (CI-only no-op outside CI), regenerate knowledge.json, compile TypeScript |
| `npm run build:scripts`      | Compile TypeScript scripts from `scripts/` to `dist-scripts/`                          |
| `npm run generate-knowledge` | Compile and run generator, then regenerate `data/knowledge.json`                       |
| `npm run dev`                | Watch mode for TypeScript compilation                                                  |
| `npm run start`              | Run the MCP server                                                                     |

## Testing with MCP Inspector

[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) is a web UI for interacting with MCP servers — useful for verifying tool responses during development.

### Local development

```bash
# Build first
npm run build

# Run inspector against local build
npx @modelcontextprotocol/inspector node dist/index.js
```

Inspector opens at `http://localhost:6274`. Use it to call `list_components`, `get_component_details`, and `get_component_docs` and verify responses.

### Published package

```bash
npx @modelcontextprotocol/inspector npx -y @ringpublishing/mui-components-mcp
```
