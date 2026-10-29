import React, { useState } from 'react';
import { InputAdornment, Stack } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { CopyIconButton, RingLucideIcon, TextField } from '@ringpublishing/mui-components';

const URL_VALUE = 'https://www.example.com/news/world/2026/10/14/an-article-slug-that-is-longer-than-the-field';
const LEAD_VALUE =
    'A lead paragraph long enough to wrap onto several lines of the field, written to show how a multiline value ' +
    'runs next to the action button.';
const NOTE_VALUE = 'A note for the desk that wraps onto a second line and grows the field as you type more of it.';

export default function LongValueExample(): React.JSX.Element {
    const [url, setUrl] = useState(URL_VALUE);
    const [lead, setLead] = useState(LEAD_VALUE);
    const [note, setNote] = useState(NOTE_VALUE);

    return (
        <Stack spacing={3} sx={{ width: 320 }}>
            <TextField
                label="Canonical URL"
                value={url}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setUrl(event.target.value)}
                fullWidth={true}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <CopyIconButton value={url} labels={{ copy: 'Copy URL', copied: 'Copied' }} />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <TextField
                label="Lead"
                multiline={true}
                minRows={2}
                maxRows={6}
                value={lead}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setLead(event.target.value)}
                fullWidth={true}
                actions={[
                    {
                        icon: <RingLucideIcon icon={Sparkles} color="ai" />,
                        label: 'Generate with AI',
                        onClick: (): void => console.info('Generate with AI clicked'),
                    },
                ]}
            />
            <TextField
                label="Note"
                multiline={true}
                minRows={2}
                maxRows={6}
                value={note}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setNote(event.target.value)}
                fullWidth={true}
            />
        </Stack>
    );
}
