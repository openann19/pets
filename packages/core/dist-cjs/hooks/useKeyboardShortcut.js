"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardShortcut = useKeyboardShortcut;
const react_1 = require("react");
function useKeyboardShortcut(keyCombo, handler) {
    const formattedCombo = (0, react_1.useRef)(formatKeyCombo(keyCombo));
    const handlerRef = (0, react_1.useRef)(handler);
    (0, react_1.useEffect)(() => {
        handlerRef.current = handler;
    }, [handler]);
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (0, react_1.useCallback)((event) => {
            const pressedCombo = formatPressedKeys(event);
            if (pressedCombo === formattedCombo.current) {
                event.preventDefault();
                handlerRef.current();
            }
        }, []);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [keyCombo]);
    return formattedCombo.current;
}
function formatKeyCombo(combo) {
    const modifiers = [];
    if (combo.ctrl)
        modifiers.push('Ctrl');
    if (combo.shift)
        modifiers.push('Shift');
    if (combo.alt)
        modifiers.push('Alt');
    if (combo.meta)
        modifiers.push('Meta');
    return [...modifiers, combo.key].join('+');
}
function formatPressedKeys(event) {
    const modifiers = [];
    if (event.ctrlKey)
        modifiers.push('Ctrl');
    if (event.shiftKey)
        modifiers.push('Shift');
    if (event.altKey)
        modifiers.push('Alt');
    if (event.metaKey)
        modifiers.push('Meta');
    return [...modifiers, event.key].join('+');
}
