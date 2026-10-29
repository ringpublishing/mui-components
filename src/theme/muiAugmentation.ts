// Local mirror of the `declare module` augmentations of `@ringpublishing/mui-theme`, which TS does
// not propagate across package boundaries under `moduleResolution: "node16"`. It must stay in sync
// with the canonical declarations in that package.

export {};

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
        headline2: true;
        headline3: true;
    }
}

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        borderless: true;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
        ai: true;
    }
}

declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        contrast: true;
        overlay: true;
        ai: true;
    }
}

declare module '@mui/material/Checkbox' {
    interface CheckboxPropsColorOverrides {
        overlay: true;
        ai: true;
    }
}

declare module '@mui/material/Chip' {
    interface ChipPropsColorOverrides {
        ai: true;
    }
}
