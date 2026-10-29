/*
 * Static consistency audit between Storybook stories and their Docs pages.
 *
 * Sibling of `docscan.mjs`: that script looks at the BUILT Storybook and catches blocks
 * that crashed inside an error boundary. This one reads the source files and checks that
 * a story, its `code/` example and the MDX all describe the same thing — before anyone
 * runs a build.
 *
 * The rules follow directly from `stories/introduction/WritingStories.mdx` and
 * `.github/instructions/stories.instructions.md`. Story names are read with Storybook's own
 * CSF parser, so they are the names the sidebar shows. Everything else works, like docscan,
 * with regexes and simple bracket matching. Consequence: the rules in the "to review" tier
 * are heuristics, not proofs, which is why they do not affect the exit code.
 *
 * Usage:  npm run test:stories:audit                 (all of stories/components)
 *         npm run test:stories:audit -- Autocomplete    (filter by component path)
 *         node scripts/storyaudit.mjs [filter] [--summary] [--strict]
 *
 *   --summary   print only the per-rule hit counts
 *   --strict    "to review" hits also raise the exit code
 */
/* eslint-disable no-console -- the report goes to stdout, as in docscan */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storyNameFromExport } from 'storybook/internal/csf';
import { loadCsf } from 'storybook/internal/csf-tools';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const filter = (argv.find((a) => !a.startsWith('--')) || '').toLowerCase();

// The current directory wins so another checkout of the repo (e.g. a different worktree)
// can be scanned without copying the script. Outside a repo, fall back to the script's location.
const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = fs.existsSync(path.join(process.cwd(), 'stories/components')) ? process.cwd() : scriptRoot;
const STORIES_ROOT = path.join(root, 'stories/components');
const SRC_ROOT = path.join(root, 'src');

const PACKAGE_NAME = '@ringpublishing/mui-components';
// The set from `stories.instructions.md` → "ArgTypes Categories".
const ALLOWED_CATEGORIES = new Set([
    'customization',
    'content',
    'validation',
    'behavior',
    'appearance',
    'callbacks',
    'state',
]);

// Props whose difference between the story and the example does not change what the
// reader sees in Docs: wrapping/layout (`sx` on a container) and test identifiers.
const WRAPPER_PROPS = new Set(['sx', 'className', 'style', 'key', 'ref', 'children', 'dataTestIdSuffix', 'id']);
// The story keeps state in `args` (uncontrolled), the example in `useState` (controlled)
// — the same thing shown through two idioms, not a content drift.
const EQUIVALENT_PROPS = [
    ['value', 'defaultValue'],
    ['checked', 'defaultChecked'],
    ['open', 'defaultOpen'],
    ['expanded', 'defaultExpanded'],
    ['selected', 'defaultSelected'],
];
// Purely layout elements. A `code/` example may wrap itself in a Box; the story centres
// its content with its own wrapper inside `createCodeStory` anyway.
const LAYOUT_TAGS = new Set([
    'Box',
    'Stack',
    'Grid',
    'Grid2',
    'Paper',
    'Container',
    'Fragment',
    'React.Fragment',
    'Divider',
]);

/* ───────────────────────── text utilities ───────────────────────── */

// Every rule reads the same handful of files through different paths (the story loop, the
// import graph, the code/ loop, argTypes resolution), so reads are memoised per path.
const fileCache = new Map();

const read = (file) => {
    if (!fileCache.has(file)) fileCache.set(file, fs.readFileSync(file, 'utf8'));

    return fileCache.get(file);
};

const rel = (file) => path.relative(root, file);
const lineOf = (text, index) => text.slice(0, index).split('\n').length;
/** `.ts`/`.tsx` files directly inside `dir`, sorted; `[]` when the directory does not exist. */
const tsFilesIn = (dir) =>
    fs.existsSync(dir)
        ? fs
              .readdirSync(dir)
              .filter((f) => /\.tsx?$/.test(f))
              .map((f) => path.join(dir, f))
              .sort()
        : [];

/**
 * Index just past the comment or string that starts at `i`, or -1 when nothing to skip
 * starts there. An unterminated comment or string runs to the end of the text. Every
 * scanner below uses this so a `{` inside example text or a comment cannot throw the
 * bracket matching off halfway through the file.
 */
function skipTriviaAt(text, i) {
    if (text.startsWith('//', i)) {
        const end = text.indexOf('\n', i);

        return end < 0 ? text.length : end;
    }

    if (text.startsWith('/*', i)) {
        const end = text.indexOf('*/', i + 2);

        return end < 0 ? text.length : end + 2;
    }

    if (text[i] === '"' || text[i] === "'" || text[i] === '`') return skipString(text, i) + 1;

    return -1;
}

/** Index of the closing bracket for the opening bracket at `open`, or -1. */
function matchBrace(text, open) {
    const pairs = { '{': '}', '(': ')', '[': ']' };
    const close = pairs[text[open]];
    let depth = 0;
    let i = open;

    while (i < text.length) {
        const skipped = skipTriviaAt(text, i);

        if (skipped >= 0) {
            i = skipped;
            continue;
        }

        const ch = text[i];
        if (ch === text[open]) depth++;
        if (ch === close) depth--;
        if (depth === 0) return i;
        i++;
    }

    return -1;
}

function skipString(text, start) {
    const quote = text[start];

    for (let i = start + 1; i < text.length; i++) {
        if (text[i] === '\\') {
            i++;
            continue;
        }

        if (quote === '`' && text[i] === '$' && text[i + 1] === '{') {
            const close = matchBrace(text, i + 1);
            if (close < 0) return text.length;
            i = close;
            continue;
        }

        if (text[i] === quote) return i;
    }

    return text.length;
}

/**
 * Top-level entries of an object literal (the text between `{` and `}`):
 * `{ key, valueText, spread }`. Keys may be quoted (`'slots.media'`),
 * values may be nested arbitrarily.
 */
