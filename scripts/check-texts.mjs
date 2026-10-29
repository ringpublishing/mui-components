/*
 * Checks the texts this package ships — CHANGELOG.md, the migration guide, Storybook pages, README, docs/ and the
 * comments in src/ — before they are committed.
 *
 * Only the mechanical rules live here; whether a line is true, short enough or in the right place is judged by the
 * `release-texts` skill (.github/skills/release-texts/SKILL.md). Every rule reads the staged change, so text that was
 * already in the repository is not reported again.
 *
 * Usage:  node scripts/check-texts.mjs              staged changes, run by .husky/pre-commit
 *         node scripts/check-texts.mjs --reviewed   the same, then records that the staged texts were reviewed
 *         node scripts/check-texts.mjs --hook       Claude Code PreToolUse hook for `git commit` (.claude/settings.json)
 *         node scripts/check-texts.mjs --all        every tracked text as if it were new (an audit; ignores the history rules)
 *
 * Exit code 1 on an error; warnings never fail. `git commit --no-verify` skips the husky run.
 */
/* eslint-disable no-console -- the report goes to stdout/stderr */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const flag = ['--hook', '--reviewed', '--all'].find((f) => process.argv.includes(f));
const mode = flag ? flag.slice(2) : 'staged';

// Paths the public mirror leaves out (see the sync-to-public workflow); everything else is published.
const UNPUBLISHED = [/^\.github\//, /^deploy\//, /^\.env$/, /^e2e\/variant\.setup\.ts$/, /^e2e\/variantSelection\.ts$/];
const MIGRATION_GUIDE = /^stories\/migrations\//;
// Decision records describe what was decided and when, so history is their subject.
const HISTORY = /^docs\/adr\//;
// Pages that describe the current state only: the comparison with an earlier major belongs to the migration guide.
const CURRENT_STATE_DOCS = (file) =>
    (/^stories\/.*\.mdx$/.test(file) && !MIGRATION_GUIDE.test(file)) ||
    file === 'README.md' ||
    (/^docs\/.*\.md$/.test(file) && !HISTORY.test(file));
const SOURCE = /^src\/.*\.tsx?$/;
const PROSE = /\.(md|mdx)$/;

// Issue keys look like `ABC-123` / `ABC12-3`; these prefixes are standards or this repo's own ADR numbering.
const ISSUE_KEY = /\b(?!(?:ADR|UTF|ISO|RFC|CVE|ECMA|WCAG)-)[A-Z][A-Z0-9]+-\d+\b/;
const DESIGN_FILE = /figma\.com|node-id=/i;
// Hostnames and names of internal tools and repositories; a published file never points a consumer at them.
const INTERNAL_REFERENCE = /\b(?:jira|doc|confluence|stash)\.[a-z0-9-]+\.(?:pl|tech|com)\b|\bui-lead\b/i;
const OTHER_LOOK =
    /\b(previous|legacy|old|new) look\b|\bthe redesign\b|\bredesigned look\b|\b(next|reference) theme\b|version=["'](next|reference)["']/i;
const PRERELEASE =
    /\d+\.\d+\.\d+-(alpha|beta|rc)\b|\b(alpha|beta)[ .-]?\d+\b|\b(alpha|beta) (version|release|build|tag|channel)\b/i;
const NOTE_TAG = /\b(TODO|FIXME|XXX|HACK)\b/;
const PR_NUMBER = /(^|[\s(])#\d{2,}\b/;
const RATIONALE = /\b(because|so that|in order to|to avoid)\b/i;
const TRANSITIONAL = /\b(no longer|previously|anymore|for now|follow-up|in a future)\b/i;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const gitOrEmpty = (...args) => {
    try {
        return git(...args);
    } catch {
        return '';
    }
};

const errors = [];
const warnings = [];
const report = (list, file, line, rule, text) => list.push({ file, line, rule, text: text.trim().slice(0, 160) });

/** Added lines of every staged file, with their line numbers in the staged version. */
function stagedAdditions() {
    const diff = git('diff', '--cached', '--unified=0', '--no-color', '--diff-filter=ACMR');
    const files = new Map();
    let file = null;
    let lineNo = 0;

    for (const raw of diff.split('\n')) {
        if (raw.startsWith('+++ ')) {
            file = raw === '+++ /dev/null' ? null : raw.slice(6);
            if (file && !files.has(file)) files.set(file, []);
        } else if (raw.startsWith('@@')) {
            lineNo = Number(/\+(\d+)/.exec(raw)[1]);
        } else if (file && raw.startsWith('+')) {
            files.get(file).push({ line: lineNo, text: raw.slice(1) });
            lineNo += 1;
        }
    }

    return files;
}

/** Old-side line numbers of removed lines in one staged file. */
function stagedRemovals(file) {
    const diff = git('diff', '--cached', '--unified=0', '--no-color', '--', file);
    const removed = [];
    let lineNo = 0;

    for (const raw of diff.split('\n')) {
        if (raw.startsWith('@@')) lineNo = Number(/-(\d+)/.exec(raw)[1]);
        else if (raw.startsWith('-') && !raw.startsWith('---')) {
            removed.push(lineNo);
            lineNo += 1;
        }
    }

    return removed;
}

const isComment = (text) => /^\s*(\/\/|\/\*|\*)/.test(text);

/** Line numbers (1-based) of the `## [x.y.z]` headings. */
const versionHeadings = (content) =>
    content.split('\n').flatMap((text, index) => (/^## \[/.test(text) ? [index + 1] : []));

/** The first `## [x.y.z]` section is the one still being written; the ones below it are released and frozen. */
function openSection(content) {
    const lines = content.split('\n');
    const [start, end = lines.length + 1] = versionHeadings(content);

    return start ? lines.slice(start, end - 1).map((text, index) => ({ line: start + 1 + index, text })) : [];
}

function checkChangelog(added) {
    const staged = gitOrEmpty('show', ':CHANGELOG.md');
    const head = gitOrEmpty('show', 'HEAD:CHANGELOG.md');
    const open = openSection(staged);
    const addedLines = new Set(added.map((a) => a.line));
    let breakingNow = 0;

    for (const { line, text } of open) {
        if (/\*\*BREAKING\*\*/.test(text)) breakingNow += 1;
        if (!addedLines.has(line)) continue;
        if (text.trim() === '' || /^### /.test(text) || /^\*\*/.test(text)) continue;

        if (!/^- \[@[\w-]+\]: \S/.test(text)) {
            report(errors, 'CHANGELOG.md', line, 'one line per entry, `- [@login]: …`', text);
            continue;
        }

        const claimsBreaking = /\bBREAKING\b/.test(text) || /\*\*\s*breaking/i.test(text);

        if (claimsBreaking && !/^- \[@[\w-]+\]: \*\*BREAKING\*\* — /.test(text))
            report(errors, 'CHANGELOG.md', line, 'mark breaking entries `**BREAKING** — ` right after the login', text);
        if (PRERELEASE.test(text))
            report(
                errors,
                'CHANGELOG.md',
                line,
                'describe the change since the last release, not a prerelease step',
                text,
            );
        if (RATIONALE.test(text)) report(warnings, 'CHANGELOG.md', line, 'rationale belongs to the PR, not here', text);
    }

    if (mode === 'all') return;

    // Released sections are frozen: nothing below the second version heading may change.
    const [, frozenFrom] = versionHeadings(staged);
    const [, frozenFromHead] = versionHeadings(head);
    const touchesFrozen =
        (frozenFrom && added.some((a) => a.line >= frozenFrom)) ||
        (frozenFromHead && stagedRemovals('CHANGELOG.md').some((line) => line >= frozenFromHead));
    if (touchesFrozen)
        report(errors, 'CHANGELOG.md', frozenFrom ?? 0, 'released sections are frozen; edit only the top section', '');

    // A new breaking entry needs its migration-guide section in the same commit.
    const breakingBefore = openSection(head).filter(({ text }) => /\*\*BREAKING\*\*/.test(text)).length;
    const guideStaged = git('diff', '--cached', '--name-only')
        .split('\n')
        .some((f) => MIGRATION_GUIDE.test(f));
    if (breakingNow > breakingBefore && !guideStaged)
        report(
            errors,
            'CHANGELOG.md',
            0,
            'a new **BREAKING** entry needs its section in stories/migrations/ in the same commit',
            '',
        );
}

/** GitHub-style heading slug, which is what the docs' `#anchor` links resolve against. */
const slug = (heading) =>
    heading
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .trim()
        .replace(/\s/g, '-');

function checkAnchors(file) {
    const content = gitOrEmpty('show', `:${file}`);
    const seen = new Map();
    const ids = new Set();
    const lines = content.split('\n');
    let fenced = false;
    const prose = lines.map((text) => {
        if (/^\s*(```|~~~)/.test(text)) fenced = !fenced;

        return fenced ? '' : text;
    });

    for (const text of prose) {
        const heading = /^#{1,6}\s+(.*)$/.exec(text);
        if (!heading) continue;
        const base = slug(heading[1]);
        const count = seen.get(base) ?? 0;
        ids.add(count ? `${base}-${count}` : base);
        seen.set(base, count + 1);
    }

    prose.forEach((text, index) => {
        // A link written inside inline code (`[text](#anchor)`) shows link syntax, it is not a link.
        for (const [, anchor] of text.replace(/`[^`]*`/g, '').matchAll(/\]\(#([^)\s]+)\)/g))
            if (!ids.has(anchor)) report(errors, file, index + 1, `link to a missing heading: #${anchor}`, text);
    });
}

function checkAddedLines(file, added) {
    // This script spells out the patterns it looks for, so it is the one published file they may appear in.
    const published = !UNPUBLISHED.some((re) => re.test(file)) && file !== 'scripts/check-texts.mjs';
    const source = SOURCE.test(file);

    for (const { line, text } of added) {
        const prose = PROSE.test(file) || (source && isComment(text));
        if (published && ISSUE_KEY.test(text))
            report(errors, file, line, 'issue-tracker key in a published file', text);
        if (published && DESIGN_FILE.test(text))
            report(errors, file, line, 'design-file link in a published file', text);
        if (published && INTERNAL_REFERENCE.test(text))
            report(errors, file, line, 'reference to an internal tool or repository in a published file', text);
        if ((CURRENT_STATE_DOCS(file) || (source && isComment(text))) && OTHER_LOOK.test(text))
            report(errors, file, line, 'describe the current look only; comparisons go to the migration guide', text);

        if (source && isComment(text)) {
            if (NOTE_TAG.test(text)) report(errors, file, line, 'no TODO/FIXME notes in comments', text);
            if (PRERELEASE.test(text)) report(errors, file, line, 'no prerelease versions in comments', text);
            if (PR_NUMBER.test(text)) report(errors, file, line, 'no PR or issue numbers in comments', text);
        }

        if (
            prose &&
            file !== 'CHANGELOG.md' &&
            !MIGRATION_GUIDE.test(file) &&
            !HISTORY.test(file) &&
            TRANSITIONAL.test(text)
        )
            report(warnings, file, line, 'transitional wording; describe the code as it is', text);
    }

    if (source) checkCommentLength(file, added);
}

/** Warns about an added comment block of more than two sentences. */
function checkCommentLength(file, added) {
    let block = [];

    const flush = () => {
        const words = block.map((a) => a.text.replace(/^\s*(\/\/+|\/\*+|\*\/?|\*)\s?/, '').replace(/\*\/\s*$/, ''));
        // The description ends where the JSDoc tags (`@param`, `@default`, …) begin.
        const tagAt = words.findIndex((w) => /^@\w/.test(w.trim()));
        const prose = words
            .slice(0, tagAt === -1 ? undefined : tagAt)
            .join(' ')
            .replace(/(^|\s)@\w[\s\S]*$/, '')
            .replace(/`[^`]*`/g, 'x')
            .replace(/\b(e\.g|i\.e|etc|vs|cf|incl)\./gi, '$1');
        const sentences = prose.split(/[.!?](?:\s|$)/).filter((s) => /[a-z]{3}/i.test(s));
        if (sentences.length > 2)
            report(warnings, file, block[0].line, `comment of ${sentences.length} sentences; aim for 1–2`, words[0]);
        block = [];
    };

    for (const entry of added) {
        if (isComment(entry.text) && (!block.length || entry.line === block[block.length - 1].line + 1))
            block.push(entry);
        else {
            if (block.length) flush();
            if (isComment(entry.text)) block.push(entry);
        }
    }

    if (block.length) flush();
}

/** Staged files whose added lines are prose: Markdown/MDX anywhere, or comments in the source. */
const touchesTexts = (additions) =>
    [...additions].some(
        ([file, added]) => PROSE.test(file) || (SOURCE.test(file) && added.some((a) => isComment(a.text))),
    );

const markerPath = () => path.resolve(git('rev-parse', '--git-path', 'release-texts-reviewed').trim());
const stagedTree = () => git('write-tree').trim();

/** Every line of every tracked text file, as if all of it were new. */
function allAdditions() {
    const files = git('ls-files', 'CHANGELOG.md', 'README.md', 'docs', 'stories', 'src', '.github/instructions')
        .split('\n')
        .filter((f) => /\.(md|mdx|ts|tsx)$/.test(f));

    return new Map(
        files.map((f) => [
            f,
            fs
                .readFileSync(f, 'utf8')
                .split('\n')
                .map((text, i) => ({ line: i + 1, text })),
        ]),
    );
}

function runChecks() {
    const additions = mode === 'all' ? allAdditions() : stagedAdditions();

    for (const [file, added] of additions) {
        if (file === 'CHANGELOG.md') checkChangelog(added);
        if (/\.mdx?$/.test(file)) checkAnchors(file);
        checkAddedLines(file, added);
    }

    return additions;
}

const format = ({ file, line, rule, text }) =>
    `  ${file}${line ? `:${line}` : ''} — ${rule}${text ? `\n      ${text}` : ''}`;

function printReport(stream) {
    if (warnings.length)
        stream.write(`check-texts: ${warnings.length} warning(s)\n${warnings.map(format).join('\n')}\n`);
    if (errors.length) stream.write(`check-texts: ${errors.length} error(s)\n${errors.map(format).join('\n')}\n`);
}

if (mode === 'hook') {
    // Claude Code passes the tool call on stdin; the commit runs in its `cwd`.
    const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
    if (input.cwd) process.chdir(input.cwd);
    const additions = runChecks();
    if (!touchesTexts(additions) && !errors.length) process.exit(0);
    let reviewed = '';

    try {
        reviewed = fs.readFileSync(markerPath(), 'utf8').trim();
    } catch {
        // No review recorded yet.
    }

    const reasons = [];
    if (errors.length) reasons.push(`check-texts found ${errors.length} error(s):\n${errors.map(format).join('\n')}`);
    if (reviewed !== stagedTree())
        reasons.push(
            'The staged change touches texts this package ships. Run the `release-texts` skill on it; the skill ends with `node scripts/check-texts.mjs --reviewed`, which records the review of exactly this staged state.',
        );
    if (!reasons.length) process.exit(0);
    process.stdout.write(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                permissionDecision: 'deny',
                permissionDecisionReason: reasons.join('\n\n'),
            },
        }),
    );
    process.exit(0);
}

runChecks();
printReport(errors.length ? process.stderr : process.stdout);

if (errors.length) {
    process.stderr.write('Fix the errors above, or commit with --no-verify if a rule is wrong for this change.\n');
    process.exit(1);
}

if (mode === 'reviewed') {
    fs.writeFileSync(markerPath(), `${stagedTree()}\n`);
    console.log('check-texts: review recorded for the staged change.');
}
