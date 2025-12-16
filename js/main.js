document.addEventListener("DOMContentLoaded", () => {
    const logo = document.getElementById("logo");
    const typingElement = document.getElementById("typingText");
    const mainView = document.querySelector(".main[data-view='main']");
    const allModules = document.querySelectorAll(".module");
    const cardTargets = document.querySelectorAll("[data-view-target]");

    const problemInput = document.getElementById("problemName");
    const platformInput = document.getElementById("platform");
    const addBtn = document.getElementById("addPractice");
    const list = document.getElementById("practiceList");
    const doneCountEl = document.getElementById("doneCount");
    const totalCountEl = document.getElementById("totalCount");
    const toDoCountEl = document.getElementById("toDoCount");

    const timerDisplay = document.getElementById("timer");
    const startBtn = document.getElementById("startFocus");
    const stopBtn = document.getElementById("stopFocus");
    const resetBtn = document.getElementById("resetFocus");
    const progressEl = document.getElementById("progress");
    const sessionTypeEl = document.getElementById("sessionType");
    const alarmSound = document.getElementById("alarmSound");
    const pomodoroModeBtn = document.getElementById("pomodoroMode");
    const shortBreakModeBtn = document.getElementById("shortBreakMode");
    const longBreakModeBtn = document.getElementById("longBreakMode");
    const modeButtons = document.querySelectorAll(".mode-buttons button");

    const sudokuGridEl = document.getElementById("sudokuGrid");
    const newSudokuBtn = document.getElementById("newSudoku");
    const checkSudokuBtn = document.getElementById("checkSudoku");
    const sudokuMessageEl = document.getElementById("sudokuMessage");

    const decisionOptionsTextarea = document.getElementById("decisionOptions");
    const spinDecideBtn = document.getElementById("spinDecide");
    const finalDecisionEl = document.getElementById("finalDecision");

    let practices = JSON.parse(localStorage.getItem("noxcode_practices")) || [];
    
    const WORK_TIME = 25 * 60;
    const SHORT_BREAK = 5 * 60;
    const LONG_BREAK = 15 * 60;
    let focusTime = WORK_TIME;
    let initialFocusTime = WORK_TIME;
    let focusInterval = null;
    let currentMode = 'pomodoro';

    let sudokuBoard = [];
    const SUDOKU_SIZE = 4;

    function startTyping() {
        const typingText = "Code in the dark. Track in silence. Achieve mastery.";
        typingElement.textContent = "";
        let index = 0;
        const typingSpeed = 70;
        function type() {
            if (index < typingText.length) {
                typingElement.textContent += typingText.charAt(index);
                index++;
                setTimeout(type, typingSpeed);
            }
        }
        type();
    }

    function switchView(viewName) {
        mainView.classList.add("hidden");
        allModules.forEach(mod => mod.classList.add("hidden"));

        if (viewName === 'main') {
            mainView.classList.remove("hidden");
            startTyping();
        } else {
            const targetModule = document.querySelector(`.module[data-view='${viewName}']`);
            if (targetModule) {
                targetModule.classList.remove("hidden");
            }
        }
        
        document.querySelectorAll('.sidebar nav a').forEach(a => {
            if (a.getAttribute('data-view') === viewName) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });

        if (viewName === 'sudoku') {
            if (sudokuBoard.length === 0) generateSudoku();
            renderSudoku();
        }

        localStorage.setItem("noxcode_view", viewName);
    }

    logo.addEventListener("click", () => switchView('main'));
    document.querySelectorAll('[data-view]').forEach(el => {
        if (el.tagName === 'A') {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                switchView(el.getAttribute('data-view'));
            });
        }
    });
    cardTargets.forEach(card => {
        card.addEventListener("click", () => {
            const viewTarget = card.getAttribute("data-view-target");
            switchView(viewTarget);
        });
    });

    const initialView = localStorage.getItem("noxcode_view") || 'main';
    switchView(initialView);

    function savePractices() {
        localStorage.setItem("noxcode_practices", JSON.stringify(practices));
        renderPractices();
    }

    function renderPractices() {
        list.innerHTML = "";
        const doneCount = practices.filter(p => p.status === 'done').length;
        const totalCount = practices.length;
        const toDoCount = totalCount - doneCount;

        doneCountEl.textContent = doneCount;
        totalCountEl.textContent = totalCount;
        toDoCountEl.textContent = toDoCount;

        practices.forEach((p, index) => {
            const li = document.createElement("li");
            li.classList.add(p.status === 'done' ? 'status-done' : 'status-todo');

            const details = document.createElement("div");
            details.classList.add('practice-details');
            details.innerHTML = `
                <span class="problem-name">${p.problem}</span>
                <span class="platform-tag">Platform: ${p.platform}</span>
            `;
            li.appendChild(details);

            const controls = document.createElement("div");
            controls.classList.add('practice-controls');

            const statusToggle = document.createElement("span");
            statusToggle.classList.add("status-toggle");
            statusToggle.textContent = p.status === 'done' ? '✅ DONE' : '➡️ TO DO';
            statusToggle.title = `Click để chuyển thành ${p.status === 'done' ? 'TO DO' : 'DONE'}`;
            statusToggle.onclick = () => {
                p.status = (p.status === 'todo' ? 'done' : 'todo');
                savePractices();
            };
            controls.appendChild(statusToggle);

            const del = document.createElement("span");
            del.classList.add("delete-btn");
            del.textContent = "✖";
            del.title = "Xóa bài tập";
            del.onclick = () => {
                practices.splice(index, 1);
                savePractices();
            };
            controls.appendChild(del);
            
            li.appendChild(controls);
            list.appendChild(li);
        });
    }

    addBtn.addEventListener("click", () => {
        const problem = problemInput.value.trim();
        const platform = platformInput.value.trim().toUpperCase();
        
        if (problem.length < 3 || platform.length < 1) {
            alert("Vui lòng nhập Tên bài và Platform hợp lệ.");
            return;
        }

        practices.unshift({
            id: Date.now(),
            problem: problem,
            platform: platform,
            status: 'todo'
        });
        
        savePractices();
        problemInput.value = "";
        platformInput.value = "";
    });

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        document.title = `${m}:${s} | NOXCODE`;
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(focusTime);
    }

    function updateProgress() {
        const percent = ((initialFocusTime - focusTime) / initialFocusTime) * 100;
        progressEl.style.width = percent + "%";
    }

    function selectMode(mode) {
        stopFocusTimer(false);
        modeButtons.forEach(btn => btn.classList.remove('active'));

        switch(mode) {
            case 'pomodoro':
                initialFocusTime = WORK_TIME;
                sessionTypeEl.textContent = '25 phút';
                pomodoroModeBtn.classList.add('active');
                break;
            case 'shortBreak':
                initialFocusTime = SHORT_BREAK;
                sessionTypeEl.textContent = '5 phút nghỉ ngắn';
                shortBreakModeBtn.classList.add('active');
                break;
            case 'longBreak':
                initialFocusTime = LONG_BREAK;
                sessionTypeEl.textContent = '15 phút nghỉ dài';
                longBreakModeBtn.classList.add('active');
                break;
        }
        currentMode = mode;
        focusTime = initialFocusTime;
        updateTimerDisplay();
        updateProgress();
    }

    pomodoroModeBtn.addEventListener('click', () => selectMode('pomodoro'));
    shortBreakModeBtn.addEventListener('click', () => selectMode('shortBreak'));
    longBreakModeBtn.addEventListener('click', () => selectMode('longBreak'));

    function startFocusTimer() {
        if (focusInterval || focusTime <= 0) return;
        
        startBtn.textContent = '⏸ Tạm dừng';
        startBtn.removeEventListener('click', startFocusTimer);
        startBtn.addEventListener('click', stopFocusTimer);

        focusInterval = setInterval(() => {
            if (focusTime > 0) {
                focusTime--;
                updateTimerDisplay();
                updateProgress();
            } else {
                clearInterval(focusInterval);
                focusInterval = null;
                if (alarmSound) alarmSound.play();
                
                let nextMode = 'pomodoro';
                if (currentMode === 'pomodoro') {
                    nextMode = 'shortBreak';
                    alert("Hoàn thành 1 phiên Focus! Hãy nghỉ 5 phút.");
                } else {
                    alert("Hết giờ nghỉ! Quay lại làm việc nào.");
                }
                selectMode(nextMode);
            }
        }, 1000);
    }

    function stopFocusTimer(isPause = true) {
        clearInterval(focusInterval);
        focusInterval = null;

        if (isPause) {
            startBtn.textContent = '▶ Tiếp tục';
            startBtn.removeEventListener('click', stopFocusTimer);
            startBtn.addEventListener('click', startFocusTimer);
        }
    }

    function resetFocusTimer() {
        stopFocusTimer(false);
        focusTime = initialFocusTime;
        updateTimerDisplay();
        updateProgress();

        startBtn.textContent = '▶ Bắt đầu';
        startBtn.removeEventListener('click', stopFocusTimer);
        startBtn.addEventListener('click', startFocusTimer);
    }

    startBtn.addEventListener("click", startFocusTimer);
    stopBtn.addEventListener("click", () => stopFocusTimer(true));
    resetBtn.addEventListener("click", resetFocusTimer);


    function generateSudoku() {
        sudokuBoard = [
            [2, 3, 1, 4],
            [1, 4, 2, 3],
            [3, 2, 4, 1],
            [4, 1, 3, 2]
        ];

        let puzzle = JSON.parse(JSON.stringify(sudokuBoard));

        for (let i = 0; i < SUDOKU_SIZE; i++) {
            for (let j = 0; j < SUDOKU_SIZE; j++) {
                if (Math.random() > 0.5) {
                    puzzle[i][j] = 0;
                }
            }
        }
        sudokuBoard = puzzle;
        sudokuMessageEl.textContent = 'Điền các ô trống.';
        sudokuMessageEl.classList.remove('error', 'success');
    }

    function renderSudoku() {
        sudokuGridEl.innerHTML = '';
        for (let i = 0; i < SUDOKU_SIZE; i++) {
            for (let j = 0; j < SUDOKU_SIZE; j++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                
                const isFixed = sudokuBoard[i][j] !== 0;
                
                if (isFixed) {
                    cell.textContent = sudokuBoard[i][j];
                    cell.classList.add('fixed');
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = 1;
                    input.max = 4;
                    input.maxLength = 1;
                    input.value = '';
                    input.setAttribute('data-row', i);
                    input.setAttribute('data-col', j);
                    
                    input.oninput = (e) => {
                        let val = e.target.value.slice(-1);
                        if (val < 1 || val > 4) val = '';
                        e.target.value = val;
                    };
                    cell.appendChild(input);
                }

                if ((j + 1) % 2 === 0 && j !== SUDOKU_SIZE - 1) cell.classList.add('block-border-right');
                if ((i + 1) % 2 === 0 && i !== SUDOKU_SIZE - 1) cell.classList.add('block-border-bottom');
                
                sudokuGridEl.appendChild(cell);
            }
        }
    }

    function checkSudoku() {
        let currentBoard = [];
        const inputs = sudokuGridEl.querySelectorAll('input');
        let k = 0;
        for (let i = 0; i < SUDOKU_SIZE; i++) {
            currentBoard[i] = [];
            for (let j = 0; j < SUDOKU_SIZE; j++) {
                if (sudokuBoard[i][j] !== 0) {
                    currentBoard[i][j] = sudokuBoard[i][j];
                } else {
                    const val = parseInt(inputs[k].value) || 0;
                    currentBoard[i][j] = val;
                    k++;
                }
            }
        }

        const isValid = (board) => {
            const checkSet = (arr) => {
                const nonZero = arr.filter(n => n !== 0);
                return new Set(nonZero).size === nonZero.length;
            };

            for (let i = 0; i < SUDOKU_SIZE; i++) {
                if (!checkSet(board[i])) return false;
            }
            
            for (let j = 0; j < SUDOKU_SIZE; j++) {
                const col = [];
                for (let i = 0; i < SUDOKU_SIZE; i++) col.push(board[i][j]);
                if (!checkSet(col)) return false;
            }
            
            for (let blockRow = 0; blockRow < SUDOKU_SIZE / 2; blockRow++) {
                for (let blockCol = 0; blockCol < SUDOKU_SIZE / 2; blockCol++) {
                    const block = [];
                    for (let i = blockRow * 2; i < blockRow * 2 + 2; i++) {
                        for (let j = blockCol * 2; j < blockCol * 2 + 2; j++) {
                            block.push(board[i][j]);
                        }
                    }
                    if (!checkSet(block)) return false;
                }
            }

            const isFilled = board.flat().every(val => val !== 0);
            if (!isFilled) return 'Incomplete';
            
            return true;
        };

        const result = isValid(currentBoard);

        if (result === 'Incomplete') {
            sudokuMessageEl.textContent = 'Chưa điền hết các ô.';
            sudokuMessageEl.classList.remove('success');
            sudokuMessageEl.classList.add('error');
        } else if (result) {
            sudokuMessageEl.textContent = '🎉 Chính xác! Bạn là bậc thầy Sudoku!';
            sudokuMessageEl.classList.remove('error');
            sudokuMessageEl.classList.add('success');
        } else {
            sudokuMessageEl.textContent = '❌ Sai rồi, thử lại xem.';
            sudokuMessageEl.classList.remove('success');
            sudokuMessageEl.classList.add('error');
        }
    }

    newSudokuBtn.addEventListener('click', generateSudoku);
    checkSudokuBtn.addEventListener('click', checkSudoku);


    function spinDecide() {
        const optionsText = decisionOptionsTextarea.value.trim();
        if (!optionsText) {
            finalDecisionEl.textContent = 'Vui lòng nhập các lựa chọn.';
            finalDecisionEl.style.color = '#ef4444';
            return;
        }

        const options = optionsText.split('\n').map(o => o.trim()).filter(o => o.length > 0);
        
        if (options.length < 2) {
            finalDecisionEl.textContent = 'Cần ít nhất 2 lựa chọn.';
            finalDecisionEl.style.color = '#ef4444';
            return;
        }

        finalDecisionEl.textContent = 'Đang quay...';
        finalDecisionEl.style.color = '#94a3b8';
        spinDecideBtn.disabled = true;

        let spinCount = 0;
        const totalSpins = 20;
        const intervalDuration = 100;
        let lastIndex = -1;

        const spinInterval = setInterval(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * options.length);
            } while (newIndex === lastIndex && options.length > 1);
            lastIndex = newIndex;
            
            finalDecisionEl.textContent = options[newIndex];
            spinCount++;

            if (spinCount >= totalSpins) {
                clearInterval(spinInterval);
                const finalIndex = Math.floor(Math.random() * options.length);
                setTimeout(() => {
                    finalDecisionEl.textContent = options[finalIndex];
                    finalDecisionEl.style.color = '#67e8f9';
                    spinDecideBtn.disabled = false;
                }, 500);
            }
        }, intervalDuration);
    }

    spinDecideBtn.addEventListener('click', spinDecide);

    renderPractices();
    updateTimerDisplay();
    updateProgress();
});