function topLevelEntries(body) {
    const entries = [];
    let i = 0;

    const quotedKey = /['"]([^'"]+)['"]/y;
    const bareKey = /[A-Za-z_$][\w$.]*/y;

    const matchAt = (re) => {
        re.lastIndex = i;

        return re.exec(body);
    };

    // Whitespace, commas and comments between entries. A comment that starts at `i` is
    // never a string here (a string would be a key), so only the comment branches apply.
    const skipTrivia = () => {
        for (;;) {
            while (i < body.length && /\s|,/.test(body[i])) i++;
            const skipped = body[i] === '/' ? skipTriviaAt(body, i) : -1;
            if (skipped < 0) return;
            i = skipped;
        }
    };

    // `skipValue` returns `i` itself for an empty value (shorthand `customCode,`) — always
    // move at least one character so the loop cannot stall.
    const skipEntryValue = () => {
        i = Math.max(skipValue(body, i), i + 1);
    };

    while (i < body.length) {
        skipTrivia();
        if (i >= body.length) break;

        const start = i;
        const spread = body.startsWith('...', i);
        if (spread) i += 3;

        let key = null;
        const quoted = matchAt(quotedKey);
        const bare = matchAt(bareKey);

        if (!spread && quoted) {
            key = quoted[1];
            i += quoted[0].length;
        } else if (bare) {
            key = bare[0];
            i += bare[0].length;
        } else {
            // An entry we cannot name (e.g. a computed key) — skip ahead to the comma.
            skipEntryValue();
            continue;
        }

        const valueStart = i;
        skipEntryValue();
        entries.push({
            key,
            spread,
            valueText: body
                .slice(valueStart, i)
                .replace(/^\s*[:?]?\s*/, '')
                .trim(),
            start,
        });
    }

    return entries;
}

/**
 * Index of the `,` (or unmatched closer) that ends the value starting at `from`. Brackets
 * are tracked as a stack of expected closers, so a `>` only closes a `<` when a `<` is
 * the innermost open bracket — `a > b`, `>=` and the `>` of `=>` inside `{…}` or `(…)`
 * are comparisons/arrows and leave the nesting alone.
 */
function skipValue(body, from) {
    const closers = { '{': '}', '(': ')', '[': ']', '<': '>' };
    const stack = [];
    let i = from;

    while (i < body.length) {
        const skipped = skipTriviaAt(body, i);

        if (skipped >= 0) {
            i = skipped;
            continue;
        }

        const ch = body[i];

        if (ch === '<' ? isJsxOrGenericOpen(body, i) : ch in closers) {
            stack.push(closers[ch]);
        } else if ('})]'.includes(ch) || (ch === '>' && stack.at(-1) === '>')) {
            if (!stack.length) return i;
            stack.pop();
        } else if (ch === ',' && !stack.length) return i;

        i++;
    }

    return i;
}

// `<` counts as a bracket only when it looks like JSX or a generic (`<Foo`, `</`, `<>`),
// not a comparison — otherwise `a < b` broke the nesting and entries merged into one.
const jsxOrGenericOpen = /<(\/|>|[A-Za-z_$])/y;

const isJsxOrGenericOpen = (text, i) => {
    jsxOrGenericOpen.lastIndex = i;

    return jsxOrGenericOpen.test(text);
};

/** Text inside the object literal assigned to `key: {` (first occurrence). */
function objectBodyAfter(text, pattern, from = 0) {
    const re = new RegExp(pattern, 'g');
    re.lastIndex = from;
    const m = re.exec(text);
    if (!m) return null;
    const open = text.indexOf('{', m.index + m[0].length - 1);
    if (open < 0 || text.slice(m.index + m[0].length - 1, open).trim() !== '') return null;
    const close = matchBrace(text, open);
    if (close < 0) return null;

    return { body: text.slice(open + 1, close), start: open + 1 };
}

/**
 * Body of the object literal a module exports under `name` — or, with no name, as its
 * default export: `export default {…}` directly, or `export default x;` pointing at
 * `const x = {…}`.
 */
function exportedObjectBody(text, name = null) {
    const ident = name ?? /export\s+default\s+([A-Za-z_$][\w$]*)\s*;/.exec(text)?.[1];

    return (
        (ident && objectBodyAfter(text, `\\bconst\\s+${ident}\\s*(?::[^=]+)?=\\s*\\{`)) ||
        (!name && objectBodyAfter(text, 'export\\s+default\\s*\\{')) ||
        null
    );
}

/**
 * Opening JSX tags of component `tagName` with their attribute lists. A `<` counts as
 * JSX only when it does not directly follow an identifier — `Array<Option>` or
 * `useState<Option[]>` are generics, not elements.
 */
function jsxOpeningTags(text, tagName) {
    const results = [];
    const attrName = /[A-Za-z_$][\w$-]*/y;
    const re = new RegExp(`(^|[^\\w$.])<${tagName.replace('.', '\\.')}(?=[\\s/>]|<[A-Z])`, 'g');
    let m;

    while ((m = re.exec(text))) {
        let i = m.index + m[0].length;

        // Generic parameter in JSX: `<Autocomplete<Option> …>`.
        if (text[i] === '<') {
            let depth = 0;

            for (; i < text.length; i++) {
                if (text[i] === '<') depth++;
                if (text[i] === '>') depth--;

                if (depth === 0) {
                    i++;
                    break;
                }
            }
        }

        const props = new Map();
        let spread = false;

        while (i < text.length) {
            while (/\s/.test(text[i])) i++;
            if (text[i] === '/' || text[i] === '>') break;

            if (text[i] === '{') {
                const close = matchBrace(text, i);
                if (close < 0) break;
                if (
                    text
                        .slice(i + 1, close)
                        .trim()
                        .startsWith('...')
                )
                    spread = true;
                i = close + 1;
                continue;
            }

            attrName.lastIndex = i;
            const name = attrName.exec(text);
            if (!name) break;
            i += name[0].length;
            while (/\s/.test(text[i])) i++;
            let value = 'true';

            if (text[i] === '=') {
                i++;
                while (/\s/.test(text[i])) i++;

                if (text[i] === '{') {
                    const close = matchBrace(text, i);
                    if (close < 0) break;
                    value = text.slice(i + 1, close);
                    i = close + 1;
                } else if (text[i] === '"' || text[i] === "'") {
                    const close = skipString(text, i);
                    value = text.slice(i, close + 1);
                    i = close + 1;
                } else if (text[i] === '<') {
                    const close = text.indexOf('>', i);
                    if (close < 0) break;
                    value = text.slice(i, close + 1);
                    i = close + 1;
                }
            }

            props.set(name[0], value);
        }

        results.push({ props, spread, line: lineOf(text, m.index + 1) });
    }

    return results;
}

/** Names of all components (Capitalized / dotted) rendered in the text. */
function jsxComponentTags(text) {
    const tags = new Set();
    const re = /(^|[^\w$.])<([A-Z][\w$]*(?:\.[A-Z][\w$]*)*)(?=[\s/>]|<[A-Z])/g;
    let m;
    while ((m = re.exec(text))) tags.add(m[2]);

    return tags;
}

/**
 * The names under which a file sees component `name`: the name itself plus import
 * aliases (`import { RingDataGrid as RingDataGridComponent }`). Without this, a wrapper
 * rendering the component under an alias looked as if it did not render it at all.
 */
