import { Box, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography, type Theme } from '@mui/material';

// The "(AI)" marker sits inside another element's text, so it is a span with
// the gradient fill — not a Chip. Typography stays the host element's.
function AiMark(): React.JSX.Element {
    return (
        <Box component="span" sx={(theme: Theme): ReturnType<Theme['gradientText']> => theme.gradientText('ai')}>
            (AI)
        </Box>
    );
}

export default function InlineAiMarkerExample(): React.JSX.Element {
    return (
        <Stack spacing={4} alignItems="flex-start">
            {/* Section heading with an AI marker — as in the tag-suggestions panel of the editor. */}
            <Stack spacing={1} alignItems="flex-start">
                <Typography variant="overline">
                    Suggested tags <AiMark />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No tags matching the text have been found yet.
                </Typography>
                <Button variant="outlined" size="small">
                    Generate tags
                </Button>
            </Stack>

            {/* Radio option flagged as AI-powered — as in the Audio panel. */}
            <RadioGroup defaultValue="none" aria-label="Audio">
                <FormControlLabel value="none" control={<Radio />} label="No audio" />
                <FormControlLabel
                    value="tts"
                    control={<Radio />}
                    label={
                        <span>
                            Automatic – TTS <AiMark />
                        </span>
                    }
                />
                <FormControlLabel value="manual" control={<Radio />} label="Manual – upload audio file" />
            </RadioGroup>
        </Stack>
    );
}
