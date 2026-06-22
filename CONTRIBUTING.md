# CONTRIBUTING

This project is internally developed by Ring Publishing.

## Versioning

Version MUST follow [Semantic versioning](https://semver.org/) rules.

If you consider contribution to ring react components we are eager for contributions so don't hesitate!
Before adding a feature / creating new component, contact [ringcomponentsteam@groups.ringieraxelspringer.pl](mailto:ringcomponentsteam@groups.ringieraxelspringer.pl)

[Link to repository](https://github.com/Ringier-Axel-Springer-PL/ring-ui-components)

The keywords _MUST_, _MUST NOT_, _REQUIRED_, _SHALL_, _SHALL NOT_, _SHOULD_, _SHOULD NOT_, _RECOMMENDED_,  _MAY_, and _OPTIONAL_ in this document are to be interpreted as described in RFC 2119.

## Git flow rules

You can use any branch name, but it is RECOMMENDED to include JIRA task ID in at least **one place**:

- branch name
- commit message


## Code

1. Every exported component MUST have its own directory in `src/components/*/`.
2. Components MUST follow the atomic design principles and be placed in proper directories.
3. Main root component MUST have named class.
4. Every component SHOULD have properties [sx](https://mui.com/system/getting-started/the-sx-prop/) and _className_.
5. If your component has labels object property, it SHOULD merge defaults with given props.
6. Type definitions SHOULD be annotated with doc-strings, they will be visible in storybook.
7. Unit tests are required (at least 60% coverage).
8. You MUST add a storybook's story for your component. Refer to guide in [Writing Stories](https://design.ringpublishing.com/?path=/docs/introduction-writing-stories--docs).
9. Exported components MUST be defined using named function declaration, and MUST NOT be an arrow function nor variable.
10. Exports MUST be named exports. Default exports MUST NOT be used.
11. Props MUST be taken through `props` argument and destructured in the function's body.
12. There MUST be a props interface named `${ComponentName}Props` for each component that describes the props that are used in the component.
13. Every component interface SHOULD extend `CommonComponentProps`. If component has additional props, they SHOULD be defined in an interface that extends `CommonComponentProps`
14. Inputs, buttons, or other controls in the new/modified component SHOULD be marked with appropriate `data-testid` attribute for testing purposes. See the [Writing E2E tests](https://design.ringpublishing.com/?path=/docs/introduction-writing-e2e-tests--docs) documentation for more details.

## Storybook Stories

Every component MUST have complete Storybook documentation. Follow the structure defined in [Writing Stories](https://design.ringpublishing.com/?path=/docs/introduction-writing-stories--docs).

### Directory Structure

1. Stories MUST be placed in `stories/components/{Category}/{ComponentName}/` directory.
2. The directory MUST contain:
   - `{ComponentName}.stories.tsx` - Main stories configuration
   - `{ComponentName}.mdx` - Documentation file
   - `common/defaultArgs.ts` - Default props/args
   - `stories/` - Individual story files
   - `stories/code/` - Code examples for live coding examples in docs

### Documentation (MDX)

3. MDX file MUST use `<Meta isTemplate />` at the top.
4. MDX file MUST import stories as `* as Stories from './{ComponentName}.stories.js'` (note the `.js` extension, not `.tsx`).
5. Stories MUST be displayed using `<Canvas of={Stories.StoryName} />`.
6. Component API table MUST be shown using `<ArgTypes />` below the first story.
7. Documentation SHOULD include:
   - Component description and features
   - Quick navigation links
   - Multiple story examples with explanations

### Story Files

8. Each story MUST be in a separate file in the `stories/` subdirectory.
9. Story files MUST define a typed `Story` object: `type Story = StoryObj<typeof ComponentName>`.
10. For docs view, stories MUST use `createCodeStory` helper to show code alongside the example.
11. Story files MUST import raw code examples using `.tsx?raw` suffix.

### Code Examples

12. Code example files MUST be placed in `stories/code/` subdirectory.
13. Code examples MUST import from `@ringpublishing/mui-components` package name, NOT from relative paths.
14. Code examples MUST match the actual rendered example for consistency.

### Main Stories Configuration

15. Main stories file MUST export individual stories imported from the `stories/` subdirectory.
16. Main stories file MUST use named exports only. Default exports for stories MUST NOT be used (except for the meta object).
17. ArgTypes MUST be organized into categories:
    - `customization` - `sx`, `className`, `slotProps`, slots
    - `content` - `headline`, `labels`, text content
    - `validation` - validation rules, constraints
    - `behavior` - interaction settings, flags
    - `appearance` - `size`, visual properties
    - `callbacks` - event handlers
    - `state` - controlled state properties
18. Common props (`sx`, `className`) MUST include proper descriptions and type information in argTypes.
19. ArgTypes SHOULD include appropriate control types: `text`, `boolean`, `number`, `object`, `radio`, `select`.

### Import Conventions

20. Imports in story files MUST follow these conventions:
    - Component imports: relative path to `src/index.js`
    - Story and defaultArgs imports: relative paths with `.js` extension
    - MDX imports: no extension needed
    - Raw code imports: `.tsx?raw` suffix
    - Helper imports: relative paths with `.js` extension
21. Imports in MDX files MUST use `.js` extension for stories file.
22. Imports in code example files MUST use the package name `@ringpublishing/mui-components`.

## Components with Multiple Usage Modes

When a component supports mutually exclusive usage modes (e.g. controlled vs uncontrolled), the following pattern MUST be used:

1. A base props interface MUST be defined with the shared props.
2. Each usage mode MUST have its own interface extending the base.
3. A discriminated union type MUST be created using `never` fields to prevent mixing props from different modes.
4. Function overloads MUST be added for each mode to provide clear error messages.

```typescript
// 1. Base props
export interface SearchBoxBaseProps extends CommonComponentProps {
    withClearButton?: boolean;
}

// 2. Mode-specific interfaces
export interface ControlledSearchBoxProps extends SearchBoxBaseProps {
    value: string;
    onChange: (value: string) => void;
}

export interface UncontrolledSearchBoxProps extends SearchBoxBaseProps {
    defaultValue: string;
    searchFunc: (query: string) => void;
}

// 3. Discriminated union with never fields
export type SearchBoxProps =
    | (ControlledSearchBoxProps & { defaultValue?: never; searchFunc?: never })
    | (UncontrolledSearchBoxProps & { value?: never; onChange?: never });

// 4. Overloads + implementation
export function SearchBox(props: ControlledSearchBoxProps): React.JSX.Element;
export function SearchBox(props: UncontrolledSearchBoxProps): React.JSX.Element;

export function SearchBox(props: SearchBoxProps): React.JSX.Element {
    // implementation
}
```

When wrapping such a component, the wrapper MUST also define overloads and use a type assertion to pass props to the inner component:

```typescript
export function SearchBar(props: ControlledSearchBoxProps & { children?: React.ReactNode }): React.JSX.Element;
export function SearchBar(props: UncontrolledSearchBoxProps & { children?: React.ReactNode }): React.JSX.Element;

export function SearchBar(props: SearchBarProps): React.JSX.Element {
    const { children, ...otherProps } = props;
    return <SearchBox {...(otherProps as ControlledSearchBoxProps)} />;
}
```

The type assertion is necessary because TypeScript's overload resolution cannot narrow a union through destructuring. The outer overloads guarantee the assertion is safe.

## Theme primitives

Components MUST NOT import `ThemeProvider` or `createTheme` directly from `@mui/material` to scope theme overrides. Use the primitives from `@ringpublishing/mui-theme` instead:

1. **Top-level theming** — applications MUST wrap the tree in `<ThemeConfig>` from `@ringpublishing/mui-theme`. This provides the Ring theme, `CssBaseline`, and `InspectorBridge` exactly once.
2. **Scoped component-level overrides** — when a component needs to override MUI `components` (default props, style overrides) for its subtree, it MUST use `<ScopedThemeOverrides components={...}>` from `@ringpublishing/mui-theme`. The primitive deep-merges the override into the parent theme, so palette, typography, locales, and existing component overrides are preserved. It does NOT render `CssBaseline` or `InspectorBridge` (those belong to `ThemeConfig` only).
3. **Reading the current theme** — components MAY use `useTheme()` from `@mui/material` for read access (e.g. `theme.spacing(...)` inside `sx`), but MUST NOT call `createTheme(...)` to build a sibling theme.

Rationale: a single root `ThemeConfig` guarantees one CssBaseline / one InspectorBridge / one set of locale-aware MUI X overrides. Scoped overrides via `ScopedThemeOverrides` prevent the common bug of rebuilding the theme from scratch and dropping parent state. See `docs/adr/013-scoped-theme-overrides-primitive.md` in `@ringpublishing/mui-theme` for design rationale.

## Pull request

When your code is ready for review create _Pull request_ to `master` branch.
For merge 2 approvals are required.

The Pull Request MUST contain:
- Meaningful title
- Description of changes or a JIRA task ID

To make the review easier please assign yourself to the pull request in GitHub. 
