/**
 * Polyfills for Next.js 15.5.4 compatibility
 * Fixes "exports is not defined" error
 */

// Ensure globalThis is available
if (typeof globalThis === 'undefined') {
  (function() {
    if (typeof global !== 'undefined') {
      global.globalThis = global;
    } else if (typeof window !== 'undefined') {
      window.globalThis = window;
    } else if (typeof self !== 'undefined') {
      self.globalThis = self;
    } else {
      throw new Error('Unable to locate global object');
    }
  })();
}

// Polyfill for exports global
if (typeof globalThis.exports === 'undefined') {
  globalThis.exports = {};
}

// Polyfill for module global
if (typeof globalThis.module === 'undefined') {
  globalThis.module = { exports: {} };
}

// Polyfill for require global (for compatibility)
if (typeof globalThis.require === 'undefined') {
  globalThis.require = function(id) {
    console.warn(`require is not available in browser environment: ${id}`);
    return {};
  };
}

// Ensure global is available
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

// Ensure process is available
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'development'
    },
    nextTick(callback) {
      setTimeout(callback, 0);
    }
  };
}

// Handle CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  // Use Object.defineProperty to avoid reassignment
  Object.defineProperty(module, 'exports', {
    value: globalThis.module.exports,
    writable: true,
    configurable: true
  });
}

// Handle AMD exports
if (typeof define === 'function' && define.amd) {
  define(() => {
    return {};
  });
}

// Handle UMD exports
if (typeof exports !== 'undefined') {
  // Already handled by globalThis.exports
}

console.log('Polyfills loaded successfully');
