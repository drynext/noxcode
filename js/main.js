/* ======================================================================
   NOXCODE SYSTEM CORE v2.0
   OPERATOR: DAI_DANG_CS
   STATUS: CLASSIFIED // LEVEL 5 CLEARANCE
   DESCRIPTION: Advanced operations dashboard and neural interface.
======================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    NOXSYSTEM.init();
});

// ==================================================================
// CORE SYSTEM MODULE (Navigation, UI, Utils)
// ==================================================================
const NOXSYSTEM = {
    state: {
        current View: 'dashboard-view',
        user: 'DAI_DANG_CS'
    },

    init() {
        console.log("%c [SYSTEM] Initializing NOXCODE CORE v2.0...", "color:#00ff41; font-weight:bold;");
        this.setupMatrixRain();
        this.setupSystemClock();
        this.setupNavigation();
        this.setupTypewriter();
        
        // Initialize Sub-modules
        NOX_TRACKER.init();
        NOX_FOCUS.init();
        NOX_SUDOKU.init();
        NOX_SNAKE.init();
        NOX_BLOG.init();
        NOX_DECIDER.init();

        this.showToast('SYSTEM V2.0 ONLINE. Welcome back, Operator.', 'success');
    },

    // --- UI & EFFECTS ---
    setupMatrixRain() {
        const canvas = document.getElementById('matrix-rain');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        // Using katakana and numbers for more "hacker" feel
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン1234567890XYZ'.split('');
        const fontSize = 12;
        const columns = width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function draw() {
            ctx.fillStyle = 'rgba(9, 12, 16, 0.08)'; // Lower opacity for better trail
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                // Randomly makes some characters brighter
                ctx.fillStyle = Math.random() > 0.95 ? '#FFF' : '#00ff41';
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.985) drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(draw, 40);
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    },

    setupSystemClock() {
        const clockEl = document.getElementById('system-clock');
        const update = () => {
            const now = new Date();
            // Format specifically as HH:MM:SS UTC for dev feel
            clockEl.innerText = now.toISOString().substr(11, 8) + ' UTC';
        }
        setInterval(update, 1000);
        update();
    },

    setupTypewriter() {
        const text = "Initializing core environment v2.0... Connecting to neural net... All systems nominal. Awaiting input.";
        const typeEl = document.getElementById('typing-effect');
        if(!typeEl) return;
        let i = 0;
        typeEl.innerHTML = '';
        function type() {
            if (i < text.length) {
                typeEl.innerHTML += text.charAt(i);
                i++;
                // Random typing speed
                setTimeout(type, Math.random() * 50 + 20);
            }
        }
        setTimeout(type, 1500);
    },

    // --- NAVIGATION & VIEW HANDLING ---
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.navigate(item.dataset.target));
        });
    },

    navigate(targetId) {
        if(targetId === this.state.currentView) return;

        // Handle specific view onLeave actions
        if(this.state.currentView === 'snake-view') NOX_SNAKE.stop();

        // UI Updates
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));

        const targetView = document.getElementById(targetId);
        if(targetView) {
            targetView.classList.add('active');
            this.state.currentView = targetId;

            // Update Breadcrumbs
            let breadcrumbText = targetId.replace('-view', '').replace('-', ' ').toUpperCase();
            if(targetView.classList.contains('sub-view')) {
                breadcrumbText = `MINI-GAMES / ${breadcrumbText}`;
            }
            document.getElementById('current-module').innerText = breadcrumbText;
            
            // Set active nav item (if it exists in sidebar)
            const mainNavTarget = targetView.classList.contains('sub-view') ? 'minigames-view' : targetId;
            const activeNav = document.querySelector(`.nav-item[data-target="${mainNavTarget}"]`);
            if(activeNav) activeNav.classList.add('active');
            
            // Handle specific view onEnter actions
            if(targetId === 'blog-view') NOX_BLOG.renderPosts();
        }
    },

    // --- UTILITIES ---
    // New Feature: Toast Notification System
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if(type === 'success') icon = '✅';
        if(type === 'error') icon = '⚠️';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-msg">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Sound effect (subtle beep)
        this.playSound('beep');

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => container.removeChild(toast), 300);
        }, 3500);
    },

    // Simple Audio Synthesis for effects (No external files needed)
    playSound(type) {
        // Basic implementation - can be expanded
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if(type === 'beep') {
                osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                osc.start(); osc.stop(ctx.currentTime + 0.05);
            } else if (type === 'error') {
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                osc.start(); osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'click') {
                 osc.type = 'square'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
                 gain.gain.setValueAtTime(0.02, ctx.currentTime);
                 osc.start(); osc.stop(ctx.currentTime + 0.01);
            }
        } catch(e) { /* Ignore if audio not supported */ }
    }
};


