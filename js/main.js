/* NOXCODE SYSTEM CORE
    OPERATOR: DAI_DANG_CS
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- MATRIX RAIN ENGINE ---
    const canvas = document.getElementById('matrix-rain');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const chars = '10XYZ01'.split('');
    const fontSize = 14;
    const columns = width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#0F0'; // Green text
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 50);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // --- SYSTEM CLOCK (UPDATED) ---
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        
        const clockEl = document.getElementById('system-clock');
        if(clockEl) {
            clockEl.innerText = timeString;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-container');
    const breadcrumb = document.getElementById('current-module');

    window.navigateTo = function(targetId) {
        // Remove active states
        navItems.forEach(item => item.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));

        // Set active state
        document.getElementById(targetId).classList.add('active');
        const activeNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if(activeNav) activeNav.classList.add('active');

        // Update Text
        breadcrumb.innerText = targetId.replace('-view', '').toUpperCase();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.target);
        });
    });

    // --- TYPEWRITER EFFECT ---
    const textToType = "System optimized for Operator Dai. Ready to code.";
    const typeEl = document.getElementById('typing-effect');
    let charIndex = 0;
    
    function typeWriter() {
        if (charIndex < textToType.length) {
            typeEl.innerHTML = textToType.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeWriter, 50);
        }
    }
    setTimeout(typeWriter, 1000);

    // --- TRACKER MODULE (LOCAL STORAGE) ---
    const taskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    
    // Load from LocalStorage
    let tasks = JSON.parse(localStorage.getItem('noxTasks')) || [];

    function saveTasks() {
        localStorage.setItem('noxTasks', JSON.stringify(tasks));
        renderTasks();
        updateDashboardStats();
    }

    function renderTasks() {
        todoList.innerHTML = '';
        doneList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.status}`;
            
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="icon-btn check" onclick="toggleTask(${index})">✓</button>
                    <button class="icon-btn trash" onclick="deleteTask(${index})">✕</button>
                </div>
            `;

            if (task.status === 'pending') {
                todoList.appendChild(li);
            } else {
                doneList.appendChild(li);
            }
        });
    }

    window.addTask = function() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text: text, status: 'pending', date: new Date().toISOString() });
            taskInput.value = '';
            saveTasks();
        }
    }

    window.toggleTask = function(index) {
        tasks[index].status = tasks[index].status === 'pending' ? 'completed' : 'pending';
        saveTasks();
    }

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        saveTasks();
    }

    window.clearAllTasks = function() {
        if(confirm('WARNING: Purge all task data?')) {
            tasks = [];
            saveTasks();
        }
    }

    if(addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if(taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }

    // --- FOCUS TIMER MODULE ---
    let timerInterval;
    let timeLeft = 25 * 60;
    let totalFocusTime = parseInt(localStorage.getItem('noxFocusTime')) || 0;
    let isRunning = false;
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateDisplay() {
        document.getElementById('timer-val').innerText = formatTime(timeLeft);
    }

    const modeBtns = document.querySelectorAll('.mode-btn');
    let currentModeTime = 25 * 60;

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mins = parseInt(btn.dataset.time);
            currentModeTime = mins * 60;
            resetTimer();
        });
    });

    const timerStartBtn = document.getElementById('timer-start');
    if(timerStartBtn) {
        timerStartBtn.addEventListener('click', function() {
            if (isRunning) {
                // Pause
                clearInterval(timerInterval);
                this.innerText = 'RESUME';
                this.classList.add('secondary');
                isRunning = false;
            } else {
                // Start
                this.innerText = 'PAUSE';
                this.classList.remove('secondary');
                isRunning = true;
                timerInterval = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateDisplay();
                        const percent = ((currentModeTime - timeLeft) / currentModeTime) * 100;
                        setProgress(percent);
                    } else {
                        clearInterval(timerInterval);
                        isRunning = false;
                        totalFocusTime += (currentModeTime / 60);
                        localStorage.setItem('noxFocusTime', totalFocusTime);
                        updateDashboardStats();
                        alert('SESSION COMPLETE');
                        resetTimer();
                    }
                }, 1000);
            }
        });
    }

    const timerResetBtn = document.getElementById('timer-reset');
    if(timerResetBtn) {
        timerResetBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            timeLeft = currentModeTime;
            isRunning = false;
            timerStartBtn.innerText = 'INITIALIZE';
            timerStartBtn.classList.remove('secondary');
            updateDisplay();
            setProgress(0);
        });
    }

    window.resetTimer = function() {
        clearInterval(timerInterval);
        timeLeft = currentModeTime;
        isRunning = false;
        if(timerStartBtn) {
            timerStartBtn.innerText = 'INITIALIZE';
            timerStartBtn.classList.remove('secondary');
        }
        updateDisplay();
        setProgress(0);
    }

    // --- SUDOKU ENGINE (BACKTRACKING) ---
    const sudokuGrid = document.getElementById('sudoku-grid');
    let currentDiff = 'easy';
    let solutionMatrix = [];

    document.querySelectorAll('.diff-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.diff-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentDiff = chip.dataset.diff;
            generateNewGame();
        });
    });

    function isValid(board, row, col, k) {
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === k) return false;
            if (board[row][i] === k) return false;
            if (board[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + i % 3] === k) return false;
        }
        return true;
    }

    function solveSudoku(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    // Shuffle for randomness
                    nums.sort(() => Math.random() - 0.5);
                    
                    for (let k of nums) {
                        if (isValid(board, i, j, k)) {
                            board[i][j] = k;
                            if (solveSudoku(board)) return true;
                            board[i][j] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    window.generateNewGame = function() {
        // Create empty board
        let board = Array.from({ length: 9 }, () => Array(9).fill(0));
        
        // Fill diagonal 3x3 matrices first (independent) for better randomization
        for (let i = 0; i < 9; i = i + 3) {
            fillBox(board, i, i);
        }

        // Solve the rest
        solveSudoku(board);
        
        // Save solution
        solutionMatrix = JSON.parse(JSON.stringify(board));

        // Remove digits based on difficulty
        let attempts = currentDiff === 'easy' ? 30 : currentDiff === 'medium' ? 45 : 55;
        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                attempts--;
            }
        }

        renderSudoku(board);
    }

    function fillBox(board, row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!isSafeInBox(board, row, col, num));
                board[row + i][col + j] = num;
            }
        }
    }

    function isSafeInBox(board, rowStart, colStart, num) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[rowStart + i][colStart + j] === num) return false;
            }
        }
        return true;
    }

    function renderSudoku(board) {
        if(!sudokuGrid) return;
        sudokuGrid.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                
                if (board[i][j] !== 0) {
                    cell.classList.add('prefilled');
                    cell.innerText = board[i][j];
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.className = 'sudoku-input';
                    input.dataset.r = i;
                    input.dataset.c = j;
                    
                    input.addEventListener('input', (e) => {
                        const val = e.target.value;
                        if (!/^[1-9]$/.test(val)) e.target.value = '';
                    });
                    
                    cell.appendChild(input);
                }
                sudokuGrid.appendChild(cell);
            }
        }
    }

    window.verifySolution = function() {
        const inputs = document.querySelectorAll('.sudoku-input');
        let isCorrect = true;
        
        inputs.forEach(input => {
            const r = input.dataset.r;
            const c = input.dataset.c;
            const val = parseInt(input.value);
            
            if (val !== solutionMatrix[r][c]) {
                input.style.color = '#ff3333'; // Error color
                isCorrect = false;
            } else {
                input.style.color = '#00ff41'; // Success color
            }
        });

        if (isCorrect) {
            alert('SYSTEM STATUS: VERIFIED. EXCELLENT WORK.');
        } else {
            alert('SYSTEM STATUS: ERRORS DETECTED.');
        }
    }

    // --- DECIDER MODULE ---
    const decideBtn = document.getElementById('spin-btn');
    const decideRes = document.getElementById('decision-result');
    const decideInput = document.getElementById('decision-options');

    if(decideBtn) {
        decideBtn.addEventListener('click', () => {
            const options = decideInput.value.split('\n').filter(opt => opt.trim() !== '');
            
            if (options.length < 2) {
                decideRes.innerText = "INPUT ERROR";
                decideRes.style.color = 'var(--danger)';
                return;
            }

            let counter = 0;
            decideRes.style.color = 'var(--text-main)';
            
            const interval = setInterval(() => {
                decideRes.innerText = options[Math.floor(Math.random() * options.length)];
                counter++;
                if (counter > 20) {
                    clearInterval(interval);
                    const finalChoice = options[Math.floor(Math.random() * options.length)];
                    decideRes.innerText = finalChoice;
                    decideRes.style.color = 'var(--accent)';
                }
            }, 80);
        });
    }

    // --- GLOBAL STATS UPDATE ---
    function updateDashboardStats() {
        const doneCount = tasks.filter(t => t.status === 'completed').length;
        const pendingCount = tasks.filter(t => t.status === 'pending').length;

        // Sidebar
        const sidebarDone = document.getElementById('sidebar-done');
        const sidebarTodo = document.getElementById('sidebar-todo');
        const sidebarFocus = document.getElementById('sidebar-focus');
        const cardTodoCount = document.getElementById('card-todo-count');

        if(sidebarDone) sidebarDone.innerText = doneCount;
        if(sidebarTodo) sidebarTodo.innerText = pendingCount;
        if(sidebarFocus) sidebarFocus.innerText = Math.round(totalFocusTime) + 'm';
        if(cardTodoCount) cardTodoCount.innerText = pendingCount;
    }

    // Initial Load
    renderTasks();
    updateDashboardStats();
    generateNewGame();
});
