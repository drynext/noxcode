document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("matrix-bg");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "10";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 50);
    
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const navBtns = document.querySelectorAll(".nav-btn");
    const panels = document.querySelectorAll(".panel");

    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            navBtns.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(btn.dataset.target).classList.add("active");
        });
    });

    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("btn-add-task");
    const taskList = document.getElementById("task-list");
    const statDone = document.getElementById("stat-done");
    const statPending = document.getElementById("stat-pending");

    function updateStats() {
        const total = taskList.children.length;
        const done = document.querySelectorAll("#task-list li.done").length;
        statDone.textContent = done;
        statPending.textContent = total - done;
    }

    addTaskBtn.addEventListener("click", () => {
        const txt = taskInput.value.trim();
        if (txt) {
            const li = document.createElement("li");
            li.innerHTML = `<span>${txt}</span> <span style="cursor:pointer; color:#555;">[X]</span>`;
            
            li.addEventListener("click", (e) => {
                if(e.target.tagName !== 'SPAN' || e.target.innerText !== '[X]') {
                    li.classList.toggle("done");
                    updateStats();
                }
            });

            li.querySelector("span:last-child").addEventListener("click", () => {
                li.remove();
                updateStats();
            });

            taskList.appendChild(li);
            taskInput.value = "";
            updateStats();
        }
    });

    let timerInterval;
    let timeLeft = 1500; 
    let isRunning = false;
    const timeDisplay = document.getElementById("time-display");
    const circleProgress = document.getElementById("timer-path");
    const btnStart = document.getElementById("btn-start-focus");
    const btnPause = document.getElementById("btn-pause-focus");
    const btnReset = document.getElementById("btn-reset-focus");
    const statFocus = document.getElementById("stat-focus");
    let totalFocusMinutes = 0;

    const fullDash = 283; 

    function formatTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    }

    function setCircle(time) {
        const fraction = time / 1500;
        const offset = fullDash - (fraction * fullDash);
        circleProgress.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            btnStart.style.display = "none";
            btnPause.style.display = "inline-block";
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    timeDisplay.textContent = formatTime(timeLeft);
                    setCircle(timeLeft);
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    totalFocusMinutes += 25;
                    statFocus.textContent = totalFocusMinutes + "m";
                    alert("Focus session completed!");
                    resetTimer();
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        btnStart.style.display = "inline-block";
        btnPause.style.display = "none";
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = 1500;
        timeDisplay.textContent = "25:00";
        circleProgress.style.strokeDashoffset = 0;
    }

    btnStart.addEventListener("click", startTimer);
    btnPause.addEventListener("click", pauseTimer);
    btnReset.addEventListener("click", resetTimer);

    const sudokuBoard = document.getElementById("sudoku-board");
    const diffBtns = document.querySelectorAll(".diff-btn");
    let currentLevel = 'easy';

    diffBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            diffBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentLevel = btn.dataset.level;
        });
    });

    function isValid(board, row, col, num) {
        for (let x = 0; x < 9; x++) if (board[row][x] === num || board[x][col] === num) return false;
        const startRow = row - row % 3, startCol = col - col % 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (board[i + startRow][j + startCol] === num) return false;
        return true;
    }

    function solve(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (isValid(board, r, c, num)) {
                            board[r][c] = num;
                            if (solve(board)) return true;
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function generateSudoku() {
        let board = Array.from({length: 9}, () => Array(9).fill(0));
        solve(board);
        
        let attempts = currentLevel === 'easy' ? 30 : currentLevel === 'medium' ? 45 : 55;
        while (attempts > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (board[r][c] !== 0) {
                board[r][c] = 0;
                attempts--;
            }
        }
        renderBoard(board);
    }

    function renderBoard(board) {
        sudokuBoard.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const div = document.createElement("div");
                div.classList.add("cell");
                if ((i + 1) % 3 === 0 && i < 8) div.classList.add("cell-row-3");
                
                if (board[i][j] !== 0) {
                    div.textContent = board[i][j];
                    div.style.fontWeight = "bold";
                    div.dataset.val = board[i][j];
                } else {
                    const inp = document.createElement("input");
                    inp.type = "text";
                    inp.maxLength = 1;
                    inp.addEventListener("input", function() {
                        this.value = this.value.replace(/[^1-9]/g, "");
                    });
                    div.appendChild(inp);
                }
                sudokuBoard.appendChild(div);
            }
        }
    }

    document.getElementById("btn-new-game").addEventListener("click", generateSudoku);
    
    document.getElementById("btn-check-sudoku").addEventListener("click", () => {
        alert("Tính năng check đang được cập nhật bởi Operator!");
    });

    generateSudoku(); 

    const decideInput = document.getElementById("decide-input");
    const spinBtn = document.getElementById("btn-spin");
    const resultDisplay = document.getElementById("decide-result");

    spinBtn.addEventListener("click", () => {
        const lines = decideInput.value.split("\n").filter(line => line.trim() !== "");
        if (lines.length < 2) {
            resultDisplay.textContent = "Nhập ít nhất 2 lựa chọn!";
            return;
        }
        
        let counter = 0;
        const interval = setInterval(() => {
            resultDisplay.textContent = lines[Math.floor(Math.random() * lines.length)];
            counter++;
            if (counter > 20) {
                clearInterval(interval);
                resultDisplay.style.color = "#00ff41";
            }
        }, 100);
    });
});