function localNamesOf(text, name) {
    const locals = new Set([name]);
    for (const imp of parseImports(text)) for (const n of imp.names) if (n.imported === name) locals.add(n.local);

    return [...locals];
}

/** Module imports: `{ specifier, names: [{imported, local}], defaultName, index }`. */
function parseImports(text) {
    const imports = [];
    const re = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
    let m;

    while ((m = re.exec(text))) {
        const clause = m[1];
        const entry = { specifier: m[2], names: [], defaultName: null, index: m.index };
        const braces = /\{([^}]*)\}/.exec(clause);

        if (braces) {
            for (const part of braces[1].split(',')) {
                const p = part.trim().replace(/^type\s+/, '');
                if (!p) continue;
                const [imported, local] = p.split(/\s+as\s+/).map((s) => s.trim());
                entry.names.push({ imported, local: local || imported });
            }
        }

        const def = /^\s*(\w+)\s*(,|$)/.exec(clause.replace(/\{[^}]*\}/, '').replace(/\*\s+as\s+\w+/, ''));
        if (def) entry.defaultName = def[1];
        imports.push(entry);
    }

    return imports;
}

function resolveRelative(fromFile, specifier) {
    const base = path.resolve(path.dirname(fromFile), specifier.replace(/\?raw$/, ''));
    const candidates = [base, base.replace(/\.js$/, '.tsx'), base.replace(/\.js$/, '.ts'), `${base}.tsx`, `${base}.ts`];

    return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

function walk(dir, predicate, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, predicate, out);
        else if (predicate(full)) out.push(full);
    }

    return out;
}

// Heading slug in the github-slugger style used by rehype-slug in Storybook: lower case,
// punctuation dropped, EVERY space individually becomes a hyphen — which is why
// "Auto Refresh — Active" yields `auto-refresh--active` with a double hyphen.
const slugify = (heading) =>
    heading
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N} -]/gu, '')
        .replace(/ /g, '-');

