import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import { TextEditor } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

const sampleText1 = `
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

const sampleText2 = `
    <p>Text 2</p>
    <p>Lorem ipsum <i>dolor sit</i> <b>amet</b>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea</p>
    <ul>
        <li>First item</li>
        <li>Second item</li>
    </ul>
`;

export default function WithTwoTextsExample(): React.JSX.Element {
    const [text1, setText1] = useState(sampleText1);
    const [text2, setText2] = useState(sampleText2);
    const [currentText, setCurrentText] = useState<'1' | '2'>('1');

    return (
        <Stack spacing={2} sx={{ width: '600px' }}>
            <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={(): void => setCurrentText('1')}>
                    Edit Text #1
                </Button>
                <Button variant="outlined" onClick={(): void => setCurrentText('2')}>
                    Edit Text #2
                </Button>
            </Stack>
            {/* `key` remounts the editor, so switching texts replaces the document instead of editing the previous one */}
            <TextEditor
                key={currentText}
                content={currentText === '1' ? text1 : text2}
                onUpdate={(editor): void => {
                    if (currentText === '1') {
                        setText1(editor.getHTML());
                    } else {
                        setText2(editor.getHTML());
                    }
                }}
                limit={1000}
            />
        </Stack>
    );
}
