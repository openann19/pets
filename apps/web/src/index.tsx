import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app';

// Simple entry point that renders the App
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
