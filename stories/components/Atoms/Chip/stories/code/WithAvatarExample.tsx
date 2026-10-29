import { Avatar, Chip, Stack } from '@mui/material';
import { getImagePath, ImageSize, TestImage } from 'RingDemoImages';

export default function WithAvatarExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Chip label="Avatar" variant="outlined" size="medium" avatar={<Avatar>OP</Avatar>} />
            <Chip label="Avatar" variant="outlined" avatar={<Avatar>OP</Avatar>} />
            <Chip
                label="Avatar"
                variant="outlined"
                size="medium"
                avatar={<Avatar src={getImagePath(TestImage.NEONS, ImageSize.SMALL)} alt="" />}
            />
            <Chip
                label="Avatar"
                variant="outlined"
                avatar={<Avatar>OP</Avatar>}
                className="Mui-selected"
                aria-pressed={true}
            />
        </Stack>
    );
}
