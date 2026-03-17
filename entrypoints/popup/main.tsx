import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import './style.css';

function initTheme() {
  const saved = localStorage.getItem('theme');
  
  if (saved === 'light') {
    document.documentElement.classList.add('light-theme');
  } else if (saved === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    // 默认跟随系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!prefersDark) {
      document.documentElement.classList.add('light-theme');
    }
  }
}

initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
