document.addEventListener('DOMContentLoaded', () => {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let soundEnabled = true;

    window.playBeep = function(freq = 600, duration = 0.05, type = 'square') {
        if (!soundEnabled) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

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

    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.classList && e.target.classList.contains('hover-sound')) {
            playBeep(400, 0.03, 'sine');
        }
    }, true);

    const soundBtn = document.getElementById('toggle-sound');
    if(soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.innerText = soundEnabled ? '[ SOUND: ON ]' : '[ SOUND: OFF ]';
            soundBtn.style.color = soundEnabled ? 'var(--primary)' : 'var(--text-muted)';
            playBeep(soundEnabled ? 800 : 200, 0.1);
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    const arcaeaBtn = document.getElementById('arcaea-toggle');
    const body = document.body;
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    const savedTheme = localStorage.getItem('noxTheme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if(themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else if (savedTheme === 'arcaea') {
        body.classList.add('theme-arcaea');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.remove('theme-arcaea');
            body.classList.toggle('light-mode');
            
            if (body.classList.contains('light-mode')) {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('noxTheme', 'light');
                playBeep(1000, 0.05);
            } else {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('noxTheme', 'dark');
                playBeep(600, 0.05);
            }
        });
    }

    if (arcaeaBtn) {
        arcaeaBtn.addEventListener('click', () => {
            body.classList.remove('light-mode');
            if(themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            
            body.classList.toggle('theme-arcaea');
            if (body.classList.contains('theme-arcaea')) {
                localStorage.setItem('noxTheme', 'arcaea');
                playBeep(1200, 0.1, 'sine');
                showToast('DIMENSION SHIFT: ARCAEA');
            } else {
                localStorage.setItem('noxTheme', 'dark');
                playBeep(400, 0.1, 'sawtooth');
            }
        });
    }

    const quotes = [
        "Code is like humor. When you have to explain it, it’s bad.",
        "Fix the cause, not the symptom.",
        "Simplicity is the soul of efficiency.",
        "Make it work, make it right, make it fast.",
        "Talk is cheap. Show me the code.",
        "Experience is the name everyone gives to their mistakes.",
        "In order to be irreplaceable, one must always be different.",
        "Knowledge is power.",
        "Stay hungry, stay foolish.",
        "It’s not a bug, it’s a feature.",
        "First, solve the problem. Then, write the code.",
        "Optimism is an occupational hazard of programming.",
        "The only way to do great work is to love what you do.",
        "Pain is temporary. Quitting lasts forever.",
        "Don't watch the clock; do what it does. Keep going.",
        "Dream big and dare to fail.",
        "Your limitation—it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Success doesn’t just find you. You have to go out and get it."
    ];

    function getDailyQuote() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const quoteIndex = dayOfYear % quotes.length;
        return quotes[quoteIndex];
    }

    const typeEl = document.getElementById('typing-effect');
    if(typeEl) {
        const textToType = `> ${getDailyQuote()}`;
        let charIndex = 0;
        typeEl.innerHTML = ""; 
        typeEl.style.color = "var(--primary)";
        
        function typeWriter() {
            if (charIndex < textToType.length) {
                typeEl.innerHTML += textToType.charAt(charIndex);
                charIndex++;
                if(Math.random() > 0.8) playBeep(800, 0.005, 'sawtooth');
                setTimeout(typeWriter, 40);
            }
        }
        setTimeout(typeWriter, 1000);
    }

    const dateEl = document.getElementById('system-date');
    let currentDate = new Date();
    
    function updateDateDisplay() {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if(dateEl) dateEl.innerText = now.toLocaleDateString('en-CA', options);
    }
    updateDateDisplay();

    const calModal = document.getElementById('calendar-modal');
    const calGrid = document.getElementById('cal-days-grid');
    const calMonthYear = document.getElementById('cal-month-year');
    
    window.toggleCalendar = function() {
        if(!calModal) return;
        calModal.classList.toggle('open');
        if(calModal.classList.contains('open')) {
            renderCalendar(currentDate);
            playBeep(600, 0.1);
        } else {
            playBeep(300, 0.1);
        }
    }

    function renderCalendar(date) {
        if(!calGrid) return;
        calGrid.innerHTML = '';
        
        const year = date.getFullYear();
        const month = date.getMonth();
        
        calMonthYear.innerText = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for(let i=0; i<firstDay; i++) {
            const div = document.createElement('div');
            div.className = 'cal-day empty';
            calGrid.appendChild(div);
        }
        
        const today = new Date();
        for(let i=1; i<=daysInMonth; i++) {
            const div = document.createElement('div');
            div.className = 'cal-day';
            div.innerText = i;
            if(i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                div.classList.add('today');
            }
            div.addEventListener('mouseenter', () => playBeep(500, 0.01));
            calGrid.appendChild(div);
        }
    }

    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
        playBeep(400, 0.05);
    });
    
    document.getElementById('next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
        playBeep(400, 0.05);
    });

    window.showToast = function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;

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
            ctx.fillStyle = document.body.classList.contains('light-mode') ? 'rgba(240, 242, 245, 0.1)' : 'rgba(5, 5, 5, 0.05)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = document.body.classList.contains('theme-arcaea') ? '#cba3ff' : (document.body.classList.contains('light-mode') ? '#00c641' : '#0F0');
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

    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        const clockEl = document.getElementById('system-clock');
        if(clockEl) clockEl.innerText = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-container');
    const breadcrumb = document.getElementById('current-module');

    window.navigateTo = function(targetId) {
        if(!document.getElementById(targetId)) return;
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
                        playBeep(1500, 0.5);
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
                        else playBeep(800, 0.05);
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
                playBeep(400 + (counter * 20), 0.03);
                if (counter > 20) {
                    clearInterval(interval);
                    playBeep(1200, 0.2);
                    decideRes.style.color = 'var(--accent)';
                }
            }, 80);
        });
    }

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

    let myCodeEditor;
    const textArea = document.getElementById('cpp-code');

    if (textArea && !myCodeEditor) {
        myCodeEditor = CodeMirror.fromTextArea(textArea, {
            mode: "text/x-c++src",
            theme: "dracula",
            lineNumbers: true,
            autoCloseBrackets: true,
            indentUnit: 4,
            tabSize: 4
        });
        setTimeout(() => myCodeEditor.refresh(), 100);
    }

    const ideNavBtn = document.querySelector('.nav-item[data-target="compiler-view"]');
    if(ideNavBtn) {
        ideNavBtn.addEventListener('click', () => {
            setTimeout(() => {
                if(myCodeEditor) myCodeEditor.refresh();
            }, 50);
        });
    }

    window.runFakeCode = function() {
        const outputConsole = document.getElementById('terminal-output');
        const code = myCodeEditor.getValue();
        const stdVersion = document.getElementById('cpp-std').value; 
        
        if(!code.trim()) {
            showToast('ERROR: Empty Source Code', 'error');
            return;
        }

        outputConsole.innerHTML = `<span style="color:#888">$ g++ solution.cpp -o solution -std=${stdVersion} -O2 -Wall</span>\n`;
        outputConsole.innerHTML += '<span style="color:yellow">Compiling source...</span>';
        playBeep(200, 0.1, 'square');

        let delayTime = stdVersion === 'c++20' ? 1500 : 800;

        setTimeout(() => {
            outputConsole.innerHTML += '\n<span style="color:#666">Linking objects...</span>';
            playBeep(300, 0.1, 'square');
            
            setTimeout(() => {
                outputConsole.innerHTML = '';
                let fakeOutput = "";
                const lines = code.split('\n');
                let hasOutput = false;

                lines.forEach(line => {
                    if(line.includes('cout')) {
                        const match = line.match(/"([^"]+)"/);
                        if(match) {
                            fakeOutput += match[1] + '\n';
                            hasOutput = true;
                        }
                    }
                });

                if(!hasOutput) fakeOutput = "Program exited with code 0.\n(No standard output)";

                outputConsole.innerHTML = `
<span style="color:#888">$ ./solution</span>
${fakeOutput}
<span style="color: #666; font-size: 11px; border-top: 1px dashed #333; display:block; margin-top:10px; padding-top:5px;">
--------------------------------
Standard: ${stdVersion.toUpperCase()}
Process finished with exit code 0
Execution time: 0.0${Math.floor(Math.random() * 9)}s
Memory used: ${Math.floor(Math.random() * 500) + 100}KB
</span>`;
                
                showToast(`Build Successful (${stdVersion.toUpperCase()})`, 'success');
                playBeep(1000, 0.2); 
            }, delayTime);
        }, 600);
    }

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key.toLowerCase()) {
            case '1': navigateTo('dashboard-view'); break;
            case '2': navigateTo('tracker-view'); break;
            case '3': navigateTo('focus-view'); break;
            case '4': navigateTo('sudoku-view'); break;
            case '5': navigateTo('decide-view'); break;
            case 'm': 
                const soundBtn = document.getElementById('toggle-sound');
                if(soundBtn) soundBtn.click();
                break;
            case 'l': 
                const themeBtn = document.getElementById('theme-toggle');
                if(themeBtn) themeBtn.click();
                break;
            case 'a':
                const arcBtn = document.getElementById('arcaea-toggle');
                if(arcBtn) arcBtn.click();
                break;
            case 'f':
                toggleFullScreen();
                break;
        }
    });

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            showToast('FULLSCREEN MODE: ON');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                showToast('FULLSCREEN MODE: OFF');
            }
        }
        playBeep(500, 0.1);
    }

    let secretCode = '';
    document.addEventListener('keydown', (e) => {
        secretCode += e.key;
        if (secretCode.length > 4) secretCode = secretCode.slice(-4);
        
        if (secretCode === 'hack') {
            document.documentElement.style.setProperty('--primary', '#ff0055');
            document.documentElement.style.setProperty('--primary-dim', 'rgba(255, 0, 85, 0.15)');
            document.documentElement.style.setProperty('--primary-glow', 'rgba(255, 0, 85, 0.4)');
            showToast('SYSTEM BREACH DETECTED!', 'error');
            playBeep(150, 0.5, 'sawtooth');
            secretCode = '';
        }
    });

    renderTasks();
    updateDashboardStats();
    if(sudokuGrid) generateNewGame();
});
