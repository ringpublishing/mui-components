import { Autocomplete } from '@ringpublishing/mui-components';
import { InfoOutlined, ManageSearch } from '@mui/icons-material';

export default () => {
    const options = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    const actions = [
        {
            icon: <ManageSearch />,
            onClick: () => null,
            label: 'Settings',
        },
        {
            icon: <InfoOutlined />,
            onClick: () => null,
            label: 'Info',
        },
    ];

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Autocomplete
                actions={actions}
                options={options}
                multiple={true}
                defaultValue={options.slice(0, 5)}
                labels={{ title: 'search by' }}
                sx={{ width: 300 }}
                slotProps={{
                    textField: {
                        variant: 'outlined',
                    },
                }}
            />
        </div>
    );
};
