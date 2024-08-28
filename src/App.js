import React from 'react';
import MemoryGame from './components/MemoryGame.jsx'; // 引入 MemoryGame 組件
import './App.css';

const App = () => {
    return (
        <div className="App">
            <h1>翻牌小遊戲</h1>
            <MemoryGame /> {/* 渲染 MemoryGame 組件 */}
        </div>
    );
};

export default App;