// ==================================================================
// MODULE: TRACKER (Task Management)
// ==================================================================
const NOX_TRACKER = {
    tasks: [],
    init() {
        this.tasks = JSON.parse(localStorage.getItem('nox_tasks_v2')) || [];
        this.cacheDOM();
        this.bindEvents();
        this.render();
    },
    cacheDOM() {
        this.input = document.getElementById('new-task-input');
        this.addBtn = document.getElementById('add-task-btn');
        this.todoList = document.getElementById('todo-list');
        this.doneList = document.getElementById('done-list');
        this.purgeBtn = document.getElementById('clear-tasks-btn');
    },
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.input.addEventListener('keypress', (e) => { if(e.key === 'Enter') this.addTask(); });
        this.purgeBtn.addEventListener('click', () => this.purgeAll());
    },
    addTask() {
        const text = this.input.value.trim();
        if(!text) {
            NOXSYSTEM.showToast('Input protocol empty.', 'error');
            return;
        }
        this.tasks.unshift({ id: Date.now(), text: text, status: 'pending', created: new Date().toISOString() });
        this.input.value = '';
        this.save();
        this.render();
        NOXSYSTEM.showToast('Task protocol initiated.', 'success');
    },
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if(task) {
            task.status = task.status === 'pending' ? 'completed' : 'pending';
            this.save();
            this.render();
            NOXSYSTEM.playSound('click');
        }
    },
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
        NOXSYSTEM.showToast('Task data expunged.');
    },
    purgeAll() {
        if(confirm('CRITICAL WARNING: Confirm purge of all tracker data? This action is irreversible.')) {
            this.tasks = [];
            this.save();
            this.render();
            NOXSYSTEM.showToast('All tracker data purged.', 'error');
        }
    },
    save() {
        localStorage.setItem('nox_tasks_v2', JSON.stringify(this.tasks));
        this.updateStats();
    },
    updateStats() {
        const pending = this.tasks.filter(t => t.status === 'pending').length;
        const done = this.tasks.filter(t => t.status === 'completed').length;
        
        document.getElementById('sidebar-todo').innerText = pending;
        document.getElementById('sidebar-done').innerText = done;
        document.getElementById('card-todo-count').innerText = pending;
        document.getElementById('pending-count-alt').innerText = pending;
        document.getElementById('done-count-alt').innerText = done;
    },
    render() {
        this.todoList.innerHTML = '';
        this.doneList.innerHTML = '';
        if(this.tasks.length === 0) {
            this.todoList.innerHTML = '<li style="color:var(--text-muted); font-style:italic;">> No active protocols.</li>';
        }
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.status}`;
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="icon-btn check" onclick="NOX_TRACKER.toggleTask(${task.id})">${task.status === 'pending' ? '✓' : '↺'}</button>
                    <button class="icon-btn trash" onclick="NOX_TRACKER.deleteTask(${task.id})">✕</button>
                </div>
            `;
            (task.status === 'pending' ? this.todoList : this.doneList).appendChild(li);
        });
        this.updateStats();
    }
};


