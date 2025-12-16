:root {
    --bg-color: #050505;
    --sidebar-bg: #0a0a0a;
    --card-bg: #0f0f13;
    --primary: #00ff41;
    --secondary: #008f11;
    --text-main: #e0e0e0;
    --text-dim: #666;
    --border: #1a1a1a;
    --font-stack: 'JetBrains Mono', monospace;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: var(--font-stack);
}

body {
    background-color: var(--bg-color);
    color: var(--text-main);
    height: 100vh;
    overflow: hidden;
}

#matrix-bg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0.15;
}

.app-container {
    display: flex;
    height: 100vh;
    width: 100%;
}

.sidebar {
    width: 280px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 2rem;
}

.logo-area {
    margin-bottom: 3rem;
}

h1.glitch {
    font-size: 2rem;
    color: var(--primary);
    font-weight: 800;
    letter-spacing: -1px;
    text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.status-indicator {
    font-size: 0.75rem;
    color: var(--secondary);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.dot {
    width: 8px;
    height: 8px;
    background: var(--primary);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--primary);
}

.nav-menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.nav-btn {
    background: transparent;
    border: none;
    color: var(--text-dim);
    text-align: left;
    font-size: 0.9rem;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-btn:hover, .nav-btn.active {
    color: var(--primary);
    background: rgba(0, 255, 65, 0.05);
    border-left: 2px solid var(--primary);
    padding-left: 15px;
}

.session-stats {
    background: #000;
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 4px;
    margin-bottom: 20px;
}

.session-stats h3 {
    font-size: 0.7rem;
    color: #444;
    margin-bottom: 10px;
    text-transform: uppercase;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 5px;
    color: #888;
}

.stat-row .val {
    color: var(--text-main);
    font-weight: bold;
}

.hint-box {
    font-size: 0.7rem;
    color: #333;
    margin-top: auto;
}

.main-content {
    flex: 1;
    padding: 3rem;
    overflow-y: auto;
    position: relative;
}

.panel {
    display: none;
    animation: fadeIn 0.4s ease;
}

.panel.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.welcome-header {
    margin-bottom: 3rem;
}

.welcome-header h2 {
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 2px;
}

.sub-text {
    color: var(--primary);
    font-size: 0.9rem;
    margin-top: 10px;
}

.grid-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    padding: 2rem;
    cursor: pointer;
    transition: 0.3s;
    position: relative;
    overflow: hidden;
}

.card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.card h3 {
    margin: 15px 0 5px;
    color: var(--text-main);
}

.card p {
    font-size: 0.85rem;
    color: var(--text-dim);
}

.card-icon {
    font-size: 2rem;
    color: var(--primary);
}

.panel-header {
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 10px;
}

.tracker-input-area {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

#task-input {
    flex: 1;
    background: transparent;
    border: 1px solid var(--border);
    padding: 12px;
    color: var(--primary);
    outline: none;
}

#btn-add-task, #btn-check-sudoku, #btn-spin, #btn-new-game, .diff-btn, #btn-start-focus, #btn-reset-focus, #btn-pause-focus {
    background: var(--border);
    color: var(--text-main);
    border: none;
    padding: 0 20px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.2s;
}

#btn-add-task:hover, #btn-check-sudoku:hover, #btn-spin:hover, #btn-new-game:hover, .diff-btn:hover, #btn-start-focus:hover {
    background: var(--primary);
    color: #000;
}

#task-list {
    list-style: none;
}

#task-list li {
    background: rgba(255,255,255,0.03);
    padding: 12px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 2px solid transparent;
}

#task-list li.done {
    border-left-color: var(--primary);
    opacity: 0.5;
    text-decoration: line-through;
}

.focus-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-top: 2rem;
}

.timer-circle-box {
    position: relative;
    width: 300px;
    height: 300px;
}

.timer-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.circle-bg {
    fill: none;
    stroke: #111;
    stroke-width: 3;
}

.circle-progress {
    fill: none;
    stroke: var(--primary);
    stroke-width: 3;
    stroke-dasharray: 283;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
}

.timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3.5rem;
    font-weight: bold;
    color: var(--text-main);
}

.focus-controls {
    margin-top: 30px;
    display: flex;
    gap: 15px;
}

.focus-controls button {
    padding: 12px 30px;
}

.game-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

#sudoku-board {
    display: grid;
    grid-template-columns: repeat(9, 45px);
    grid-template-rows: repeat(9, 45px);
    gap: 0;
    border: 2px solid var(--primary);
}

.cell {
    width: 45px;
    height: 45px;
    background: transparent;
    border: 1px solid #222;
    color: var(--text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    position: relative;
}

.cell input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    text-align: center;
    color: var(--primary);
    font-size: 1.2rem;
    outline: none;
}

.cell:nth-child(3n) {
    border-right: 1px solid var(--primary);
}

.cell:nth-child(9n) {
    border-right: 1px solid #222; 
}

.cell-row-3, .cell-row-6 {
    border-bottom: 1px solid var(--primary);
}

.sudoku-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.difficulty-tabs .diff-btn.active {
    background: var(--primary);
    color: #000;
}

#decide-input {
    width: 100%;
    height: 150px;
    background: #000;
    border: 1px solid var(--border);
    color: var(--text-main);
    padding: 15px;
    margin-bottom: 20px;
    resize: none;
    outline: none;
}

.result-box {
    margin-top: 20px;
    padding: 30px;
    background: rgba(0,255,65,0.05);
    border: 1px dashed var(--primary);
    text-align: center;
}

#decide-result {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}
