# @ringpublishing/mui-components

Package includes Ring Publishing MUI Components library based on MUI Components intended for internal and Ring Publishing customers use in Ring Publishing projects.
Ring Publishing MUI Components are not intended to function as a general-purpose UI toolkit — they are only useful in the context of integrating with the Ring Publishing system.

## Installation

```shell
npm install @ringpublishing/mui-components @mui/material
```

To use MUI-X Components you also need to install MUI-X packages:
```shell
npm install @mui/x-license @mui/x-data-grid @mui/x-data-grid-pro @mui/x-date-pickers @mui/x-date-pickers-pro @mui/x-tree-view
```

Install only the packages required by the components you use:

| Component | Required MUI-X package(s) |
|---|---|
| `DataGrid` | `@mui/x-data-grid` `@mui/x-data-grid-pro` `@mui/x-license` |
| `MultimediaGrid` | `@mui/x-data-grid` `@mui/x-data-grid-pro` `@mui/x-license` |
| `DatePicker` | `@mui/x-date-pickers` `@mui/x-date-pickers-pro` `@mui/x-license` |
| `DateTimePicker` | `@mui/x-date-pickers` `@mui/x-date-pickers-pro` `@mui/x-license` |
| `TimePicker` | `@mui/x-date-pickers` `@mui/x-date-pickers-pro` `@mui/x-license` |
| `TreeView` | `@mui/x-tree-view` `@mui/x-license` |

### Set up Ring theme

You can set up theme in your app by adding following code to your App.jsx file

```javascript
import { ThemeConfig } from '@ringpublishing/mui-components';

<ThemeConfig mode={'dark'}>
    <App />
</ThemeConfig>
```

### Use component in your app

```javascript
import { Typography } from '@ringpublishing/mui-components';
<Typography variant="body1">Text</Typography>
```

## License

Ring UI Components is built on top of [MUI-X](https://mui.com/x/), which requires a commercial license for Pro/Premium features. Components such as
`DataGrid`, `MultimediaGrid`, `DatePicker`, `DateTimePicker`, `TimePicker` and `TreeView` will not work without a valid license key.

### Using your own MUI-X license

If you use this library outside Ring Publishing, you need to obtain a license directly from MUI and register it in your app before rendering any MUI-X
component:

```javascript
import { LicenseInfo } from '@mui/x-license';

LicenseInfo.setLicenseKey('YOUR_LICENSE_KEY');
```

### Ring Publishing internal users

If your application runs inside the Ring Publishing ecosystem, the license key is provided by the platform via RingSDK:

```javascript
RingSDK.api.config.getComponentsLicenseKey();
```

For questions specific to Ring Publishing integration, contact
the Components Team: [ringcomponentsteam@groups.ringieraxelspringer.pl](mailto:ringcomponentsteam@groups.ringieraxelspringer.pl).

## Documentation

See our [Storybook](https://design.ringpublishing.com/).
