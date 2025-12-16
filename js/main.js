const Router = {
    init: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.target;
                Router.navigate(target);
            });
        });
        
        const text = "Initializing core modules... System Ready.";
        const el = document.getElementById('typingEffect');
        el.textContent = '';
        let i = 0;
        const type = () => {
            if(i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, 30);
            }
        };
        setTimeout(type, 500);
        
        Matrix.init();
        Tracker.init();
        Focus.init();
        Sudoku.init();
        Decide.init();
    },

    navigate: (viewId) => {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        const targetView = document.getElementById(`view-${viewId}`);
        const targetBtn = document.querySelector(`.nav-btn[data-target="${viewId}"]`);
        
        if(targetView) targetView.classList.add('active');
        if(targetBtn) targetBtn.classList.add('active');
    }
};

window.router = Router.navigate;

const Matrix = {
    init: () => {
        const canvas = document.getElementById('matrixCanvas');
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        const chars = "01";
        const fontSize = 14;
        const columns = width / fontSize;
        const drops = [];
        
        for(let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            
            for(let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        setInterval(draw, 33);
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    }
};

// --- TRACKER MODULE ---
const Tracker = {
    data: JSON.parse(localStorage.getItem('nox_tracker')) || [],
    
    init: () => {
        document.getElementById('btnAddTrack').addEventListener('click', Tracker.add);
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Tracker.render(btn.dataset.filter);
            });
        });
        
        Tracker.render();
        Tracker.updateStats();
    },
    
    add: () => {
        const nameEl = document.getElementById('trackName');
        const platEl = document.getElementById('trackPlatform');
        
        if(!nameEl.value.trim()) return;
        
        Tracker.data.unshift({
            id: Date.now(),
            name: nameEl.value,
            platform: platEl.value || 'General',
            status: 'todo'
        });
        
        nameEl.value = '';
        platEl.value = '';
        Tracker.save();
    },
    
    toggle: (id) => {
        const item = Tracker.data.find(x => x.id === id);
        if(item) {
            item.status = item.status === 'todo' ? 'done' : 'todo';
            Tracker.save();
        }
    },
    
    remove: (id) => {
        Tracker.data = Tracker.data.filter(x => x.id !== id);
        Tracker.save();
    },
    
    save: () => {
        localStorage.setItem('nox_tracker', JSON.stringify(Tracker.data));
        Tracker.render();
        Tracker.updateStats();
    },
    
    render: (filter = 'all') => {
        const list = document.getElementById('trackerList');
        list.innerHTML = '';
        
        const filteredData = Tracker.data.filter(item => {
            if(filter === 'all') return true;
            return item.status === filter;
        });
        
        filteredData.forEach(item => {
            const li = document.createElement('li');
            li.className = 'track-item';
            li.innerHTML = `
                <span class="status-badge ${item.status}">${item.status.toUpperCase()}</span>
                <span class="item-title">${item.name}</span>
                <span class="item-platform">${item.platform}</span>
                <div class="item-actions">
                    <button class="btn-check" onclick="Tracker.toggle(${item.id})">✓</button>
                    <button class="btn-del" onclick="Tracker.remove(${item.id})">×</button>
                </div>
            `;
            list.appendChild(li);
        });
    },
    
    updateStats: () => {
        const done = Tracker.data.filter(x => x.status === 'done').length;
        const total = Tracker.data.length;
        document.getElementById('statDone').innerText = done;
        document.getElementById('statPending').innerText = total - done;
    }
};

// --- FOCUS MODULE ---
const Focus = {
    timer: null,
    timeLeft: 1500,
    totalTime: 1500,
    isRunning: false,
    
    init: () => {
        document.getElementById('btnTimerStart').addEventListener('click', Focus.start);
        document.getElementById('btnTimerStop').addEventListener('click', Focus.stop);
        document.getElementById('btnTimerReset').addEventListener('click', Focus.reset);
        
        document.querySelectorAll('.mode-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Focus.setTime(parseInt(btn.dataset.time) * 60, btn.dataset.mode);
            });
        });
    },
    
    setTime: (seconds, mode) => {
        Focus.stop();
        Focus.totalTime = seconds;
        Focus.timeLeft = seconds;
        document.getElementById('timerLabel').innerText = mode === 'pomodoro' ? 'FOCUS MODE' : 'RECOVERY MODE';
        Focus.updateDisplay();
    },
    
    updateDisplay: () => {
        const m = Math.floor(Focus.timeLeft / 60).toString().padStart(2, '0');
        const s = (Focus.timeLeft % 60).toString().padStart(2, '0');
        document.getElementById('timerValue').innerText = `${m}:${s}`;
        
        const circle = document.getElementById('timerBar');
        const circumference = 2 * Math.PI * 170;
        const offset = circumference - (Focus.timeLeft / Focus.totalTime) * circumference;
        circle.style.strokeDashoffset = offset;
    },
    
    start: () => {
        if(Focus.isRunning) return;
        Focus.isRunning = true;
        document.getElementById('btnTimerStart').classList.add('hidden');
        document.getElementById('btnTimerStop').classList.remove('hidden');
        
        Focus.timer = setInterval(() => {
            Focus.timeLeft--;
            Focus.updateDisplay();
            if(Focus.timeLeft <= 0) {
                Focus.stop();
                alert("SESSION COMPLETE");
                Focus.reset();
            }
        }, 1000);
    },
    
    stop: () => {
        clearInterval(Focus.timer);
        Focus.isRunning = false;
        document.getElementById('btnTimerStart').classList.remove('hidden');
        document.getElementById('btnTimerStop').classList.add('hidden');
    },
    
    reset: () => {
        Focus.stop();
        Focus.timeLeft = Focus.totalTime;
        Focus.updateDisplay();
    }
};

