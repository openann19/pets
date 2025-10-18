"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFocusTrap = useFocusTrap;
const react_1 = require("react");
function useFocusTrap() {
    const containerRef = (0, react_1.useRef)(null);
    const firstFocusableElement = (0, react_1.useRef)(null);
    const lastFocusableElement = (0, react_1.useRef)(null);
    const handleTabKey = (0, react_1.useCallback)((e) => {
        if (!containerRef.current)
            return;
        const focusableElements = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0)
            return;
        firstFocusableElement.current = focusableElements[0];
        lastFocusableElement.current = focusableElements[focusableElements.length - 1];
        if (e.key === 'Tab' && !e.shiftKey && document.activeElement === lastFocusableElement.current) {
            e.preventDefault();
            firstFocusableElement.current?.focus();
        }
        if (e.key === 'Tab' && e.shiftKey && document.activeElement === firstFocusableElement.current) {
            e.preventDefault();
            lastFocusableElement.current?.focus();
        }
    }, []);
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        if (event.key === 'Tab') {
            handleTabKey(event);
        }
    }, [handleTabKey]);
    (0, react_1.useEffect)(() => {
        const container = containerRef.current;
        if (!container)
            return;
        container.addEventListener('keydown', handleKeyDown);
        // Focus first element when trap is activated
        const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    return containerRef;
}
