/* NOXCODE SYSTEM CORE 2.0
   OPERATOR: DAI_DANG_CS
   UPDATES: Added Sound Engine, Toast Notifications, Matrix Optimization
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SYSTEM AUDIO ENGINE (WEB AUDIO API) ---
    // Không cần file mp3, tự tạo âm thanh điện tử
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let soundEnabled = true;

    window.playBeep = function(freq = 600, duration = 0.05, type = 'square') {
        if (!soundEnabled || audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (!soundEnabled) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    // Gắn âm thanh hover cho các element có class .hover-sound
    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.classList && e.target.classList.contains('hover-sound')) {
            playBeep(400, 0.03, 'sine');
        }
    }, true);

    // Toggle Sound Button
    const soundBtn = document.getElementById('toggle-sound');
    if(soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.innerText = soundEnabled ? '[ SOUND: ON ]' : '[ SOUND: OFF ]';
            soundBtn.style.color = soundEnabled ? 'var(--primary)' : '#555';
            playBeep(soundEnabled ? 800 : 200, 0.1);
        });
    }

    // --- 2. NOTIFICATION SYSTEM (TOAST) ---
    window.showToast = function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return; // Nếu đang ở trang profile có thể không có container này thì thôi

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${msg}`;
        
        container.appendChild(toast);
        playBeep(type === 'success' ? 1000 : 200, 0.1, 'square');

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- 3. MATRIX RAIN ENGINE (OPTIMIZED) ---
    const canvas = document.getElementById('matrix-rain');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        const chars = 'NOXCODE_01'.split('');
        const fontSize = 14;
        const columns = width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#0F0'; 
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
    }

    // --- 4. SYSTEM CLOCK ---
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        const clockEl = document.getElementById('system-clock');
        if(clockEl) clockEl.innerText = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 5. NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-container');
    const breadcrumb = document.getElementById('current-module');

    window.navigateTo = function(targetId) {
        if(!document.getElementById(targetId)) return; // Check exists
        navItems.forEach(item => item.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));

        document.getElementById(targetId).classList.add('active');
        const activeNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if(activeNav) activeNav.classList.add('active');

        if(breadcrumb) breadcrumb.innerText = targetId.replace('-view', '').toUpperCase();
        playBeep(600, 0.05);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.target));
    });

    // --- 6. TYPEWRITER EFFECT ---
    const typeEl = document.getElementById('typing-effect');
    if(typeEl) {
        const textToType = "System optimized for Operator Dai. Ready to code.";
        let charIndex = 0;
        typeEl.innerHTML = ""; 
        function typeWriter() {
            if (charIndex < textToType.length) {
                typeEl.innerHTML += textToType.charAt(charIndex);
                charIndex++;
                if(Math.random() > 0.5) playBeep(800, 0.01, 'sawtooth'); // Âm thanh gõ phím
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 1000);
    }

    // --- 7. TRACKER MODULE ---
    const taskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    
    let tasks = JSON.parse(localStorage.getItem('noxTasks')) || [];

    function saveTasks() {
        localStorage.setItem('noxTasks', JSON.stringify(tasks));
        renderTasks();
        updateDashboardStats();
    }

    function renderTasks() {
        if(!todoList || !doneList) return;
        todoList.innerHTML = '';
        doneList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.status}`;
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="icon-btn check hover-sound" onclick="toggleTask(${index})">✓</button>
                    <button class="icon-btn trash hover-sound" onclick="deleteTask(${index})">✕</button>
                </div>
            `;
            // Re-attach hover sound for dynamic elements
            li.addEventListener('mouseenter', () => playBeep(400, 0.03));

            if (task.status === 'pending') todoList.appendChild(li);
            else doneList.appendChild(li);
        });
    }

    window.addTask = function() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text: text, status: 'pending', date: new Date().toISOString() });
            taskInput.value = '';
            saveTasks();
            showToast('Task Added to Queue');
        }
    }

    window.toggleTask = function(index) {
        tasks[index].status = tasks[index].status === 'pending' ? 'completed' : 'pending';
        saveTasks();
        playBeep(1200, 0.1);
    }

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        saveTasks();
        playBeep(200, 0.2, 'sawtooth');
    }

    window.clearAllTasks = function() {
        if(confirm('WARNING: Purge all task data?')) {
            tasks = [];
            saveTasks();
            showToast('All Tasks Purged', 'error');
        }
    }

    if(addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if(taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }

    // --- 8. FOCUS TIMER ---
    let timerInterval;
    let timeLeft = 25 * 60;
    let totalFocusTime = parseInt(localStorage.getItem('noxFocusTime')) || 0;
    let isRunning = false;
    let currentModeTime = 25 * 60;

    const circle = document.querySelector('.progress-ring__circle');
    const timerStartBtn = document.getElementById('timer-start');
    
    function setProgress(percent) {
        if(!circle) return;
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateDisplay() {
        const el = document.getElementById('timer-val');
        if(el) el.innerText = formatTime(timeLeft);
    }

    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mins = parseInt(btn.dataset.time);
            currentModeTime = mins * 60;
            resetTimer();
            playBeep(500, 0.05);
        });
    });

    if(timerStartBtn) {
        timerStartBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(timerInterval);
                this.innerText = 'RESUME';
                this.classList.add('secondary');
                isRunning = false;
                playBeep(300, 0.1);
            } else {
                this.innerText = 'PAUSE';
                this.classList.remove('secondary');
                isRunning = true;
                playBeep(1000, 0.1);
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
                        showToast('SESSION COMPLETE! GOOD JOB.');
                        playBeep(1500, 0.5); // Long beep
                        resetTimer();
                    }
                }, 1000);
            }
        });
    }

    const timerResetBtn = document.getElementById('timer-reset');
    if(timerResetBtn) {
        timerResetBtn.addEventListener('click', window.resetTimer);
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

    // --- 9. SUDOKU ENGINE ---
    const sudokuGrid = document.getElementById('sudoku-grid');
    let solutionMatrix = [];
    
    document.querySelectorAll('.diff-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.diff-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            playBeep(600, 0.05);
            generateNewGame();
        });
    });

    // ... (Giữ nguyên logic isValid, solveSudoku, fillBox, isSafeInBox từ code cũ của bạn vì nó đã chuẩn) ...
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
                    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
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
    function fillBox(board, row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do { num = Math.floor(Math.random() * 9) + 1; } while (!isSafeInBox(board, row, col, num));
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

    window.generateNewGame = function() {
        let board = Array.from({ length: 9 }, () => Array(9).fill(0));
        for (let i = 0; i < 9; i = i + 3) fillBox(board, i, i);
        solveSudoku(board);
        solutionMatrix = JSON.parse(JSON.stringify(board));
        
        // Remove logic
        const diff = document.querySelector('.diff-chip.active').dataset.diff;
        let attempts = diff === 'easy' ? 30 : diff === 'medium' ? 45 : 55;
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
                    input.type = 'text'; input.maxLength = 1; input.className = 'sudoku-input';
                    input.dataset.r = i; input.dataset.c = j;
                    input.addEventListener('input', (e) => {
                        if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
                        else playBeep(800, 0.05); // Sound on input
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
                input.style.color = '#ff3333';
                isCorrect = false;
            } else {
                input.style.color = '#00ff41';
            }
        });

        if (isCorrect && inputs.length > 0) {
            showToast('SYSTEM STATUS: VERIFIED.', 'success');
        } else {
            showToast('ERRORS DETECTED. RECALIBRATE.', 'error');
            playBeep(150, 0.3, 'sawtooth');
        }
    }

    // --- 10. DECIDER ---
    const decideBtn = document.getElementById('spin-btn');
    const decideRes = document.getElementById('decision-result');
    const decideInput = document.getElementById('decision-options');

    if(decideBtn) {
        decideBtn.addEventListener('click', () => {
            const options = decideInput.value.split('\n').filter(opt => opt.trim() !== '');
            if (options.length < 2) {
                showToast('INPUT ERROR: Need 2+ options', 'error');
                return;
            }
            let counter = 0;
            const interval = setInterval(() => {
                decideRes.innerText = options[Math.floor(Math.random() * options.length)];
                counter++;
                playBeep(400 + (counter * 20), 0.03); // Rising pitch
                if (counter > 20) {
                    clearInterval(interval);
                    playBeep(1200, 0.2);
                    decideRes.style.color = 'var(--accent)';
                }
            }, 80);
        });
    }

    // --- 11. STATS UPDATE ---
    function updateDashboardStats() {
        const doneCount = tasks.filter(t => t.status === 'completed').length;
        const pendingCount = tasks.filter(t => t.status === 'pending').length;
        
        const sidebarDone = document.getElementById('sidebar-done');
        const sidebarTodo = document.getElementById('sidebar-todo');
        const sidebarFocus = document.getElementById('sidebar-focus');
        const cardTodoCount = document.getElementById('card-todo-count');

        if(sidebarDone) sidebarDone.innerText = doneCount;
        if(sidebarTodo) sidebarTodo.innerText = pendingCount;
        if(sidebarFocus) sidebarFocus.innerText = Math.round(totalFocusTime) + 'm';
        if(cardTodoCount) cardTodoCount.innerText = pendingCount;
    }

    // Init
    renderTasks();
    updateDashboardStats();
    if(sudokuGrid) generateNewGame();
});
