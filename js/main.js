document.addEventListener("DOMContentLoaded", () => {
    const sfxNice = document.getElementById('sfxNice');
    const sfxAlarm = document.getElementById('sfxAlarm');
    const sfxError = document.getElementById('sfxError');
    sfxAlarm.volume = 0.7;

    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let columns;
    let drops = [];
    const matrixChars = '10'.split('');
    const matrixColors = ['#0f0', '#00ff41', '#39ff14'];

    function initMatrix() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / 14);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = '14px JetBrains Mono';
        for (let i = 0; i < drops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            ctx.fillStyle = matrixColors[Math.floor(Math.random() * matrixColors.length)];
            ctx.fillText(char, i * 14, drops[i] * 14);
            if (drops[i] * 14 > height && Math.random() > 0.985) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        requestAnimationFrame(drawMatrix);
    }
    initMatrix();
    drawMatrix();
    window.addEventListener('resize', initMatrix);

    const views = document.querySelectorAll('.view-section');
    const navItems = document.querySelectorAll('.nav-item');
    const quickCards = document.querySelectorAll('.quick-card');
    const logoBtn = document.getElementById('logo');

    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active', 'hidden'));
        navItems.forEach(n => n.classList.remove('active'));
        const target = document.querySelector(`[data-view="${viewId}"]`);
        if (target) target.classList.add('active');
        const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeNav) activeNav.classList.add('active');
        if (viewId !== 'main') playSound(sfxNice);
    }

    navItems.forEach(nav => nav.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(nav.dataset.view);
    }));

    quickCards.forEach(card => card.addEventListener('click', () => {
        switchView(card.dataset.viewTarget);
    }));

    logoBtn.addEventListener('click', () => switchView('main'));

    const typingTextStr = "Initializing system... Protocol: NOXCODE. Status: Online. Ready to optimize.";
    const typingTextEl = document.getElementById('typingText');
    let charIdx = 0;
    function typeWriter() {
        if (charIdx < typingTextStr.length) {
            typingTextEl.textContent += typingTextStr.charAt(charIdx);
            charIdx++;
            setTimeout(typeWriter, 40);
        }
    }
    setTimeout(typeWriter, 500);

    let practices = JSON.parse(localStorage.getItem("nox_practices")) || [];
    const problemInput = document.getElementById('problemName');
    const platformInput = document.getElementById('platform');
    const addBtn = document.getElementById('addPractice');
    const practiceList = document.getElementById('practiceList');
    const doneCountEl = document.getElementById('doneCount');
    const toDoCountEl = document.getElementById('toDoCount');
    const totalCountEl = document.getElementById('totalCount');

    function savePractices() {
        localStorage.setItem("nox_practices", JSON.stringify(practices));
        renderPractices();
        updateStats();
    }

    function updateStats() {
        const total = practices.length;
        const done = practices.filter(p => p.status === 'done').length;
        totalCountEl.textContent = total;
        doneCountEl.textContent = done;
        toDoCountEl.textContent = total - done;
    }

    function renderPractices() {
        practiceList.innerHTML = '';
        if (practices.length === 0) {
            practiceList.innerHTML = '<li style="justify-content: center; opacity: 0.6;">Chưa có dữ liệu. Hãy thêm bài tập mới.</li>';
            return;
        }
        practices.forEach((p, index) => {
            const li = document.createElement('li');
            li.className = `status-${p.status}`;
            li.innerHTML = `
                <div class="practice-details">
                    <span class="problem-name">${p.name}</span>
                    <span class="platform-tag">${p.platform || 'N/A'}</span>
                </div>
                <div class="item-actions">
                    <button class="status-btn">${p.status === 'done' ? 'Hoàn thành' : 'Đang chờ'}</button>
                    <span class="del-btn">✖</span>
                </div>
            `;
            const statusBtn = li.querySelector('.status-btn');
            statusBtn.addEventListener('click', () => {
                p.status = p.status === 'todo' ? 'done' : 'todo';
                savePractices();
                playSound(sfxNice);
            });
            const delBtn = li.querySelector('.del-btn');
            delBtn.addEventListener('click', () => {
                if(confirm('Xóa bài tập này?')) {
                    practices.splice(index, 1);
                    savePractices();
                }
            });
            practiceList.appendChild(li);
        });
    }

    addBtn.addEventListener('click', () => {
        const name = problemInput.value.trim();
        const platform = platformInput.value.trim();
        if (name) {
            practices.unshift({ name, platform, status: 'todo', id: Date.now() });
            problemInput.value = '';
            platformInput.value = '';
            savePractices();
            playSound(sfxNice);
        } else {
            playSound(sfxError);
            problemInput.focus();
        }
    });
    renderPractices();
    updateStats();

    let timerInterval;
    let timeLeft = 25 * 60;
    let totalTime = 25 * 60;
    let isRunning = false;
    let sessionCount = 0;
    const timerEl = document.getElementById('timer');
    const startBtn = document.getElementById('startFocus');
    const stopBtn = document.getElementById('stopFocus');
    const resetBtn = document.getElementById('resetFocus');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const sessionLabel = document.getElementById('sessionTypeLabel');
    const sessionCountEl = document.getElementById('sessionCount');
    const timerProgress = document.getElementById('timerProgress');
    const FULL_DASH_ARRAY = 2 * Math.PI * 140;

    timerProgress.style.strokeDasharray = `${FULL_DASH_ARRAY} ${FULL_DASH_ARRAY}`;

    function updateTimerUI() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
        document.title = isRunning ? `(${m}:${s}) NOXCODE Focus` : 'NOXCODE - Ultimate Productivity';
        const rawOffset = FULL_DASH_ARRAY - (timeLeft / totalTime) * FULL_DASH_ARRAY;
        const offset = Math.min(FULL_DASH_ARRAY, Math.max(0, rawOffset));
        timerProgress.style.strokeDashoffset = offset;
    }

    function switchMode(mode, minutes, btn) {
        if (isRunning) stopTimer();
        timeLeft = totalTime = minutes * 60;
        sessionLabel.textContent = mode === 'pomodoro' ? 'FOCUS SESSION' : 'BREAK TIME';
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateTimerUI();
        resetBtn.classList.add('hidden');
        playSound(sfxNice);
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode, parseInt(btn.dataset.time), btn));
    });

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        sessionLabel.textContent = 'SESSION ACTIVE';
        sessionLabel.style.color = 'var(--neon-green)';
        playSound(sfxNice);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerUI();
            if (timeLeft <= 0) {
                handleTimerComplete();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        sessionLabel.textContent = 'PAUSED';
        sessionLabel.style.color = 'var(--neon-red)';
    }

    function resetTimer() {
        stopTimer();
        const activeModeBtn = document.querySelector('.mode-btn.active');
        timeLeft = totalTime = parseInt(activeModeBtn.dataset.time) * 60;
        updateTimerUI();
        resetBtn.classList.add('hidden');
        sessionLabel.textContent = 'READY';
        sessionLabel.style.color = 'var(--neon-purple)';
        playSound(sfxNice);
    }

    function handleTimerComplete() {
        stopTimer();
        playSound(sfxAlarm);
        const activeMode = document.querySelector('.mode-btn.active').dataset.mode;
        if (activeMode === 'pomodoro') {
            sessionCount++;
            sessionCountEl.textContent = `Phiên hoàn thành: ${sessionCount}`;
            alert("🎉 Hoàn thành phiên làm việc! Hãy nghỉ ngơi chút đi.");
        } else {
            alert("🔔 Hết giờ nghỉ! Quay lại làm việc nào.");
        }
        resetTimer();
    }

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    updateTimerUI();

    const sudokuGridEl = document.getElementById('sudokuGrid9x9');
    const newGameBtn = document.getElementById('newGameBtn');
    const checkGameBtn = document.getElementById('checkGameBtn');
    const sudokuStatus = document.getElementById('sudokuStatus');
    const diffBtns = document.querySelectorAll('.diff-btn');
    let currentDifficulty = 'easy';
    let solutionBoard = [];

    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.diff;
            playSound(sfxNice);
        });
    });

    function isValidPlace(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) return false;
            }
        }
        return true;
    }

    function solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (isValidPlace(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function generateSudoku() {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        solveSudoku(board);
        solutionBoard = JSON.parse(JSON.stringify(board));
        
        let cellsToRemove;
        switch (currentDifficulty) {
            case 'hard': cellsToRemove = 55; break;
            case 'medium': cellsToRemove = 40; break;
            default: cellsToRemove = 25;
        }

        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                cellsToRemove--;
            }
        }
        return board;
    }

    function renderSudoku(board) {
        sudokuGridEl.innerHTML = '';
        sudokuStatus.textContent = ''; sudokuStatus.className = 'status-message';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell-pro';
                if ((j + 1) % 3 === 0 && j < 8) cell.classList.add('thick-right');
                if ((i + 1) % 3 === 0 && i < 8) cell.classList.add('thick-bottom');
                
                if (board[i][j] !== 0) {
                    cell.classList.add('fixed');
                    cell.textContent = board[i][j];
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'sudoku-input';
                    input.maxLength = 1;
                    input.dataset.row = i;
                    input.dataset.col = j;
                    input.addEventListener('input', (e) => {
                        const val = e.target.value;
                        if (!/^[1-9]$/.test(val)) e.target.value = '';
                    });
                    cell.appendChild(input);
                }
                sudokuGridEl.appendChild(cell);
            }
        }
    }

    newGameBtn.addEventListener('click', () => {
        const board = generateSudoku();
        renderSudoku(board);
        playSound(sfxNice);
    });

    checkGameBtn.addEventListener('click', () => {
        const inputs = sudokuGridEl.querySelectorAll('.sudoku-input');
        let isFull = true;
        let isCorrect = true;
        inputs.forEach(input => {
            if (!input.value) isFull = false;
        });

        if (!isFull) {
            sudokuStatus.textContent = 'Vui lòng điền đầy đủ các ô trống!';
            sudokuStatus.className = 'status-message error';
            playSound(sfxError);
            return;
        }

        inputs.forEach(input => {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            if (parseInt(input.value) !== solutionBoard[row][col]) {
                isCorrect = false;
            }
        });

        if (isCorrect) {
            sudokuStatus.textContent = '🎉 CHÍNH XÁC! Bạn là một thiên tài!';
            sudokuStatus.className = 'status-message success';
            playSound(sfxNice);
        } else {
            sudokuStatus.textContent = '❌ Vẫn còn sai sót. Hãy kiểm tra lại!';
            sudokuStatus.className = 'status-message error';
            playSound(sfxError);
        }
    });

    const spinBtn = document.getElementById('spinButton');
    const decisionInput = document.getElementById('decisionInput');
    const finalResult = document.getElementById('finalResult');
    let isSpinning = false;

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        const options = decisionInput.value.split('\n').filter(opt => opt.trim() !== '');
        if (options.length < 2) {
            finalResult.textContent = 'Cần ít nhất 2 lựa chọn!';
            finalResult.style.color = 'var(--neon-red)';
            playSound(sfxError);
            return;
        }

        isSpinning = true;
        spinBtn.disabled = true;
        finalResult.classList.add('thinking');
        finalResult.style.color = 'var(--neon-purple)';
        
        let count = 0;
        const spinInterval = setInterval(() => {
            finalResult.textContent = options[Math.floor(Math.random() * options.length)];
            count++;
            if (count > 20) {
                clearInterval(spinInterval);
                const winner = options[Math.floor(Math.random() * options.length)];
                finalResult.textContent = winner;
                finalResult.classList.remove('thinking');
                finalResult.style.color = 'var(--neon-cyan)';
                finalResult.style.textShadow = '0 0 30px var(--neon-cyan)';
                playSound(sfxNice);
                isSpinning = false;
                spinBtn.disabled = false;
            }
        }, 100);
    });
});