// ==================================================================
// MODULE: FOCUS (Pomodoro Timer)
// ==================================================================
const NOX_FOCUS = {
    timer: null,
    timeLeft: 25 * 60,
    currentModeTime: 25 * 60,
    isRunning: false,
    totalFocusTime: 0,
    
    init() {
        this.totalFocusTime = parseInt(localStorage.getItem('nox_focus_time_v2')) || 0;
        this.cacheDOM();
        this.bindEvents();
        this.initCircle();
        this.updateDisplay();
        this.updateStats();
    },
    cacheDOM() {
        this.display = document.getElementById('timer-val');
        this.label = document.getElementById('timer-label');
        this.startBtn = document.getElementById('timer-start');
        this.resetBtn = document.getElementById('timer-reset');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.circle = document.querySelector('.progress-ring__circle');
    },
    initCircle() {
        const radius = this.circle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circle.style.strokeDashoffset = this.circumference;
    },
    setProgress(percent) {
        const offset = this.circumference - (percent / 100) * this.circumference;
        this.circle.style.strokeDashoffset = offset;
    },
    bindEvents() {
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target));
        });
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
    },
    switchMode(targetBtn) {
        this.modeBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        this.currentModeTime = parseInt(targetBtn.dataset.time) * 60;
        this.label.innerText = targetBtn.innerText;
        this.resetTimer();
        NOXSYSTEM.playSound('click');
    },
    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    },
    start() {
        this.isRunning = true;
        this.startBtn.innerText = 'PAUSE PROCESS';
        this.startBtn.classList.add('secondary');
        this.timer = setInterval(() => this.tick(), 1000);
        NOXSYSTEM.showToast('Focus session initialized.', 'success');
    },
    pause() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.startBtn.innerText = 'RESUME';
        this.startBtn.classList.remove('secondary');
    },
    resetTimer() {
        clearInterval(this.timer);
        this.timeLeft = this.currentModeTime;
        this.isRunning = false;
        this.startBtn.innerText = 'INITIALIZE';
        this.startBtn.classList.remove('secondary');
        this.updateDisplay();
        this.setProgress(0);
    },
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            const percent = ((this.currentModeTime - this.timeLeft) / this.currentModeTime) * 100;
            this.setProgress(percent);
        } else {
            this.complete();
        }
    },
    complete() {
        clearInterval(this.timer);
        this.isRunning = false;
        // Only add time if it was a focus session (usually the longest one)
        if(this.currentModeTime >= 1500) {
            this.totalFocusTime += (this.currentModeTime / 60);
            localStorage.setItem('nox_focus_time_v2', this.totalFocusTime);
            this.updateStats();
        }
        alert('SESSION COMPLETE. SEQUENCE FINISHED.');
        NOXSYSTEM.playSound('beep');
        this.resetTimer();
    },
    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.display.innerText = `${m}:${s}`;
    },
    updateStats() {
        document.getElementById('sidebar-focus').innerText = Math.round(this.totalFocusTime) + 'm';
    }
};


