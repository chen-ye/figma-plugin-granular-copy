import React from 'react';
import { createRoot } from 'react-dom/client';

export const App = () => {
  return (
    <div>
      <h1>Granular Copy UI</h1>
    </div>
  );
};


const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
