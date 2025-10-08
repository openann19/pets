'use client';

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4
        bg-primary-600 text-white
        px-4 py-2 rounded-lg
        focus:z-50 focus:outline-none
        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-all
      "
    >
      Skip to main content
    </a>
  );
}