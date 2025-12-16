const AppState = {
    commands: [
        { key: 'goto dashboard', desc: 'Switch to Dashboard' },
        { key: 'goto tracker', desc: 'Switch to Tracker' },
        { key: 'goto focus', desc: 'Switch to Focus Timer' },
        { key: 'goto sudoku', desc: 'Switch to Sudoku Game' },
        { key: 'goto decide', desc: 'Switch to Decision Maker' },
        { key: 'add ', desc: 'Quick add task (e.g., add TwoSum)' },
        { key: 'theme green', desc: 'Set theme to Matrix Green' },
        { key: 'theme blue', desc: 'Set theme to Cyber Blue' },
        { key: 'theme red', desc: 'Set theme to Warning Red' },
        { key: 'theme gold', desc: 'Set theme to Industrial Gold' },
        { key: 'clear', desc: 'Clear completed tasks' }
    ]
};

const Router = {
    init: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => Router.navigate(btn.dataset.target));
        });
        
        const text = "Initializing core modules... System Ready.";
        const el = document.getElementById('typingEffect');
        if(el) {
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
        }
        
        Matrix.init();
        Tracker.init();
        Focus.init();
        Sudoku.init();
        Decide.init();
        CmdPalette.init();
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

const CmdPalette = {
    isOpen: false,
    selectedIndex: 0,
    filteredCmds: [],

    init: () => {
        const overlay = document.getElementById('cmdOverlay');
        const input = document.getElementById('cmdInput');
        const results = document.getElementById('cmdResults');

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                CmdPalette.toggle();
            }
            if (e.key === 'Escape' && CmdPalette.isOpen) {
                CmdPalette.close();
            }
            if (!CmdPalette.isOpen) return;

            if (e.key === 'ArrowDown') {
                CmdPalette.selectedIndex = (CmdPalette.selectedIndex + 1) % CmdPalette.filteredCmds.length;
                CmdPalette.renderResults();
            } else if (e.key === 'ArrowUp') {
                CmdPalette.selectedIndex = (CmdPalette.selectedIndex - 1 + CmdPalette.filteredCmds.length) % CmdPalette.filteredCmds.length;
                CmdPalette.renderResults();
            } else if (e.key === 'Enter') {
                if (CmdPalette.filteredCmds.length > 0) {
                    CmdPalette.execute(CmdPalette.filteredCmds[CmdPalette.selectedIndex].key);
                } else {
                    CmdPalette.execute(input.value);
                }
            }
        });

        input.addEventListener('input', () => {
            const val = input.value.toLowerCase();
            CmdPalette.filteredCmds = AppState.commands.filter(c => c.key.startsWith(val));
            CmdPalette.selectedIndex = 0;
            CmdPalette.renderResults();
        });

        overlay.addEventListener('click', (e) => {
            if(e.target === overlay || e.target.classList.contains('cmd-backdrop')) CmdPalette.close();
        });
    },

    toggle: () => {
        const overlay = document.getElementById('cmdOverlay');
        const input = document.getElementById('cmdInput');
        CmdPalette.isOpen = !CmdPalette.isOpen;
        if (CmdPalette.isOpen) {
            overlay.classList.remove('hidden');
            input.value = '';
            input.focus();
            CmdPalette.filteredCmds = AppState.commands;
            CmdPalette.renderResults();
        } else {
            overlay.classList.add('hidden');
        }
    },

    close: () => {
        CmdPalette.isOpen = false;
        document.getElementById('cmdOverlay').classList.add('hidden');
    },

    renderResults: () => {
        const container = document.getElementById('cmdResults');
        container.innerHTML = '';
        CmdPalette.filteredCmds.forEach((cmd, idx) => {
            const div = document.createElement('div');
            div.className = `cmd-item ${idx === CmdPalette.selectedIndex ? 'active' : ''}`;
            div.innerHTML = `
                <span class="cmd-icon">></span>
                <span class="cmd-text">${cmd.key} <span style="opacity:0.5; font-size:10px"> - ${cmd.desc}</span></span>
            `;
            div.addEventListener('click', () => CmdPalette.execute(cmd.key));
            container.appendChild(div);
        });
    },

    execute: (cmdStr) => {
        const parts = cmdStr.split(' ');
        const action = parts[0];
        const arg = parts.slice(1).join(' ');

        switch(action) {
            case 'goto':
                Router.navigate(arg);
                break;
            case 'add':
                if(arg) Tracker.quickAdd(arg);
                break;
            case 'theme':
                document.body.setAttribute('data-theme', arg);
                break;
            case 'clear':
                Tracker.clearDone();
                break;
        }
        CmdPalette.close();
    }
};

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
            
            const style = getComputedStyle(document.body);
            ctx.fillStyle = style.getPropertyValue('--theme-main') || '#0f0';
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

    quickAdd: (name) => {
        Tracker.data.unshift({
            id: Date.now(),
            name: name,
            platform: 'Command',
            status: 'todo'
        });
        Tracker.save();
        Router.navigate('tracker');
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

    clearDone: () => {
        Tracker.data = Tracker.data.filter(x => x.status !== 'done');
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
        for(let i=0; i<9; i=i+3) Sudoku.fillBox(board, i, i);
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
                resultEl.style.color = getComputedStyle(document.body).getPropertyValue('--theme-main');
            }
        }, 50);
    }
};

window.router = Router.navigate;
document.addEventListener('DOMContentLoaded', Router.init);
