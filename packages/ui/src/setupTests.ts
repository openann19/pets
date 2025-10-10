import '@testing-library/jest-dom';
import './types/jest-dom';

// Mock react-aria components for testing
jest.mock('@react-aria/button', () => ({
  useButton: () => ({
    buttonProps: {},
    isPressed: false
  })
}));

jest.mock('@react-aria/focus', () => ({
  useFocusRing: () => ({
    focusProps: {},
    isFocused: false
  })
}));

jest.mock('@react-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

jest.mock('@react-aria/utils', () => ({
  mergeProps: (...props: Record<string, unknown>[]) => Object.assign({}, ...props)
}));

jest.mock('@react-aria/textfield', () => ({
  useTextField: () => ({
    inputProps: {},
    labelProps: {},
    descriptionProps: {},
    errorMessageProps: {}
  })
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
