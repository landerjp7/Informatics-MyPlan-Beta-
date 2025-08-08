import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 main.tsx: React app starting...');

try {
  const rootElement = document.getElementById('root');
  console.log('🎯 main.tsx: Found root element:', rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    console.log('🌳 main.tsx: Created React root');
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('✅ main.tsx: App rendered successfully');
  } else {
    console.error('❌ main.tsx: Could not find root element');
  }
} catch (error) {
  console.error('💥 main.tsx: Error starting React app:', error);
}
