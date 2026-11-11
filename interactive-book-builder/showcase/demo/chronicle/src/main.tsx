import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BOOK } from './book.config';
import { KEYS } from './services/store';
import { Snd } from './engine/sound.js';
import './styles/themes.css';
import './styles/book.css';
import './engine/engine.css';

// 主题：book.config.ts 决定；地址栏 ?cover=midnight&paper=letter 可临时预览其它组合
const q = new URLSearchParams(location.search);
document.documentElement.dataset.cover = q.get('cover') || BOOK.cover;
document.documentElement.dataset.paper = q.get('paper') || BOOK.paper;
Snd.init(KEYS.sound);

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
