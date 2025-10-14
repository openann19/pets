/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
    interface Matchers<R> {
        toBeInTheDocument(): R;
        toHaveAttribute(attr: string, value?: string): R;
        toHaveClass(...classNames: string[]): R;
        toHaveTextContent(text: string | RegExp): R;
        toBe(expected: any): R;
        toContain(expected: any): R;
        toHaveBeenCalledWith(...args: any[]): R;
    }
}

declare namespace jest {
    interface Expect {
        stringContaining(str: string): any;
        objectContaining(obj: any): any;
    }
}
