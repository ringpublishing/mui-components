// Local mirror of Ring's per-component sub-module augmentations
// (Typography label/headline1-3, Paper borderless, Button/IconButton contrast).
//
// Required because TS does not propagate `declare module` augmentations
// across package boundaries under `moduleResolution: "node16"`.
//
// Canonical declarations live in `@ringpublishing/mui-theme`; see
// `docs/cross-package-augmentation.md` in that package for rationale.
// Mirror must stay in sync — see CONTRIBUTING.

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
    }
}

declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        contrast: true;
    }
}
