const colors = {
    yellow500: "E1A717",
    yellow600: "C59214",
    yellow800: "8D6B0E",
    red500: "E22100",
    red600: "801300",
    blue500: "77A9C3",
    blue600: "4F6A93",
    white500: "F5F3EF",
    white600: "C6B5A1",
    black500: "1B1819",
    black600: "0A0708",
    cream200: "EDE9E0",
    cream400: "D9D0BD",
    cream600: "B5AB96",
};

const wordWrap = {
    sm: { width: 450 },
    md: { width: 900 },
    lg: { width: 1200 },
};

const hexString = (color) => "#" + color;
const hexNum = (color) => parseInt(color, 16);

export default {
    centerX: 0,
    centerY: 0,

    hexString,
    hexNum,
    colors,
    wordWrap,

    bodyTextStyle: {
        fontFamily: "Raleway",
        fontStyle: "900",
        fontSize: "64px",
        fill: hexString(colors.white500),
        wordWrap: wordWrap.md,
    },
};
