document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('[data-view]');
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const cardLinks = document.querySelectorAll('.card');
    const mainContainer = document.querySelector('.main');
    const logoCenter = document.getElementById('logoCenter');
    
    function showView(viewName) {
        views.forEach(view => {
            view.classList.add('hidden');
        });
        const targetView = document.querySelector(`[data-view="${viewName}"]`);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
    }
    
    function handleNavigation(event) {
        event.preventDefault();
        const viewName = event.currentTarget.getAttribute('data-view') || event.currentTarget.getAttribute('data-view-target');
        if (viewName) {
            showView(viewName);
        }
    }
    
    navLinks.forEach(link => link.addEventListener('click', handleNavigation));
    cardLinks.forEach(card => card.addEventListener('click', handleNavigation));
    logoCenter.addEventListener('click', () => showView('main'));

    showView('main');
    
    let currentView = 'main';
    
    const typingTextElement = document.getElementById('typingText');
    const fullText = typingTextElement.textContent;
    let charIndex = 0;
    typingTextElement.textContent = '';

    function typeWriter() {
        if (charIndex < fullText.length) {
            typingTextElement.textContent += fullText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 50);
        }
    }
    
    typeWriter();

    function setupMatrixBackground() {
        const canvas = document.getElementById('matrixBackground');
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const columns = Math.floor(width / 20);
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        const matrixChars = '01';

        function drawMatrix() {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#00ff41';
            ctx.font = '20px JetBrains Mono';
            
            for (let i = 0; i < drops.length; i++) {
                const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);
                
                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            drops.length = Math.floor(width / 20);
            for (let i = 0; i < drops.length; i++) {
                if (drops[i] === undefined) drops[i] = 1;
            }
        });
        
        setInterval(drawMatrix, 35);
    }
    
    setupMatrixBackground();

    const problemNameInput = document.getElementById('problemName');
    const platformInput = document.getElementById('platform');
    const addPracticeButton = document.getElementById('addPractice');
    const practiceList = document.getElementById('practiceList');
    const doneCountSpan = document.getElementById('doneCount');
    const totalCountSpan = document.getElementById('totalCount');
    const toDoCountSpan = document.getElementById('toDoCount');
    
    let practiceData = JSON.parse(localStorage.getItem('practiceData')) || [];
    
    function updateCounts() {
        const total = practiceData.length;
        const done = practiceData.filter(item => item.status === 'done').length;
        const todo = total - done;
        
        doneCountSpan.textContent = done;
        totalCountSpan.textContent = total;
        toDoCountSpan.textContent = todo;
    }
    
    function saveAndRender() {
        localStorage.setItem('practiceData', JSON.stringify(practiceData));
        renderPracticeList();
        updateCounts();
    }
    
    function renderPracticeList() {
        practiceList.innerHTML = '';
        practiceData.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = item.status === 'done' ? 'status-done' : 'status-todo';
            listItem.innerHTML = `
                <div class="practice-details">
                    <span class="problem-name">${item.name}</span>
                    <span class="platform-tag">${item.platform || 'General'}</span>
                </div>
                <div>
                    <span class="status-toggle" data-index="${index}">
                        ${item.status === 'done' ? 'Done' : 'To Do'}
                    </span>
                    <span class="delete-btn" data-index="${index}">✖</span>
                </div>
            `;
            practiceList.appendChild(listItem);
        });
    }
    
    addPracticeButton.addEventListener('click', () => {
        const name = problemNameInput.value.trim();
        const platform = platformInput.value.trim();
        if (name) {
            practiceData.push({
                name: name,
                platform: platform,
                status: 'todo',
                id: Date.now()
            });
            problemNameInput.value = '';
            platformInput.value = '';
            saveAndRender();
        }
    });
    
    practiceList.addEventListener('click', (event) => {
        const target = event.target;
        const index = parseInt(target.getAttribute('data-index'));
        
        if (target.classList.contains('status-toggle')) {
            practiceData[index].status = practiceData[index].status === 'done' ? 'todo' : 'done';
            saveAndRender();
        } else if (target.classList.contains('delete-btn')) {
            practiceData.splice(index, 1);
            saveAndRender();
        }
    });
    
    updateCounts();
    renderPracticeList();

    const timerDisplay = document.getElementById('timer');
    const startFocusButton = document.getElementById('startFocus');
    const stopFocusButton = document.getElementById('stopFocus');
    const resetFocusButton = document.getElementById('resetFocus');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const timerProgress = document.getElementById('timerProgress');
    const sessionInfo = document.getElementById('sessionInfo');
    const alarmSound = document.getElementById('alarmSound');
    
    const CIRCUMFERENCE = 2 * Math.PI * 45;
    timerProgress.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    timerProgress.style.strokeDashoffset = CIRCUMFERENCE;

    let countdown;
    let timeRemaining = 25 * 60;
    let isRunning = false;
    let totalTime = 25 * 60;
    let pomodoroCount = 0;
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const offset = CIRCUMFERENCE - (timeRemaining / totalTime) * CIRCUMFERENCE;
        timerProgress.style.strokeDashoffset = offset;
    }
    
    function setMode(minutes) {
        clearInterval(countdown);
        isRunning = false;
        totalTime = minutes * 60;
        timeRemaining = totalTime;
        updateTimerDisplay();
        startFocusButton.classList.remove('hidden');
        stopFocusButton.classList.add('hidden');
        modeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.mode-btn[data-time="${minutes}"]`).classList.add('active');
    }
    
    modeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const minutes = parseInt(e.target.getAttribute('data-time'));
            setMode(minutes);
        });
    });
    
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startFocusButton.classList.add('hidden');
        stopFocusButton.classList.remove('hidden');
        
        countdown = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                clearInterval(countdown);
                isRunning = false;
                alarmSound.play();
                
                const currentMode = document.querySelector('.mode-btn.active').id;
                
                if (currentMode === 'pomodoroMode') {
                    pomodoroCount++;
                    sessionInfo.textContent = `Pomodoro: ${pomodoroCount} - Nghỉ ngắn?`;
                    setMode(5);
                    document.getElementById('shortBreakMode').click();
                } else if (currentMode === 'shortBreakMode') {
                    sessionInfo.textContent = `Pomodoro: ${pomodoroCount} - Quay lại tập trung?`;
                    setMode(25);
                    document.getElementById('pomodoroMode').click();
                } else if (currentMode === 'longBreakMode') {
                    sessionInfo.textContent = `Pomodoro: ${pomodoroCount} - Hoàn thành phiên!`;
                    setMode(25);
                    document.getElementById('pomodoroMode').click();
                }
            }
        }, 1000);
    }
    
    function stopTimer() {
        clearInterval(countdown);
        isRunning = false;
        startFocusButton.classList.remove('hidden');
        stopFocusButton.classList.add('hidden');
    }
    
    function resetTimer() {
        stopTimer();
        const activeTime = parseInt(document.querySelector('.mode-btn.active').getAttribute('data-time'));
        setMode(activeTime);
    }
    
    startFocusButton.addEventListener('click', startTimer);
    stopFocusButton.addEventListener('click', stopTimer);
    resetFocusButton.addEventListener('click', resetTimer);
    
    setMode(25);

    const sudokuGrid = document.getElementById('sudokuGrid');
    const newSudokuButton = document.getElementById('newSudoku');
    const checkSudokuButton = document.getElementById('checkSudoku');
    const sudokuMessage = document.getElementById('sudokuMessage');
    
    const SIZE = 9;
    
    function createEmptyGrid() {
        return Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
    }
    
    function generateSudokuBoard() {
        const board = createEmptyGrid();
        
        const presetBoard = [
            [5,3,4,6,7,8,9,1,2],
            [6,7,2,1,9,5,3,4,8],
            [1,9,8,3,4,2,5,6,7],
            [8,5,9,7,6,1,4,2,3],
            [4,2,6,8,5,3,7,9,1],
            [7,1,3,9,2,4,8,5,6],
            [9,6,1,5,3,7,2,8,4],
            [2,8,7,4,1,9,6,3,5],
            [3,4,5,2,8,6,1,7,9]
        ];
        
        let difficulty = 40;
        
        for(let i=0; i<SIZE; i++) {
            for(let j=0; j<SIZE; j++) {
                board[i][j] = presetBoard[i][j];
            }
        }

        let cellsRemoved = 0;
        while(cellsRemoved < difficulty) {
            const row = Math.floor(Math.random() * SIZE);
            const col = Math.floor(Math.random() * SIZE);
            
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                cellsRemoved++;
            }
        }
        return board;
    }

    function renderSudoku(board) {
        sudokuGrid.innerHTML = '';
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                
                if ((j + 1) % 3 === 0 && j !== SIZE - 1) {
                    cell.classList.add('block-border-right');
                }
                if ((i + 1) % 3 === 0 && i !== SIZE - 1) {
                    cell.classList.add('block-border-bottom');
                }
                
                const value = board[i][j];
                
                if (value !== 0) {
                    cell.classList.add('fixed');
                    cell.textContent = value;
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '1';
                    input.max = '9';
                    input.maxLength = '1';
                    input.setAttribute('data-row', i);
                    input.setAttribute('data-col', j);

                    input.addEventListener('input', function() {
                        if (this.value.length > 1) {
                            this.value = this.value.slice(0, 1);
                        }
                        const num = parseInt(this.value);
                        if (isNaN(num) || num < 1 || num > 9) {
                            this.value = '';
                        }
                    });
                    
                    cell.appendChild(input);
                }
                sudokuGrid.appendChild(cell);
            }
        }
    }

    function checkValidity(board) {
        function checkSet(set) {
            const seen = new Set();
            for (const val of set) {
                if (val !== 0) {
                    if (seen.has(val)) return false;
                    seen.add(val);
                }
            }
            return true;
        }

        for (let i = 0; i < SIZE; i++) {
            if (!checkSet(board[i])) return false;
            if (!checkSet(board.map(row => row[i]))) return false;
        }

        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        box.push(board[boxRow * 3 + i][boxCol * 3 + j]);
                    }
                }
                if (!checkSet(box)) return false;
            }
        }

        return true;
    }

    function getBoardState() {
        const board = createEmptyGrid();
        const cells = sudokuGrid.querySelectorAll('.sudoku-cell');
        let index = 0;
        cells.forEach(cell => {
            const row = Math.floor(index / SIZE);
            const col = index % SIZE;
            
            if (cell.classList.contains('fixed')) {
                board[row][col] = parseInt(cell.textContent);
            } else {
                const input = cell.querySelector('input');
                board[row][col] = input && input.value ? parseInt(input.value) : 0;
            }
            index++;
        });
        return board;
    }

    newSudokuButton.addEventListener('click', () => {
        const newBoard = generateSudokuBoard();
        renderSudoku(newBoard);
        sudokuMessage.textContent = 'Bảng Sudoku mới đã được tạo.';
        sudokuMessage.classList.remove('success', 'error');
    });

    checkSudokuButton.addEventListener('click', () => {
        const currentBoard = getBoardState();
        
        const isCompleted = currentBoard.every(row => row.every(val => val !== 0));
        
        if (!isCompleted) {
            sudokuMessage.textContent = 'Bạn cần điền đủ tất cả các ô.';
            sudokuMessage.classList.add('error');
            sudokuMessage.classList.remove('success');
            return;
        }

        if (checkValidity(currentBoard)) {
            sudokuMessage.textContent = '🎉 Tuyệt vời! Bạn đã giải đúng!';
            sudokuMessage.classList.add('success');
            sudokuMessage.classList.remove('error');
        } else {
            sudokuMessage.textContent = 'Sai rồi. Vui lòng kiểm tra lại các quy tắc.';
            sudokuMessage.classList.add('error');
            sudokuMessage.classList.remove('success');
        }
    });

    renderSudoku(generateSudokuBoard());

    const decisionOptionsTextarea = document.getElementById('decisionOptions');
    const spinDecideButton = document.getElementById('spinDecide');
    const finalDecisionDisplay = document.getElementById('finalDecision');

    function animateDecision(options, duration = 3000) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime < duration) {
                const randomIndex = Math.floor(Math.random() * options.length);
                finalDecisionDisplay.textContent = options[randomIndex];
            } else {
                clearInterval(interval);
                const finalIndex = Math.floor(Math.random() * options.length);
                finalDecisionDisplay.textContent = options[finalIndex];
            }
        }, 100);
    }

    spinDecideButton.addEventListener('click', () => {
        const options = decisionOptionsTextarea.value.split('\n')
            .map(option => option.trim())
            .filter(option => option !== '');
        
        if (options.length < 2) {
            finalDecisionDisplay.textContent = 'Nhập ít nhất 2 lựa chọn.';
            return;
        }
        
        finalDecisionDisplay.textContent = '...Đang quay...';
        animateDecision(options);
    });

});
