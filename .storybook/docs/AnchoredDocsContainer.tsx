import React, { useEffect, type PropsWithChildren } from 'react';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { keepAnchorInView, readAnchor } from './keepAnchorInView.js';

/**
 * Storybook's docs container, plus a link to a heading (`#…`) that still lands on that heading.
 *
 * The stock container scrolls once, 200 ms after mount, and code blocks rendered afterwards push the
 * heading down by up to a few thousand pixels. This one keeps the heading in view until the layout settles.
 */
export function AnchoredDocsContainer(props: PropsWithChildren<DocsContainerProps>): React.JSX.Element {
    // The preview iframe URL names the docs entry; a new entry or a new anchor is a new navigation.
    const entryId = new URLSearchParams(window.location.search).get('id');
    const anchor = readAnchor(window);

    useEffect((): (() => void) => keepAnchorInView(document, anchor), [entryId, anchor]);

    return <DocsContainer {...props} />;
}
