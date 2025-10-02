import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'

console.log('🎬 main.tsx carregado');

const rootElement = document.getElementById("root");
console.log('📦 Root element:', rootElement ? 'ENCONTRADO' : 'NÃO ENCONTRADO');

if (!rootElement) {
  console.error('❌ ERRO: Elemento root não encontrado!');
} else {
  console.log('✅ Criando root React...');
  createRoot(rootElement).render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <App />
    </ThemeProvider>
  );
  console.log('✅ App renderizado!');
}
