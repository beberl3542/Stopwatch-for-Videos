import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWAとして機能させるためにサービスワーカーを登録
serviceWorkerRegistration.register();

// アプリのパフォーマンスを測定する場合、結果をログに記録
reportWebVitals();

