import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import 'dayjs/locale/en';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { RenderOptions, render } from '@testing-library/react';
import { ThemeConfig } from '../../src/index.js';

const Providers: FunctionComponent<PropsWithChildren<unknown>> = ({ children }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en'}>
            <ThemeConfig mode={'light'}>{children}</ThemeConfig>
        </LocalizationProvider>
    );
};

const customRender = (
    ui: React.JSX.Element,
    options: RenderOptions<typeof import('@testing-library/dom/types/queries.js'), HTMLElement, HTMLElement> = {},
): ReturnType<typeof render> => render(ui, { wrapper: Providers, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
