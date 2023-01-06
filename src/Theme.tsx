import { lightBlue } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const PRIMARY_MAIN = lightBlue[700];
const PRIMARY_LIGHTER = lightBlue[300];
const PRIMARY_LIGHTEST = lightBlue[100];

const COMPLEMENTARY = "#d14a02";
const TRIADIC = "#d10289";
const NEUTRAL = "#DDDDDD";

const Theme = createTheme({
    spacing: 8,
    palette: {
        primary: {
            main: PRIMARY_MAIN,
            lighter: PRIMARY_LIGHTER,
            lightest: PRIMARY_LIGHTEST,
        },
        secondary: {
            main: COMPLEMENTARY,
        },
        triadic: {
            main: TRIADIC,
        },
        neutral: {
            main: NEUTRAL,
        },
    },
});

Theme.palette.triadic = Theme.palette.augmentColor({
    color: Theme.palette.triadic,
});
Theme.palette.neutral = Theme.palette.augmentColor({
    color: Theme.palette.neutral,
});

declare module "@mui/material/styles" {
    interface Palette {
        triadic: Palette["primary"];
        neutral: Palette["primary"];
    }
    interface PaletteOptions {
        triadic: PaletteOptions["primary"];
        neutral: PaletteOptions["primary"];
    }
    interface PaletteColor {
        lighter?: string;
        lightest?: string;
    }
    interface SimplePaletteColorOptions {
        lighter?: string;
        lightest?: string;
    }
}

export default Theme;
