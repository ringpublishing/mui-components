import React from 'react';
import { NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Image } from '@tiptap/extension-image';
import { Media } from '../../Molecules/Media/Media.js';

const customImage = Image.extend({
    addNodeView() {
        function Image(props: NodeViewProps): React.JSX.Element {
            return (
                <NodeViewWrapper data-testid="ring-image-node">
                    <Media image={props.node.attrs.src} title={props.node.attrs.title} />
                </NodeViewWrapper>
            );
        }

        return ReactNodeViewRenderer(Image);
    },
});

export default customImage;
