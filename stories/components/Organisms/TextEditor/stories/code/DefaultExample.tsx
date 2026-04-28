import React from 'react';
import { TextEditor } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

const sampleText = `
    <p>Lorem ipsum <i>dolor sit</i> <b>amet</b>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea</p>
    <p>Link: <a href="https://en.wikipedia.org/wiki/Lorem_ipsum" rel="noopener noreferrer" title="Lorem ipsum">Lorem ipsum </a></p>
    <img src='${getImagePath(TestImage.DESERT, ImageSize.LARGE)}' alt="Lorem ipsum" title="Image title" />
    <ol>
        <li>First item</li>
        <li>Second item</li>
    </ol>
    <ul>
        <li>First item</li>
        <li>Second item</li>
    </ul>
`;

export default function DefaultExample(): React.JSX.Element {
    return (
        <div style={{ width: '600px' }}>
            <TextEditor
                content={sampleText}
                onUpdate={(editor): void => {
                    console.log('Content updated:', JSON.stringify(editor.storage.characterCount?.characters()));
                }}
                limit={1000}
            />
        </div>
    );
}
