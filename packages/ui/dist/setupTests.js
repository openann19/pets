/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing */
import '@testing-library/jest-dom';
import React from 'react';
// Mock react-aria components for testing
jest.mock('@react-aria/button', () => ({
    useButton: (props) => ({
        buttonProps: {
            onClick: props.onPress,
            ...props
        },
        isPressed: false
    })
}));
jest.mock('@react-aria/focus', () => ({
    useFocusRing: () => ({
        focusProps: {},
        isFocused: false
    }),
    FocusScope: ({ children }) => React.createElement('div', {}, children)
}));
jest.mock('@react-aria/interactions', () => ({
    useHover: () => ({
        hoverProps: {},
        isHovered: false
    })
}));
jest.mock('@react-aria/utils', () => ({
    mergeProps: (...props) => Object.assign({}, ...props)
}));
jest.mock('@react-aria/textfield', () => ({
    useTextField: (props) => {
        let currentValue = props.value || '';
        return {
            inputProps: {
                id: props.id || 'input-id',
                value: currentValue,
                onChange: (e) => {
                    if (props.onChange) {
                        // For testing, we'll call onChange with the final value
                        // This matches the test expectation
                        const newValue = e.target?.value || '';
                        currentValue = newValue;
                        props.onChange(newValue);
                    }
                },
                ...props
            },
            labelProps: {
                htmlFor: props.id || 'input-id'
            },
            descriptionProps: {},
            errorMessageProps: {}
        };
    }
}));
jest.mock('@react-aria/overlays', () => ({
    useOverlay: () => ({
        overlayProps: {}
    }),
    usePreventScroll: () => ({}),
    useModal: () => ({})
}));
jest.mock('@react-aria/dialog', () => ({
    useDialog: () => ({
        dialogProps: {},
        titleProps: {}
    })
}));
//# sourceMappingURL=setupTests.js.map