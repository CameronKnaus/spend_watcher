import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div style={{ padding: 24, fontFamily: 'system-ui' }}>
            <h1>Spend Watcher UI</h1>
        </div>
    </StrictMode>,
);
