/**
 * Premium Typography System for PawfectMatch
 * Responsive, accessible, and beautifully crafted text styles
 */
export declare const typography: {
    fonts: {
        primary: string;
        secondary: string;
        mono: string;
    };
    weights: {
        light: string;
        regular: string;
        medium: string;
        semibold: string;
        bold: string;
        extrabold: string;
    };
    sizes: {
        xs: number;
        sm: number;
        base: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
        '5xl': number;
        '6xl': number;
    };
    lineHeights: {
        tight: number;
        snug: number;
        normal: number;
        relaxed: number;
        loose: number;
    };
    letterSpacing: {
        tighter: string;
        tight: string;
        normal: string;
        wide: string;
        wider: string;
        widest: string;
    };
    styles: {
        h1: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
            letterSpacing: string;
        };
        h2: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
            letterSpacing: string;
        };
        h3: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        h4: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        h5: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        h6: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        body: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        bodyLarge: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        bodySmall: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        button: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
            letterSpacing: string;
        };
        buttonSmall: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
            letterSpacing: string;
        };
        caption: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
            letterSpacing: string;
        };
        overline: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
            letterSpacing: string;
            textTransform: "uppercase";
        };
        chatMessage: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        chatTime: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        chatName: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        cardTitle: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        cardSubtitle: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
        cardBody: {
            fontSize: number;
            fontWeight: string;
            lineHeight: number;
        };
    };
    breakpoints: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        '2xl': number;
    };
};
export declare const getResponsiveFontSize: (baseSize: number, scale?: number) => {
    fontSize: number;
    '@media (min-width: 768px)': {
        fontSize: number;
    };
};
export declare const truncateText: (lines?: number) => {
    overflow: string;
    textOverflow: string;
    display: string;
    WebkitLineClamp: number;
    WebkitBoxOrient: "vertical";
};
export default typography;
//# sourceMappingURL=typography.d.ts.map