// ==================================================================
// MODULE: SUDOKU ENGINE (Advanced Backtracking)
// ==================================================================
const NOX_SUDOKU = {
    grid: null,
    solution: [],
    currentDiff: 'easy',
    timerInt: null,
    timeElapsed: 0,
    
    init() {
        this.grid = document.getElementById('sudoku-grid');
        if(!this.grid) return;
        this.bindEvents();
        this.generateGame(); // Generate initial game
    },
    bindEvents() {
        document.querySelectorAll('.diff-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDiff = e.target.dataset.diff;
                this.generateGame();
            });
        });
        document.getElementById('sudoku-new-btn').addEventListener('click', () => this.generateGame());
        document.getElementById('sudoku-verify-btn').addEventListener('click', () => this.verify());
    },
    startTimer() {
        clearInterval(this.timerInt);
        this.timeElapsed = 0;
        const timerEl = document.getElementById('sudoku-timer');
        this.timerInt = setInterval(() => {
            this.timeElapsed++;
            const m = Math.floor(this.timeElapsed / 60).toString().padStart(2, '0');
            const s = (this.timeElapsed % 60).toString().padStart(2, '0');
            timerEl.innerText = `TIME: ${m}:${s}`;
        }, 1000);
    },
    // Core Sudoku Logic (Backtracking Algorithm)
    isValid(board, row, col, k) {
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === k || board[row][i] === k) return false;
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + i % 3;
            if (board[boxRow][boxCol] === k) return false;
        }
        return true;
    },
    solve(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    // Randomized numbers 1-9 for varied solutions
                    let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (let k of nums) {
                        if (this.isValid(board, i, j, k)) {
                            board[i][j] = k;
                            if (this.solve(board)) return true;
                            board[i][j] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    },
    fillDiagonalBoxes(board) {
        for (let i = 0; i < 9; i = i + 3) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let num;
                    do { num = Math.floor(Math.random() * 9) + 1; } 
                    while (!this.isSafeInBox(board, i, i, num));
                    board[i + r][i + c] = num;
                }
            }
        }
    },
    isSafeInBox(board, rowStart, colStart, num) {
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (board[rowStart + i][colStart + j] === num) return false;
        return true;
    },
    generateGame() {
        NOXSYSTEM.showToast('Generating new Sudoku matrix...', 'info');
        let board = Array.from({ length: 9 }, () => Array(9).fill(0));
        // 1. Fill diagonal boxes (they are independent)
        this.fillDiagonalBoxes(board);
        // 2. Solve the rest to get a full valid board
        this.solve(board);
        // 3. Save solution
        this.solution = JSON.parse(JSON.stringify(board));
        // 4. Remove digits based on difficulty
        let cellsToRemove = this.currentDiff === 'easy' ? 35 : this.currentDiff === 'medium' ? 45 : 55;
        while (cellsToRemove > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (board[r][c] !== 0) {
                board[r][c] = 0;
                cellsToRemove--;
            }
        }
        this.render(board);
        this.startTimer();
    },
    render(board) {
        this.grid.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (i % 3 === 2 && i !== 8) cell.classList.add('sudoku-row-border');

                if (board[i][j] !== 0) {
                    cell.classList.add('prefilled');
                    cell.innerText = board[i][j];
                } else {
                    const input = document.createElement('input');
                    input.type = 'text'; input.maxLength = 1;
                    input.className = 'sudoku-input';
                    input.dataset.r = i; input.dataset.c = j;
                    // Input validation: Only numbers 1-9
                    input.addEventListener('input', (e) => {
                        const val = e.target.value;
                        if (!/^[1-9]$/.test(val)) e.target.value = '';
                        e.target.style.color = 'var(--primary)'; // Reset color on input
                    });
                     // Navigation support with arrows
                     input.addEventListener('keydown', (e) => this.handleNav(e, i, j));
                    cell.appendChild(input);
                }
                this.grid.appendChild(cell);
            }
        }
    },
    handleNav(e, r, c) {
        let nextR = r, nextC = c;
        switch(e.key) {
            case 'ArrowUp': nextR--; break;
            case 'ArrowDown': nextR++; break;
            case 'ArrowLeft': nextC--; break;
            case 'ArrowRight': nextC++; break;
            default: return;
        }
        const nextInput = document.querySelector(`.sudoku-input[data-r="${nextR}"][data-c="${nextC}"]`);
        if(nextInput) nextInput.focus();
    },
    verify() {
        const inputs = document.querySelectorAll('.sudoku-input');
        let errors = 0;
        let filled = 0;
        inputs.forEach(input => {
            if(input.value) filled++;
            const r = input.dataset.r;
            const c = input.dataset.c;
            if (parseInt(input.value) !== this.solution[r][c]) {
                input.style.color = 'var(--danger)';
                errors++;
            } else {
                input.style.color = 'var(--primary)';
            }
        });

        if (errors === 0 && filled === inputs.length) {
             clearInterval(this.timerInt);
             alert(`SEQUENCE COMPLETE.\nTime: ${document.getElementById('sudoku-timer').innerText}\nStatus: OPTIMAL.`);
             NOXSYSTEM.showToast('Sudoku solved successfully!', 'success');
        } else if (errors > 0) {
             NOXSYSTEM.showToast(`Integrity Check Failed: ${errors} anomalies detected.`, 'error');
             NOXSYSTEM.playSound('error');
        } else {
             NOXSYSTEM.showToast('Matrix incomplete. Cannot verify.', 'info');
        }
    }
};