const Sudoku = {
    grid: [],
    solution: [],
    selectedCell: null,
    timer: null,
    seconds: 0,
    difficulty: 30,
    
    init: () => {
        document.getElementById('btnNewGame').addEventListener('click', Sudoku.newGame);
        
        document.querySelectorAll('.diff-select').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-select').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = btn.dataset.level;
                if(level === 'easy') Sudoku.difficulty = 30;
                if(level === 'medium') Sudoku.difficulty = 45;
                if(level === 'hard') Sudoku.difficulty = 55;
            });
        });
        
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if(btn.id === 'btnErase') Sudoku.fill(0);
                else Sudoku.fill(parseInt(btn.dataset.val));
            });
        });
        
        Sudoku.newGame();
    },
    
    newGame: () => {
        Sudoku.seconds = 0;
        clearInterval(Sudoku.timer);
        Sudoku.timer = setInterval(() => {
            Sudoku.seconds++;
            const m = Math.floor(Sudoku.seconds / 60).toString().padStart(2, '0');
            const s = (Sudoku.seconds % 60).toString().padStart(2, '0');
            document.getElementById('sudokuTimer').innerText = `${m}:${s}`;
        }, 1000);
        
        Sudoku.generate();
        Sudoku.render();
    },
    
    generate: () => {
        const board = Array.from({length: 9}, () => Array(9).fill(0));
        
        for(let i=0; i<9; i=i+3) {
            Sudoku.fillBox(board, i, i);
        }
        
        Sudoku.solve(board);
        Sudoku.solution = JSON.parse(JSON.stringify(board));
        
        let attempts = Sudoku.difficulty;
        while(attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if(board[row][col] !== 0) {
                board[row][col] = 0;
                attempts--;
            }
        }
        Sudoku.grid = board;
    },
    
    fillBox: (board, row, col) => {
        let num;
        for(let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while(!Sudoku.isSafeBox(board, row, col, num));
                board[row+i][col+j] = num;
            }
        }
    },
    
    isSafeBox: (board, rowStart, colStart, num) => {
        for(let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                if(board[rowStart+i][colStart+j] === num) return false;
            }
        }
        return true;
    },
    
    solve: (board) => {
        for(let i=0; i<9; i++) {
            for(let j=0; j<9; j++) {
                if(board[i][j] === 0) {
                    for(let num=1; num<=9; num++) {
                        if(Sudoku.isSafe(board, i, j, num)) {
                            board[i][j] = num;
                            if(Sudoku.solve(board)) return true;
                            board[i][j] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    },
    
    isSafe: (board, row, col, num) => {
        for(let x=0; x<9; x++) if(board[row][x] === num || board[x][col] === num) return false;
        let startRow = row - row % 3, startCol = col - col % 3;
        for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(board[i+startRow][j+startCol] === num) return false;
        return true;
    },
    
    render: () => {
        const boardEl = document.getElementById('sudokuBoard');
        boardEl.innerHTML = '';
        for(let i=0; i<9; i++) {
            for(let j=0; j<9; j++) {
                const cell = document.createElement('div');
                cell.className = 's-cell';
                if(Sudoku.grid[i][j] !== 0) {
                    cell.innerText = Sudoku.grid[i][j];
                    cell.classList.add('fixed');
                } else {
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.addEventListener('click', () => {
                        document.querySelectorAll('.s-cell').forEach(c => c.classList.remove('selected'));
                        cell.classList.add('selected');
                        Sudoku.selectedCell = {r: i, c: j, el: cell};
                    });
                }
                boardEl.appendChild(cell);
            }
        }
    },
    
    fill: (num) => {
        if(!Sudoku.selectedCell) return;
        const {r, c, el} = Sudoku.selectedCell;
        
        if(num === 0) {
            el.innerText = '';
            el.classList.remove('error');
            return;
        }
        
        el.innerText = num;
        if(num !== Sudoku.solution[r][c]) {
            el.classList.add('error');
            document.getElementById('errorCount').innerText = parseInt(document.getElementById('errorCount').innerText) + 1;
        } else {
            el.classList.remove('error');
        }
    }
};

// --- DECIDE MODULE ---
const Decide = {
    init: () => {
        document.getElementById('btnDecide').addEventListener('click', Decide.spin);
    },
    
    spin: () => {
        const input = document.getElementById('decideOptions').value;
        const lines = input.split('\n').filter(line => line.trim() !== '');
        
        if(lines.length < 2) {
            alert("Please enter at least 2 options!");
            return;
        }
        
        const resultEl = document.getElementById('decideResult');
        let counter = 0;
        const interval = setInterval(() => {
            resultEl.innerText = lines[Math.floor(Math.random() * lines.length)];
            counter++;
            if(counter > 20) {
                clearInterval(interval);
                resultEl.style.color = '#00ff41';
                resultEl.style.textShadow = '0 0 20px #00ff41';
            }
        }, 50);
    }
};

document.addEventListener('DOMContentLoaded', Router.init);
