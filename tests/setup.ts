import { expect } from 'vitest';
import { cloneWithoutClassHashes } from './test-utils/emotionClassNames.js';

// The hash in an Emotion class is derived from the whole serialized style, and the one in the Data Grid
// variables class from the whole theme. Neither says what changed, so snapshots keep the structure and the labels.
const printedCopies = new WeakSet<Node>();

const isDomTree = (value: unknown): value is Element | DocumentFragment =>
    typeof Element !== 'undefined' && (value instanceof Element || value instanceof DocumentFragment);

expect.addSnapshotSerializer({
    // The copy is printed by the built-in DOM serializer, which hands every child back to the serializers.
    // A node whose root is a copy made here is skipped, so each tree is copied once.
    test: (value: unknown): boolean => isDomTree(value) && !printedCopies.has(value.getRootNode()),
    serialize: (value: Element | DocumentFragment, config, indentation, depth, refs, printer): string => {
        const copy = cloneWithoutClassHashes(value);

        printedCopies.add(copy);

        return printer(copy, config, indentation, depth, refs);
    },
});