// ==================================================================
// NEW MODULE: SNAKE BYTE GAME (Canvas Based)
// ==================================================================
const NOX_SNAKE = {
    canvas: null, ctx: null,
    gridSize: 20, tileCountX: 0, tileCountY: 0,
    snake: [], food: {}, velocity: { x: 0, y: 0 },
    score: 0, highScore: 0, gameLoop: null, speed: 100,
    isRunning: false,

    init() {
        this.canvas = document.getElementById('snake-canvas');
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Adjust canvas size based on container, ensure multiple of gridSize
        const wrapper = this.canvas.parentElement;
        this.canvas.width = Math.floor((wrapper.clientWidth - 10) / this.gridSize) * this.gridSize;
        this.tileCountX = this.canvas.width / this.gridSize;
        this.tileCountY = this.canvas.height / this.gridSize;
        
        this.highScore = localStorage.getItem('nox_snake_hs') || 0;
        document.getElementById('snake-highscore').innerText = this.highScore;
        
        this.bindEvents();
        this.reset();
        this.draw(); // Initial static draw
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.getElementById('snake-start-btn').addEventListener('click', () => this.start());
    },

    reset() {
        this.stop();
        this.snake = [{x: 10, y: 10}];
        this.velocity = { x: 0, y: 0 };
        this.score = 0;
        this.speed = 100;
        this.updateScore();
        this.placeFood();
        this.isRunning = false;
        document.getElementById('snake-start-btn').innerText = 'INITIALIZE_SNAKE.exe';
        this.draw();
    },

    start() {
        if(this.isRunning) return;
        this.reset();
        this.isRunning = true;
        this.velocity = { x: 1, y: 0 }; // Start moving right
        document.getElementById('snake-start-btn').innerText = 'RUNNING...';
        this.gameLoop = setInterval(() => this.update(), this.speed);
        NOXSYSTEM.showToast('Snake Byte initialized.', 'success');
    },

    stop() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        if(document.getElementById('snake-start-btn'))
             document.getElementById('snake-start-btn').innerText = 'INITIALIZE_SNAKE.exe';
    },

    handleInput(e) {
        // Prevent default scrolling for arrow keys when game is visible
        if(NOXSYSTEM.state.currentView === 'snake-view' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        if(!this.isRunning) return;

        switch(e.key) {
            case 'ArrowUp': case 'w': if(this.velocity.y === 0) this.velocity = {x: 0, y: -1}; break;
            case 'ArrowDown': case 's': if(this.velocity.y === 0) this.velocity = {x: 0, y: 1}; break;
            case 'ArrowLeft': case 'a': if(this.velocity.x === 0) this.velocity = {x: -1, y: 0}; break;
            case 'ArrowRight': case 'd': if(this.velocity.x === 0) this.velocity = {x: 1, y: 0}; break;
        }
    },

    update() {
        const head = { x: this.snake[0].x + this.velocity.x, y: this.snake[0].y + this.velocity.y };

        // Wall Collision (Wrap around style for hacker feel)
        if(head.x < 0) head.x = this.tileCountX - 1;
        if(head.x >= this.tileCountX) head.x = 0;
        if(head.y < 0) head.y = this.tileCountY - 1;
        if(head.y >= this.tileCountY) head.y = 0;

        // Self Collision
        for(let i = 0; i < this.snake.length; i++) {
            if(head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head); // Add new head

        // Food Collision
        if(head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.placeFood();
            NOXSYSTEM.playSound('beep');
            // Increase speed slightly
            if(this.speed > 50) {
                 clearInterval(this.gameLoop);
                 this.speed -= 2;
                 this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop(); // Remove tail if no food eaten
        }

        this.draw();
    },

    placeFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCountX),
            y: Math.floor(Math.random() * this.tileCountY)
        };
        // Ensure food doesn't appear inside snake body
        for(let part of this.snake) {
            if(part.x === this.food.x && part.y === this.food.y) {
                this.placeFood(); // Retry
                break;
            }
        }
    },

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Snake
        this.snake.forEach((part, index) => {
            // Head is a different color/style
            this.ctx.fillStyle = index === 0 ? '#d4ff00' : '#238636'; 
            this.ctx.fillRect(part.x * this.gridSize, part.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
            // Add a cool glow effect to the head
            if(index === 0) {
                this.ctx.shadowColor = '#d4ff00';
                this.ctx.shadowBlur = 10;
            } else {
                 this.ctx.shadowBlur = 0;
            }
        });
        this.ctx.shadowBlur = 0; // Reset shadow

        // Draw Food (Glitching effect)
        this.ctx.fillStyle = Math.random() > 0.2 ? '#ff0055' : '#fff';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    },

    updateScore() {
        document.getElementById('snake-score').innerText = this.score;
        if(this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('nox_snake_hs', this.highScore);
            document.getElementById('snake-highscore').innerText = this.highScore;
        }
    },

    gameOver() {
        this.stop();
        NOXSYSTEM.playSound('error');
        alert(`GAME OVER.\nPROTOCOL TERMINATED.\nFINAL SCORE: ${this.score}`);
        this.reset();
    }
};