const normalizeDefault = (value) =>
    String(value)
        .trim()
        .replace(/^[`'"]+|[`'"]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim();

/**
 * The object literal behind an identifier imported into `fromFile`
 * (`export const x = {…}` or `export default {…}` / `export default x`).
 */
function resolveExportedObject(fromFile, ident) {
    const imp = parseImports(read(fromFile)).find(
        (i) => i.names.some((n) => n.local === ident) || i.defaultName === ident,
    );
    const file = imp && imp.specifier.startsWith('.') ? resolveRelative(fromFile, imp.specifier) : null;

    if (!file) return null;

    const found = exportedObjectBody(read(file), imp.names.find((n) => n.local === ident)?.imported ?? null);

    return found ? { ...found, file } : null;
}

/* ───────────────────────── component model ───────────────────────── */

const findings = [];
const report = (rule, level, component, file, line, message) =>
    findings.push({ rule, level, component, file: rel(file), line, message });

const componentOf = (storiesFile) => rel(path.dirname(storiesFile)).replace(/^stories\/components\//, '');
const storiesFiles = walk(STORIES_ROOT, (f) => /(^|\/)[\w-]+\.stories\.tsx$/.test(f))
    .sort()
    .filter((f) => !filter || componentOf(f).toLowerCase().includes(filter));

/** Index of `export interface|type <Name>Props` in src — for rules 12 and 14. */
const srcFiles = walk(SRC_ROOT, (f) => /\.tsx?$/.test(f) && !/\.(test|stories|d)\.tsx?$/.test(f));
const typeIndex = new Map();

for (const file of srcFiles) {
    const text = read(file);
    const re = /export\s+(interface|type)\s+([A-Z]\w*)\b/g;
    let m;
    while ((m = re.exec(text))) typeIndex.set(m[2], { file, text, kind: m[1], index: m.index });
}

/**
 * Public props of an interface: its own members plus whatever can be pulled in through
 * `extends` within the repo. When the chain contains an external type (MUI,
 * `Omit<MuiProps…>`) the set is OPEN — we know what the component adds, but not what it
 * lacks. In that case only "props → argTypes" may be checked, never the reverse.
 */
function resolveProps(typeName, seen = new Set()) {
    const result = { members: new Map(), open: false };
    if (seen.has(typeName)) return result;
    seen.add(typeName);

    if (typeName === 'PropsWithChildren') {
        result.members.set('children', { doc: '' });

        return result;
    }

    const def = typeIndex.get(typeName);

    if (!def) {
        result.open = true;

        return result;
    }

    const { text, index, kind, file } = def;
    // Type parameters (`<T extends Base = Base>`) sit between the name and the `=` / heritage
    // clause; their `extends` and `=` must not be mistaken for the declaration's own.
    const nameEnd = index + /export\s+(?:interface|type)\s+\w+/.exec(text.slice(index))[0].length;
    const afterParams = /^\s*</.test(text.slice(nameEnd))
        ? scanTopLevel(text, text.indexOf('<', nameEnd) + 1, (ch) => ch === '>') + 1
        : nameEnd;

    if (kind === 'type') {
        const eq = text.indexOf('=', afterParams);
        // An alias ends at the first `;` at depth 0 — without this the scan ran into the
        // function declarations below the alias and took their variables for props.
        const end = scanTopLevel(text, eq + 1, (ch) => ch === ';');

        mergeAliasExpr(text.slice(eq + 1, end), result, seen);

        return result;
    }

    const headEnd = text.indexOf('{', afterParams);
    const head = text.slice(afterParams, headEnd);
    const close = matchBrace(text, headEnd);
    for (const [k, v] of parseMembers(text.slice(headEnd + 1, close), file)) result.members.set(k, v);

    const ext = /\bextends\s+([\s\S]+)$/.exec(head);

    if (ext) {
        for (const base of splitTopLevel(ext[1])) {
            const omit = /^Omit<\s*([A-Z]\w*)\s*,\s*([\s\S]+)>$/.exec(base.trim());
            const plain = /^([A-Z]\w*)$/.exec(base.trim());
            const name = omit ? omit[1] : plain ? plain[1] : null;

            if (!name) {
                result.open = true;
                continue;
            }

            const sub = resolveProps(name, seen);
            const omitted = new Set(omit ? [...omit[2].matchAll(/['"](\w+)['"]/g)].map((x) => x[1]) : []);
            for (const [k, v] of sub.members) if (!omitted.has(k) && !result.members.has(k)) result.members.set(k, v);
            if (sub.open) result.open = true;
        }
    }

    return result;
}

/**
 * Union/intersection of repo type names and object literals — merge them. Anything else
 * (Pick, conditional types, MUI types) makes the set open.
 */
function mergeAliasExpr(expr, result, seen) {
    let part = expr.trim();

    while (part.startsWith('(') && matchBrace(part, 0) === part.length - 1) part = part.slice(1, -1).trim();

    const pieces = splitTopLevel(part, /[|&]/);

    if (pieces.length > 1) {
        for (const piece of pieces) mergeAliasExpr(piece, result, seen);

        return;
    }

    if (/^[A-Z]\w*$/.test(part)) {
        const sub = resolveProps(part, seen);

        for (const [k, v] of sub.members) if (!result.members.has(k)) result.members.set(k, v);
        if (sub.open) result.open = true;
    } else if (part.startsWith('{') && matchBrace(part, 0) === part.length - 1) {
        for (const [k, v] of parseMembers(part.slice(1, -1))) if (!result.members.has(k)) result.members.set(k, v);
    } else if (part) {
        result.open = true;
    }
}

/**
 * A prop value that does nothing but log through Storybook's `action`: the call itself
 * (`action('x')`) or an arrow function whose every statement is such a call applied to
 * its arguments (`(id) => { action('x')(id); }`). A value that merely contains `action`
 * somewhere inside — a list of buttons with `onClick: action(…)`, a handler that also
 * updates state — is substance the example has to show.
 */
function isLoggingOnly(value) {
    const v = value.trim();
    const arrow = /^\(/.test(v) ? matchBrace(v, 0) : -1;
    const afterParams = arrow >= 0 ? /^\s*(?::\s*\w+)?\s*=>\s*/.exec(v.slice(arrow + 1)) : null;

    if (!afterParams) return isActionCall(v);

    let body = v.slice(arrow + 1 + afterParams[0].length).trim();
    if (body.startsWith('{')) body = body.slice(1, -1);

    const statements = splitTopLevel(body, /;/)
        .map((x) => x.trim())
        .filter(Boolean);

    return statements.length > 0 && statements.every((x) => isActionCall(x, true));
}

/** `action(…)`, or with `applied` the invocation `action(…)(…)`, and nothing else. */
function isActionCall(text, applied = false) {
    if (!text.startsWith('action(')) return false;
    const close = matchBrace(text, 'action'.length);
    if (close < 0) return false;
    if (!applied) return close === text.length - 1;
    if (text[close + 1] !== '(') return false;

    return matchBrace(text, close + 1) === text.length - 1;
}

/**
 * Index of the first character at bracket depth 0, from `from` on, for which `stop` holds;
 * `text.length` when there is none. Any of `<{([` opens a level. The `>` of a `=>` is
 * neither a closer nor a stop, so function types do not unbalance the scan.
 */
function scanTopLevel(text, from, stop) {
    let depth = 0;

    for (let i = from; i < text.length; i++) {
        const ch = text[i];
        if (ch === '>' && text[i - 1] === '=') continue;
        if (depth === 0 && stop(ch)) return i;
        if ('<{(['.includes(ch)) depth++;
        if ('>})]'.includes(ch)) depth--;
    }

    return text.length;
}

function splitTopLevel(text, separator = /,/) {
    const parts = [];
    let start = 0;

    for (;;) {
        const i = scanTopLevel(text, start, (ch) => separator.test(ch));
        parts.push(text.slice(start, i));
        if (i >= text.length) return parts;
        start = i + 1;
    }
}

/** Interface members with their preceding JSDoc: `name → { doc, defaultValue }`. */
function parseMembers(body) {
    const members = new Map();
    const memberRe = /^\s*(?:readonly\s+)?(?:(['"])([\w-]+)\1|([A-Za-z_$][\w$]*))\??\s*[:(<]/;
    let depth = 0;
    let i = 0;
    let lastIndex = 0;
    let pendingDoc = '';

    const consume = (end) => {
        const chunk = body.slice(lastIndex, end).trim();
        lastIndex = end;
        if (!chunk) return;

        if (/^\/\*\*[\s\S]*\*\/$/.test(chunk)) {
            pendingDoc = chunk;

            return;
        }

        const m = memberRe.exec(chunk);

        if (m) {
            const dv = /@defaultValue\s+(.+)/.exec(pendingDoc);
            members.set(m[2] || m[3], { doc: pendingDoc, defaultValue: dv ? dv[1].trim() : null });
        }

        pendingDoc = '';
    };

    // Only members at depth 0 — nested objects (`slotProps: { chip?: … }`) are not
    // component props. Angle brackets are not counted: the `=>` in a callback signature
    // threw the counter off and lost every prop after it.
    while (i < body.length) {
        const skipped = skipTriviaAt(body, i);

        if (skipped >= 0) {
            i = skipped;
            continue;
        }

        const ch = body[i];
        if ('{(['.includes(ch)) depth++;
        if ('})]'.includes(ch)) depth--;
        if (depth === 0 && (ch === ';' || ch === ',' || ch === '\n')) consume(i + 1);
        i++;
    }

    consume(body.length);

    return members;
}

/* ───────────────────────── component audit ───────────────────────── */

for (const storiesFile of storiesFiles) {
    const dir = path.dirname(storiesFile);
    const component = componentOf(storiesFile);
    const error = (rule, file, line, message) => report(rule, 'error', component, file, line, message);
    const review = (rule, file, line, message) => report(rule, 'review', component, file, line, message);

    const storiesText = read(storiesFile);
    const storiesImports = parseImports(storiesText);
    const base = path.basename(storiesFile, '.stories.tsx');
    const mdxFile = fs.existsSync(path.join(dir, `${base}.mdx`)) ? path.join(dir, `${base}.mdx`) : null;

    // ── stories.tsx: component, exports, argTypes ──────────────────────────
    const componentIdent = /^\s*component:\s*([A-Za-z_$][\w$.]*)\s*,/m.exec(storiesText)?.[1] || null;
    let componentName = componentIdent;

    // A page can document a MUI component the theme restyles (`Chip`): the package exports no
    // wrapper, so its examples import the component from '@mui/material' and rule 9's
    // "imports nothing from the package" does not apply to them.
    const documentsMuiComponent = storiesImports.some(
        (imp) => imp.specifier === '@mui/material' && imp.names.some((n) => n.local === componentIdent),
    );

    for (const imp of storiesImports) {
        const hit = imp.names.find((n) => n.local === componentIdent);
        if (hit) componentName = hit.imported;
    }

    const exported = new Set();

    for (const m of storiesText.matchAll(/export\s*\{([^}]*)\}/g)) {
        for (const part of m[1].split(',')) {
            const name = part
                .trim()
                .split(/\s+as\s+/)
                .pop();
            if (name) exported.add(name);
        }
    }

    for (const m of storiesText.matchAll(/export\s+const\s+(\w+)/g)) exported.add(m[1]);

    // The name the sidebar shows for a story declared with `export const` here: its `name`, or the
    // one Storybook builds from the identifier. Read with Storybook's own parser, which is what
    // indexes this file. A story re-exported with `export { X }` is left out: the sidebar shows its
    // bare identifier and never reads a `name` set inside the story file.
    const indexedNames = new Map();
    const csf = loadCsf(storiesText, { fileName: storiesFile, makeTitle: (title) => title ?? base }).parse();

    for (const exportName of Object.keys(csf._storyExports)) {
        indexedNames.set(exportName, csf._stories[exportName].name);
    }

    /*
     * Test fixtures: a story tagged `!dev` is hidden from the sidebar and exists only so an e2e
     * test has something to point at. The rules below are about what a READER of the Docs page
     * sees, so they do not apply — a fixture has no Canvas and no authored code example on
     * purpose. Tags must be declared in *.stories.tsx: Storybook indexes this file statically and
     * cannot see tags carried by a re-exported story object.
     */
    const fixtures = new Set(
        Object.entries(csf._stories)
            .filter(([, story]) => story.tags?.includes('!dev'))
            .map(([exportName]) => exportName),
    );

    // `argTypes: { … }` inline, `argTypes: ident` lifted to common/, or `{ ...ident, x: {…} }`
    // shared between components. Each entry remembers the file and position it came from.
    const argTypes = new Map();

    const collectArgTypes = ({ body, start, file }, depth = 0) => {
        const text = read(file);

        for (const entry of topLevelEntries(body)) {
            if (entry.spread) {
                const source = depth < 3 ? resolveExportedObject(file, entry.key) : null;

                if (source) collectArgTypes(source, depth + 1);
                continue;
            }

            const category = /\bcategory:\s*['"`]([^'"`]+)['"`]/.exec(entry.valueText)?.[1] ?? null;
            const summary =
                /\bdefaultValue:\s*\{\s*summary:\s*(['"`])((?:\\.|(?!\1).)*)\1/s.exec(entry.valueText)?.[2] ?? null;

            argTypes.set(entry.key, {
                category,
                summary,
                file,
                line: lineOf(text, start + entry.start),
            });
        }
    };

    const inlineArgTypes = objectBodyAfter(storiesText, '\\bargTypes:\\s*\\{');

    if (inlineArgTypes) {
        collectArgTypes({ ...inlineArgTypes, file: storiesFile });
    } else {
        const ident = /\bargTypes:\s*([A-Za-z_$][\w$]*)\s*,/.exec(storiesText)?.[1];
        const source = ident ? resolveExportedObject(storiesFile, ident) : null;

        if (source) collectArgTypes(source);
    }

    // ── MDX: Canvases, headings, Quick Navigation ──────────────────────────
    let mdxText = '';
    const canvases = [];
    const headings = [];
    const navLinks = [];

    if (!mdxFile) {
        error(2, storiesFile, 1, 'no MDX file next to *.stories.tsx — none of the stories will reach Docs');
    } else {
        mdxText = read(mdxFile);
        let fence = false;
        const lines = mdxText.split('\n');
        let inNav = false;
        let section = null; // the innermost `##` heading so far — blocks attach to it

        lines.forEach((line, idx) => {
            if (/^\s*(```|~~~)/.test(line)) fence = !fence;
            if (fence) return;
            const h = /^(#{2,6})\s+(.+?)\s*#*\s*$/.exec(line);

            if (h) {
                const heading = {
                    level: h[1].length,
                    text: h[2].replace(/:$/, '').trim(),
                    line: idx + 1,
                    blocks: [],
                };
                headings.push(heading);
                if (heading.level === 2) section = heading;
                inNav = heading.level === 2 && /^quick navigation$/i.test(heading.text);

                return;
            }

            if (inNav) {
                for (const l of line.matchAll(/\[([^\]]+)\]\(#([^)]+)\)/g))
                    navLinks.push({ text: l[1], slug: l[2], line: idx + 1 });
            }

            for (const c of line.matchAll(/<(Canvas|Story|ArgTypes|Controls|Source|Description)\b([^>]*)>/g)) {
                const of = /of=\{Stories\.(\w+)\}/.exec(c[2])?.[1] ?? null;
                const block = { kind: c[1], story: of, line: idx + 1 };
                canvases.push(block);
                if (section) section.blocks.push(block);
            }
        });

        // Rule 10 for MDX: the stories import must end in `.stories.js`, not `.tsx`.
        for (const imp of parseImports(mdxText)) {
            if (/\.stories\.tsx?$/.test(imp.specifier)) {
                error(
                    10,
                    mdxFile,
                    lineOf(mdxText, imp.index),
                    `import '${imp.specifier}' — MDX must import stories with the .js extension`,
                );
            }
        }
    }

    const canvasRefs = new Set(canvases.filter((c) => c.kind === 'Canvas' && c.story).map((c) => c.story));

    // ── story files in stories/ ────────────────────────────────────────────
    const storyDir = path.join(dir, 'stories');
    const storyFiles = tsFilesIn(storyDir);
    const codeDir = path.join(storyDir, 'code');

    // Who imports whom — a file with no story export that a story imports is a live
    // example or a lazy demo, not an orphan.
    const importedBy = new Map();

    for (const file of [storiesFile, ...storyFiles]) {
        const text = read(file);
        // Static imports plus `lazy(() => import('./X.demo.js'))` — a lazily loaded demo is
        // in use too.
        const specifiers = [
            ...parseImports(text).map((i) => i.specifier),
            ...[...text.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]),
        ];

        for (const specifier of specifiers) {
            if (!specifier.startsWith('.')) continue;
            const target = resolveRelative(file, specifier);
            if (target) importedBy.set(target, [...(importedBy.get(target) || []), file]);
        }
    }

    const stories = new Map(); // exportName → { file, displayName, codeFile, ... }

    for (const file of storyFiles) {
        const text = read(file);
        const fileBase = path.basename(file).replace(/\.tsx?$/, '');

        if (text.trim() === '') {
            error(4, file, 1, 'file is 0 bytes — it exports no story and nothing that could be imported');
            continue;
        }

        const storyExports = [...text.matchAll(/export\s+const\s+(\w+)\s*:\s*(?:Story|StoryObj\b)/g)].map((m) => ({
            name: m[1],
            index: m.index,
        }));

        if (!storyExports.length) {
            if (!importedBy.has(file)) {
                error(4, file, 1, 'file exports no story and nothing in the component directory imports it');
            }

            continue;
        }

        // Rule 10: relative imports of stories/helpers end in `.js`, raw code in `.tsx?raw`.
        const imports = parseImports(text);

        for (const imp of imports) {
            if (!imp.specifier.startsWith('.')) continue;
            const ok =
                /\.js$/.test(imp.specifier) ||
                /\.tsx\?raw$/.test(imp.specifier) ||
                /\.(svg|png|jpg|css|json|mdx)$/.test(imp.specifier);

            if (!ok) {
                error(
                    10,
                    file,
                    lineOf(text, imp.index),
                    `import '${imp.specifier}' — relative import without '.js' (or '.tsx?raw' for a code example)`,
                );
            }
        }

        if (storyExports.length > 1) {
            error(
                6,
                file,
                lineOf(text, storyExports[1].index),
                `file exports ${storyExports.length} stories (${storyExports.map((s) => s.name).join(', ')}) — one story per file`,
            );
        } else if (storyExports[0].name !== fileBase) {
            error(
                6,
                file,
                lineOf(text, storyExports[0].index),
                `export '${storyExports[0].name}' in file '${path.basename(file)}' — the file name must equal the story name`,
            );
        }

        for (const { name, index } of storyExports) {
            // Story object body → `name:`, `args:`, `customCode:`.
            const objStart = text.indexOf('{', text.indexOf('=', index));
            const objEnd = matchBrace(text, objStart);
            const body = text.slice(objStart + 1, objEnd);
            const entries = topLevelEntries(body);
            const nameEntry = entries.find((e) => e.key === 'name' && !e.spread);
            const explicitName = nameEntry ? (/^['"`](.*)['"`]$/.exec(nameEntry.valueText)?.[1] ?? null) : null;
            const indexedName = indexedNames.get(name) ?? null;
            const displayName = indexedName ?? explicitName ?? storyNameFromExport(name);

            // `customCode: Ident` or the shorthand `customCode,` (a variable named like the key).
            const customCodeMatch = /\bcustomCode\s*(?::\s*([A-Za-z_$][\w$]*)|(?=\s*[,}]))/.exec(body);
            const customCodeIdent = customCodeMatch ? customCodeMatch[1] || 'customCode' : null;
            const codeImport = customCodeIdent ? imports.find((i) => i.defaultName === customCodeIdent) : null;
            const codeFile = codeImport ? resolveRelative(file, codeImport.specifier) : null;

            stories.set(name, { file, text, entries, displayName, explicitName, indexedName, codeFile, imports });

            // Rule 1: a story defined in a file must be re-exported from *.stories.tsx.
            if (!exported.has(name)) {
                error(
                    1,
                    file,
                    lineOf(text, index),
                    `story '${name}' is not re-exported from ${path.basename(storiesFile)} — Storybook does not see it`,
                );
            }

            // Rule 7: the example lives in `code/<Story>Example.tsx` and it is the `customCode`.
            // A fixture renders nothing for a reader, so it carries no authored example either.
            const expectedCode = path.join(codeDir, `${name}Example.tsx`);

            if (!codeFile && fixtures.has(name)) {
                // nothing to check
            } else if (!codeFile) {
                error(
                    7,
                    file,
                    lineOf(text, index),
                    `story '${name}' does not provide 'customCode' from a code/ file — Docs will show generated code, not an authored example`,
                );
            } else if (!path.basename(codeFile).startsWith(name)) {
                error(
                    7,
                    file,
                    lineOf(text, codeImport.index),
                    `story '${name}' shows code from '${path.basename(codeFile)}' in Docs — another story's example`,
                );
            } else if (codeFile !== expectedCode) {
                error(
                    7,
                    codeFile,
                    1,
                    `example file is named '${path.basename(codeFile)}', convention: '${name}Example.tsx'`,
                );
            }
        }
    }

    // Rules 2/3: every exported story has a Canvas; every `Stories.X` exists.
    // Rule 1 from the other side: an export from stories.tsx that no file in stories/ defines.
    const lineOfExport = (name) => lineOf(storiesText, storiesText.search(new RegExp(`\\b${name}\\b`)));

    for (const name of exported) {
        if (name === 'default') continue;

        if (mdxFile && !canvasRefs.has(name) && !fixtures.has(name)) {
            error(
                2,
                storiesFile,
                lineOfExport(name),
                `story '${name}' has no <Canvas of={Stories.${name}} /> in ${path.basename(mdxFile)}`,
            );
        }

        if (!stories.has(name)) {
            const imp = storiesImports.find((i) => i.names.some((n) => n.local === name));
            const target = imp && imp.specifier.startsWith('.') ? resolveRelative(storiesFile, imp.specifier) : null;

            if (!target || !target.startsWith(storyDir)) {
                error(
                    1,
                    storiesFile,
                    lineOfExport(name),
                    `export '${name}' does not come from a file in stories/ — story outside the directory layout`,
                );
            }
        }
    }

    for (const c of canvases) {
        if (c.story && !exported.has(c.story)) {
            error(
                3,
                mdxFile,
                c.line,
                `<${c.kind} of={Stories.${c.story}} /> — '${c.story}' is not exported from ${path.basename(storiesFile)} (at runtime: "Invalid value passed to the 'of' prop")`,
            );
        }
    }

    // Rule 5: Quick Navigation. An entry is required ONLY of `##` sections that render a
    // Storybook block (Canvas/ArgTypes). Purely prose headings ("Key Features", "Usage
    // Example") are usually `###` inside a story section or `##` without a block —
    // WritingStories asks for links to stories and Component API, not to every paragraph,
    // so demanding one for prose would raise alarms with no backing in the convention.
    if (mdxFile) {
        const nav = headings.find((h) => h.level === 2 && /^quick navigation$/i.test(h.text));
        const sections = headings.filter(
            (h) => h.level === 2 && h.blocks.some((b) => b.kind === 'Canvas' || b.kind === 'ArgTypes'),
        );

        if (!nav) {
            if (sections.length) error(5, mdxFile, 1, 'no "## Quick Navigation" section');
        } else {
            const slugs = new Set(navLinks.map((l) => l.slug));

            for (const s of sections) {
                if (!slugs.has(slugify(s.text))) {
                    error(
                        5,
                        mdxFile,
                        s.line,
                        `section "${s.text}" with a Canvas has no Quick Navigation entry (expected link #${slugify(s.text)})`,
                    );
                }
            }

            const headingSlugs = new Set(headings.map((h) => slugify(h.text)));

            for (const l of navLinks) {
                if (!headingSlugs.has(l.slug))
                    error(5, mdxFile, l.line, `link "${l.text}" → #${l.slug} does not lead to any heading`);
            }
        }
    }

    // Rule 8: the heading above a Canvas = the story name (explicit, or generated by Storybook
    // from the export identifier). A name given in *.stories.tsx is what the sidebar shows, so
    // every such story must repeat it exactly in its `##` heading, or in a `###` between the previous
    // Canvas and its own when it is a variant listed under its feature's section. The other stories are compared
    // ignoring case, and for a section with several of them it is enough that ANY one matches.
    for (const section of headings.filter((h) => h.level === 2)) {
        const storiesHere = section.blocks.filter((b) => b.kind === 'Canvas' && b.story && stories.has(b.story));
        if (!storiesHere.length) continue;

        // The `###` headings that belong to a Canvas: those after the previous Canvas of the section.
        const subheadingsOf = (block) => {
            const from = Math.max(section.line, ...storiesHere.filter((b) => b.line < block.line).map((b) => b.line));

            return headings.filter((h) => h.level === 3 && h.line > from && h.line < block.line).map((h) => h.text);
        };

        for (const block of storiesHere.filter((b) => stories.get(b.story).indexedName !== null)) {
            const story = stories.get(block.story);
            if ([section.text, ...subheadingsOf(block)].includes(story.displayName)) continue;
            error(
                8,
                mdxFile,
                section.line,
                `heading "${section.text}" but story '${block.story}' is named "${story.displayName}" (from ${path.basename(storiesFile)}) — repeat it in the ## or in a ### above its Canvas`,
            );
        }

        const legacy = storiesHere.filter((b) => stories.get(b.story).indexedName === null);
        const matches = (story) => story.displayName.toLowerCase() === section.text.toLowerCase();

        if (legacy.length && !legacy.some((b) => matches(stories.get(b.story)))) {
            const first = stories.get(legacy[0].story);
            error(
                8,
                mdxFile,
                section.line,
                `heading "${section.text}" but story '${legacy[0].story}' is named "${first.displayName}"${first.explicitName ? ' (name:)' : ''}`,
            );
        }
    }

    // ── code/: imports (9) and substance match (11) ────────────────────────
    const codeFiles = tsFilesIn(codeDir);
    const usedCodeFiles = new Set([...stories.values()].map((s) => s.codeFile).filter(Boolean));

    for (const file of codeFiles) {
        const text = read(file);

        if (text.trim() === '') {
            error(4, file, 1, 'example file is 0 bytes');
            continue;
        }

        if (!usedCodeFiles.has(file)) {
            error(4, file, 1, 'code example that no story provides as customCode');
        }

        for (const imp of parseImports(text)) {
            if (imp.specifier.startsWith('.') || /(^|\/)src\//.test(imp.specifier)) {
                error(
                    9,
                    file,
                    lineOf(text, imp.index),
                    `import '${imp.specifier}' — the example must import from '${PACKAGE_NAME}', not from a relative path`,
                );
            }
        }

        if (!documentsMuiComponent && !text.includes(`'${PACKAGE_NAME}'`) && !text.includes(`"${PACKAGE_NAME}"`)) {
            error(9, file, 1, `example imports nothing from '${PACKAGE_NAME}'`);
        }
    }

    // Rule 11 (to review): what the story passes to the component versus what the example
    // shows. Story = `args` (with spread objects such as `defaultArgs` expanded) + JSX
    // attributes in the story file and in the live examples it imports. Example = JSX
    // attributes of the component in the `code/` file. Additionally: components rendered on
    // one side only — an example with an extra `<Typography>` shows something the story does
    // not have.

    // `common/` is the shared story setup: defaultArgs with children and icons, wrappers
    // adding props. Without it every `<Button>` from defaultArgs would look like an element
    // the example invented on its own.
    const commonText = tsFilesIn(path.join(dir, 'common')).map(read).join('\n');

    if (componentName) {
        for (const [name, story] of stories) {
            if (!story.codeFile || !fs.existsSync(story.codeFile)) continue;
            const codeText = read(story.codeFile);
            const codeTags = localNamesOf(codeText, componentName).flatMap((local) => jsxOpeningTags(codeText, local));
            if (!codeTags.length) continue; // the example composes something else — nothing to compare

            // Story side: the file + live examples/demos imported from ./ (not code/).
            const sideTexts = [story.text];

            for (const imp of story.imports) {
                if (
                    !imp.specifier.startsWith('./') ||
                    imp.specifier.includes('/code/') ||
                    imp.specifier.endsWith('?raw')
                )
                    continue;
                const target = resolveRelative(story.file, imp.specifier);
                if (target && target.startsWith(storyDir) && !target.startsWith(codeDir)) sideTexts.push(read(target));
            }

            const storyText = [...sideTexts, commonText].join('\n');

            const storyProps = new Map();
            const loggingOnly = new Set();
            // Props inherited solely from a spread object (`...defaultArgs`) are the background
            // shared by every story of the component (usually repeating the component's
            // defaults). The example may omit them; the story's substance is what it overrides.
            const baseline = new Set();
            let unresolvedSpread = false;
            const argsEntry = story.entries.find((e) => e.key === 'args' && !e.spread);
            // `args: { … } as Props` — take only the literal, the cast stays outside the braces.
            const argsOpen = argsEntry ? argsEntry.valueText.indexOf('{') : -1;
            const argsBody =
                argsOpen >= 0
                    ? argsEntry.valueText.slice(argsOpen + 1, matchBrace(argsEntry.valueText, argsOpen))
                    : null;

            if (argsBody !== null) {
                for (const e of topLevelEntries(argsBody)) {
                    if (e.spread) {
                        const source = resolveExportedObject(story.file, e.key);

                        if (source) {
                            for (const k of topLevelEntries(source.body)
                                .filter((x) => !x.spread)
                                .map((x) => x.key)) {
                                storyProps.set(k, e.key);
                                baseline.add(k);
                            }
                        } else unresolvedSpread = true;
                        continue;
                    }

                    storyProps.set(e.key, e.valueText);
                    baseline.delete(e.key);
                    if (isLoggingOnly(e.valueText)) loggingOnly.add(e.key);
                }
            }

            // Wrappers from `common/` add props to every story of the component — the same
            // background as `defaultArgs`, so they enter storyProps as baseline.
            for (const [text, shared] of [...sideTexts.map((t) => [t, false]), [commonText, true]]) {
                for (const local of localNamesOf(text, componentName)) {
                    for (const tag of jsxOpeningTags(text, local)) {
                        for (const [k, v] of tag.props) {
                            storyProps.set(k, v);
                            if (shared) baseline.add(k);
                            else baseline.delete(k);
                            if (isLoggingOnly(v)) loggingOnly.add(k);
                        }
                    }
                }
            }

            const codeProps = new Map();
            let codeSpread = false;

            for (const tag of codeTags) {
                for (const [k, v] of tag.props) codeProps.set(k, v);
                if (tag.spread) codeSpread = true;
            }

            const equivalent = (k, other) =>
                EQUIVALENT_PROPS.some((pair) => pair.includes(k) && pair.some((p) => other.has(p)));
            const onlyInStory = [...storyProps.keys()].filter(
                (k) =>
                    !codeProps.has(k) &&
                    !WRAPPER_PROPS.has(k) &&
                    !loggingOnly.has(k) &&
                    !baseline.has(k) &&
                    !equivalent(k, codeProps),
            );
            const onlyInCode = [...codeProps.keys()].filter(
                (k) => !storyProps.has(k) && !WRAPPER_PROPS.has(k) && !equivalent(k, storyProps),
            );

            if (onlyInStory.length && !codeSpread) {
                review(
                    11,
                    story.codeFile,
                    codeTags[0].line,
                    `'${name}': story passes ${onlyInStory.map((k) => `'${k}'`).join(', ')}, example does not`,
                );
            }

            if (onlyInCode.length && !unresolvedSpread) {
                review(
                    11,
                    story.codeFile,
                    codeTags[0].line,
                    `'${name}': example passes ${onlyInCode.map((k) => `'${k}'`).join(', ')}, story does not`,
                );
            }

            const storyTags = jsxComponentTags(storyText);
            const codeOnlyTags = [...jsxComponentTags(codeText)].filter(
                (t) => t !== componentName && !LAYOUT_TAGS.has(t) && !storyTags.has(t),
            );

            if (codeOnlyTags.length) {
                review(
                    11,
                    story.codeFile,
                    1,
                    `'${name}': example renders ${codeOnlyTags.map((t) => `<${t}>`).join(', ')}, which the story does not render`,
                );
            }
        }
    }

    // ── API versus argTypes (12–14, to review) ─────────────────────────────
    if (componentName && argTypes.size) {
        const propsType = `${componentName}Props`;
        const resolved = typeIndex.has(propsType) ? resolveProps(propsType) : null;
        const argRoots = new Set([...argTypes.keys()].map((k) => k.split('.')[0]));

        if (resolved) {
            for (const [prop, meta] of resolved.members) {
                // `children` arrives via PropsWithChildren on every component, including those that
                // do not render children; `data-*` are DOM attributes, not the component's API.
                if (prop === 'children' || prop.startsWith('data-')) continue;

                const arg = argTypes.get(prop);

                if (!argRoots.has(prop)) {
                    review(12, storiesFile, null, `prop '${prop}' from ${propsType} has no argTypes entry`);
                } else if (meta.defaultValue !== null && arg?.summary !== null && arg?.summary !== undefined) {
                    const a = normalizeDefault(meta.defaultValue);
                    const b = normalizeDefault(arg.summary);

                    if (a !== b) {
                        review(
                            14,
                            arg.file,
                            arg.line,
                            `'${prop}': argTypes defaultValue "${b}" ≠ JSDoc @defaultValue "${a}" in ${rel(typeIndex.get(propsType).file)}`,
                        );
                    }
                }
            }

            if (!resolved.open) {
                for (const root of argRoots) {
                    if (!resolved.members.has(root)) {
                        review(
                            12,
                            argTypes.get(root)?.file ?? storiesFile,
                            argTypes.get(root)?.line ?? null,
                            `argTypes describes '${root}', which does not exist in ${propsType}`,
                        );
                    }
                }
            }
        }

        for (const [key, meta] of argTypes) {
            if (meta.category && !ALLOWED_CATEGORIES.has(meta.category)) {
                review(
                    13,
                    meta.file,
                    meta.line,
                    `'${key}': category '${meta.category}' outside the set ${[...ALLOWED_CATEGORIES].join('/')}`,
                );
            }
        }
    }
}

/* ───────────────────────── report ───────────────────────── */

const perRule = new Map();
for (const f of findings) perRule.set(f.rule, (perRule.get(f.rule) || 0) + 1);
const errors = findings.filter((f) => f.level === 'error');
const reviews = findings.filter((f) => f.level === 'review');

const RULE_LABEL = {
    1: 'story not re-exported / export from outside stories/',
    2: 'story without <Canvas> in MDX',
    3: 'MDX references a non-existent story',
    4: 'orphaned file',
    5: 'Quick Navigation',
    6: 'file name ≠ story name',
    7: 'code/<Story>Example.tsx file and customCode',
    8: 'MDX heading ≠ story name',
    9: 'imports in code/ from outside the package',
    10: 'import extensions',
    11: 'example substance vs story (heuristic)',
    12: 'interface props ↔ argTypes',
    13: 'argTypes category outside the set',
    14: 'defaultValue: argTypes ≠ JSDoc',
};

function printGroup(list) {
    const byComponent = new Map();
    for (const f of list) byComponent.set(f.component, [...(byComponent.get(f.component) || []), f]);

    for (const [component, items] of [...byComponent].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
        console.log('─'.repeat(78));
        console.log(`${component}  (${items.length})`);

        for (const f of items.sort(
            (a, b) => a.rule - b.rule || a.file.localeCompare(b.file) || (a.line || 0) - (b.line || 0),
        )) {
            console.log(`  [R${String(f.rule).padStart(2)}] ${f.file}${f.line ? `:${f.line}` : ''}`);
            console.log(`        ${f.message}`);
        }
    }
}

console.log(
    `Scanned ${storiesFiles.length} components in ${rel(STORIES_ROOT)}${filter ? ` (filter: ${filter})` : ''}\n`,
);

if (!flags.has('--summary')) {
    if (errors.length) {
        console.log(`ERRORS (${errors.length}) — inconsistencies between files that the convention rules out`);
        printGroup(errors);
        console.log('─'.repeat(78));
    }

    if (reviews.length) {
        console.log(`\nTO REVIEW (${reviews.length}) — heuristics, every hit needs a human judgement`);
        printGroup(reviews);
        console.log('─'.repeat(78));
    }
}

console.log('\nHits per rule:');

for (const rule of Object.keys(RULE_LABEL).map(Number)) {
    const n = perRule.get(rule) || 0;
    console.log(
        `  R${String(rule).padStart(2)}  ${String(n).padStart(4)}  ${RULE_LABEL[rule]}${rule >= 11 ? '  [to review]' : ''}`,
    );
}

console.log(`\nErrors: ${errors.length}, to review: ${reviews.length}`);

// As in docscan: set the exit code instead of calling `process.exit()` so stdout is not cut off.
process.exitCode = errors.length || (flags.has('--strict') && reviews.length) ? 1 : 0;