// ==================================================================
// NEW MODULE: NEURAL NET (Blog System with Triangle Voting)
// ==================================================================
const NOX_BLOG = {
    posts: [],
    init() {
        // Load posts or initialize with dummy data if empty
        let savedPosts = localStorage.getItem('nox_blog_posts_v2');
        if(!savedPosts) {
             this.posts = [
                 {id: 101, title: "The Future of Cybernetics in 2025", excerpt: "Analyzing the integration of neural interfaces and everyday coding workflow. Are we ready for direct-to-cortex debugging?", content: "Full article content here...\n\nWhatever.", tags: ["tech", "future"], author: "Dai_Dang", date: "2025-10-24", votes: 42},
                 {id: 102, title: "Optimizing C++ Vectors for Low-Latency Systems", excerpt: "A deep dive into memory management and custom allocators for high-frequency trading platforms and real-time engines.", content: "Code snippets and analysis...", tags: ["cpp", "optimization"], author: "Dai_Dang", date: "2025-11-01", votes: 128},
                 {id: 103, title: "Why Vim is Still King (Opinion)", excerpt: "Despite modern IDEs, the efficiency of modal editing remains unmatched for seasoned developers.", content: "Vim vs VSCode arguments...", tags: ["vim", "editor"], author: "System", date: "2025-11-15", votes: -5}
             ];
             this.save();
        } else {
             this.posts = JSON.parse(savedPosts);
        }
        this.cacheDOM();
    },
    cacheDOM() {
        this.listContainer = document.getElementById('blog-posts-list');
        this.postView = document.getElementById('post-detail-view');
        this.modal = document.getElementById('post-modal');
    },
    save() {
        localStorage.setItem('nox_blog_posts_v2', JSON.stringify(this.posts));
        // Update global rep (sum of all votes)
        const totalRep = this.posts.reduce((sum, post) => sum + post.votes, 0);
        document.getElementById('sidebar-rep').innerText = totalRep > 0 ? `+${totalRep}` : totalRep;
    },
    renderPosts() {
        this.listContainer.innerHTML = '';
        // Sort by date descending
        const sortedPosts = [...this.posts].sort((a,b) => new Date(b.date) - new Date(a.date));
        
        sortedPosts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'blog-post-card';
            // Determine vote color
            let voteColor = post.votes > 0 ? 'var(--primary)' : post.votes < 0 ? 'var(--danger)' : 'var(--text-main)';
            
            card.innerHTML = `
                <div class="blog-vote-section">
                    <button class="vote-btn vote-up" onclick="NOX_BLOG.vote(${post.id}, 1)"></button>
                    <span class="vote-count" style="color:${voteColor}">${post.votes}</span>
                    <button class="vote-btn vote-down" onclick="NOX_BLOG.vote(${post.id}, -1)"></button>
                </div>
                <div class="blog-content-preview" onclick="NOX_BLOG.viewPost(${post.id})">
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-meta">
                        <span><i class="fas fa-user-astronaut"></i> ${post.author}</span>
                        <span><i class="far fa-calendar-alt"></i> ${post.date}</span>
                        <div class="blog-tags">${post.tags.map(t => `<span>#${t}</span>`).join('')}</div>
                    </div>
                </div>
            `;
            this.listContainer.appendChild(card);
        });
    },
    vote(postId, change) {
        // In a real app, this would call a backend and verify user hasn't voted yet.
        // Here we just simulate it locally.
        const post = this.posts.find(p => p.id === postId);
        if(post) {
            post.votes += change;
            this.save();
            this.renderPosts(); // Re-render to update count and color
            NOXSYSTEM.playSound('click');
        }
    },
    viewPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if(!post) return;

        this.postView.innerHTML = `
            <div class="sub-view-header">
                <button class="back-btn" onclick="NOXSYSTEM.navigate('blog-view')">← BACK TO NET</button>
                <h2 class="section-title" style="font-size:16px;">ENTRY ID: #${post.id}</h2>
            </div>
            <article class="post-full-container">
                <header class="post-full-header">
                    <h1 class="post-full-title">${post.title}</h1>
                    <div class="blog-meta" style="font-size:13px;">
                         <span>OP: ${post.author}</span> | <span>DATE: ${post.date}</span> | <span>REP: ${post.votes}</span>
                    </div>
                </header>
                <div class="post-full-content">
                    ${post.content.replace(/\n/g, '<br>')} </div>
            </article>
        `;
        NOXSYSTEM.navigate('post-detail-view');
    },
    // Modal handling for new posts
    showCreateModal() {
        this.modal.classList.add('show');
        document.getElementById('post-title-input').focus();
    },
    hideCreateModal() {
        this.modal.classList.remove('show');
        // Clear inputs
        document.getElementById('post-title-input').value = '';
        document.getElementById('post-content-input').value = '';
        document.getElementById('post-tags-input').value = '';
    },
    savePost() {
        const title = document.getElementById('post-title-input').value.trim();
        const content = document.getElementById('post-content-input').value.trim();
        const tagsStr = document.getElementById('post-tags-input').value.trim();
        
        if(!title || !content) {
            NOXSYSTEM.showToast('Data incomplete. Cannot publish.', 'error');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            title: title,
            excerpt: content.substring(0, 150) + '...',
            content: content,
            tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : ['uncategorized'],
            author: NOXSYSTEM.state.user,
            date: new Date().toISOString().split('T')[0],
            votes: 0
        };
        
        this.posts.unshift(newPost);
        this.save();
        this.hideCreateModal();
        this.renderPosts();
        NOXSYSTEM.showToast('Entry published to Neural Net.', 'success');
    }
};


// ==================================================================
// MODULE: DECIDER (Randomizer)
// ==================================================================
const NOX_DECIDER = {
    init() {
        const spinBtn = document.getElementById('spin-btn');
        if(spinBtn) spinBtn.addEventListener('click', () => this.spin());
    },
    spin() {
        const input = document.getElementById('decision-options');
        const resultEl = document.getElementById('decision-result');
        const options = input.value.split('\n').filter(opt => opt.trim() !== '');
        
        if (options.length < 2) {
            resultEl.innerText = "INSUFFICIENT DATA. NEED > 1 VARIABLES.";
            resultEl.style.color = 'var(--danger)';
            NOXSYSTEM.playSound('error');
            return;
        }

        let counter = 0;
        resultEl.style.color = 'var(--text-main)';
        const interval = setInterval(() => {
            resultEl.innerText = options[Math.floor(Math.random() * options.length)];
            counter++;
            NOXSYSTEM.playSound('click');
            if (counter > 15) {
                clearInterval(interval);
                const finalChoice = options[Math.floor(Math.random() * options.length)];
                resultEl.innerText = `>> ${finalChoice} <<`;
                resultEl.style.color = 'var(--accent)';
                NOXSYSTEM.playSound('beep');
            }
        }, 80);
    }
};

/* END OF SYSTEM CODE */
