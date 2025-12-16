// --- STATE MANAGEMENT ---
const App = {
    commands: [
        { key: 'goto dashboard', desc: 'Open Dashboard' },
        { key: 'goto tracker', desc: 'Open Task Tracker' },
        { key: 'goto focus', desc: 'Open Focus Timer' },
        { key: 'goto sudoku', desc: 'Open Sudoku' },
        { key: 'goto decide', desc: 'Open Decider' },
        { key: 'theme green', desc: 'Matrix Green Theme' },
        { key: 'theme blue', desc: 'Cyber Blue Theme' },
        { key: 'theme red', desc: 'Alert Red Theme' },
        { key: 'theme gold', desc: 'Industrial Gold Theme' },
        { key: 'clear done', desc: 'Remove completed tasks' }
    ]
};

// --- ROUTER ---
const Router = {
    init: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => Router.go(btn.dataset.target));
        });
        
        // Typing Effect
        const text = "System initialized. Ready for input.";
        const el = document.getElementById('typingEffect');
        let i = 0;
        const type = () => {
            if(i < text.length) { el.textContent += text.charAt(i); i++; setTimeout(type, 30); }
        };
        setTimeout(type, 500);

        // Init Modules
        Matrix.init();
        Tracker.init();
        Focus.init();
        Sudoku.init();
        Decide.init();
        Cmd.init();
    },

    go: (viewId) => {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        const target = document.getElementById(`view-${viewId}`);
        const btn = document.querySelector(`.nav-btn[data-target="${viewId}"]`);
        
        if(target) target.classList.add('active');
        if(btn) btn.classList.add('active');
    }
};
window.router = Router.go;

// --- COMMAND PALETTE (FIXED) ---
const Cmd = {
    isOpen: false,
    idx: 0,
    filtered: [],

    init: () => {
        const overlay = document.getElementById('cmdOverlay');
        const input = document.getElementById('cmdInput');

        // Global Key Listener
        document.addEventListener('keydown', (e) => {
            // FIX: Stronger check for Ctrl+K
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault(); // Stop browser defaults
                e.stopPropagation();
                Cmd.toggle();
            }
            
            if (!Cmd.isOpen) return;

            if (e.key === 'Escape') Cmd.close();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                Cmd.idx = (Cmd.idx + 1) % Cmd.filtered.length;
                Cmd.render();
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                Cmd.idx = (Cmd.idx - 1 + Cmd.filtered.length) % Cmd.filtered.length;
                Cmd.render();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (Cmd.filtered.length > 0) Cmd.run(Cmd.filtered[Cmd.idx].key);
                else Cmd.run(input.value);
            }
        });

        input.addEventListener('input', () => {
            const val = input.value.toLowerCase();
            Cmd.filtered = App.commands.filter(c => c.key.includes(val));
            Cmd.idx = 0;
            Cmd.render();
        });

        overlay.addEventListener('click', (e) => {
            if(e.target === overlay || e.target.classList.contains('cmd-backdrop')) Cmd.close();
        });
    },

    toggle: () => {
        const overlay = document.getElementById('cmdOverlay');
        const input = document.getElementById('cmdInput');
        Cmd.isOpen = !Cmd.isOpen;
        
        if (Cmd.isOpen) {
            overlay.classList.remove('hidden');
            input.value = '';
            input.focus();
            Cmd.filtered = App.commands;
            Cmd.idx = 0;
            Cmd.render();
        } else {
            overlay.classList.add('hidden');
        }
    },

    close: () => {
        Cmd.isOpen = false;
        document.getElementById('cmdOverlay').classList.add('hidden');
    },

    render: () => {
        const list = document.getElementById('cmdResults');
        list.innerHTML = '';
        Cmd.filtered.forEach((cmd, i) => {
            const div = document.createElement('div');
            div.className = `cmd-item ${i === Cmd.idx ? 'active' : ''}`;
            div.innerHTML = `<span>${cmd.key}</span><span style="opacity:0.5; font-size:12px">${cmd.desc}</span>`;
            div.onclick = () => Cmd.run(cmd.key);
            div.onmouseover = () => { Cmd.idx = i; list.querySelectorAll('.cmd-item').forEach(el => el.classList.remove('active')); div.classList.add('active'); };
            list.appendChild(div);
        });
    },

    run: (str) => {
        const [action, ...args] = str.split(' ');
        const arg = args.join(' ');
        
        if(action === 'goto') Router.go(arg);
        if(action === 'theme') document.body.setAttribute('data-theme', arg);
        if(action === 'clear' && arg === 'done') Tracker.clear();
        
        Cmd.close();
    }
};

// --- MATRIX ENGINE ---
const Matrix = {
    init: () => {
        const c = document.getElementById('matrixCanvas');
        const ctx = c.getContext('2d');
        let w = c.width = window.innerWidth;
        let h = c.height = window.innerHeight;
        const cols = Math.floor(w / 20);
        const drops = Array(cols).fill(1);
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary') || '#0f0';
            ctx.font = '14px monospace';
            drops.forEach((y, i) => {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                ctx.fillText(text, i * 20, y * 20);
                if(y * 20 > h && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        };
        setInterval(draw, 33);
        window.onresize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    }
};

// --- TRACKER ---
const Tracker = {
    data: JSON.parse(localStorage.getItem('nox_tasks')) || [],
    init: () => {
        document.getElementById('btnAddTrack').onclick = Tracker.add;
        Tracker.render();
    },
    add: () => {
        const n = document.getElementById('trackName');
        const p = document.getElementById('trackPlatform');
        if(!n.value) return;
        Tracker.data.unshift({ id: Date.now(), name: n.value, plat: p.value || 'General', done: false });
        n.value = ''; p.value = '';
        Tracker.save();
    },
    toggle: (id) => {
        const t = Tracker.data.find(x => x.id === id);
        if(t) { t.done = !t.done; Tracker.save(); }
    },
    del: (id) => {
        Tracker.data = Tracker.data.filter(x => x.id !== id);
        Tracker.save();
    },
    clear: () => {
        Tracker.data = Tracker.data.filter(x => !x.done);
        Tracker.save();
    },
    save: () => {
        localStorage.setItem('nox_tasks', JSON.stringify(Tracker.data));
        Tracker.render();
    },
    render: () => {
        const ul = document.getElementById('trackerList');
        ul.innerHTML = '';
        Tracker.data.forEach(t => {
            const li = document.createElement('li');
            li.className = 'track-item';
            li.innerHTML = `
                <div class="t-info">
                    <span class="t-name" style="${t.done ? 'text-decoration:line-through; opacity:0.5' : ''}">${t.name}</span>
                    <span class="t-meta">${t.plat}</span>
                </div>
                <div class="t-actions">
                    <span class="t-badge ${t.done ? 'done' : 'todo'}">${t.done ? 'DONE' : 'TODO'}</span>
                    <button onclick="Tracker.toggle(${t.id})">✓</button>
                    <button onclick="Tracker.del(${t.id})">×</button>
                </div>
            `;
            ul.appendChild(li);
        });
        document.getElementById('statDone').innerText = Tracker.data.filter(x => x.done).length;
        document.getElementById('statPending').innerText = Tracker.data.filter(x => !x.done).length;
    }
};

// --- FOCUS ---
const Focus = {
    time: 1500, total: 1500, timer: null,
    init: () => {
        document.getElementById('btnStartFocus').onclick = Focus.start;
        document.getElementById('btnStopFocus').onclick = Focus.stop;
        document.getElementById('btnResetFocus').onclick = Focus.reset;
    },
    update: () => {
        const m = Math.floor(Focus.time / 60).toString().padStart(2,0);
        const s = (Focus.time % 60).toString().padStart(2,0);
        document.getElementById('timerValue').innerText = `${m}:${s}`;
        const offset = 283 - (Focus.time / Focus.total) * 283;
        document.getElementById('timerPath').style.strokeDashoffset = offset;
    },
    start: () => {
        if(Focus.timer) return;
        document.getElementById('btnStartFocus').classList.add('hidden');
        document.getElementById('btnStopFocus').classList.remove('hidden');
        Focus.timer = setInterval(() => {
            Focus.time--;
            Focus.update();
            if(Focus.time <= 0) { Focus.stop(); alert("Session Complete!"); Focus.reset(); }
        }, 1000);
    },
    stop: () => {
        clearInterval(Focus.timer); Focus.timer = null;
        document.getElementById('btnStartFocus').classList.remove('hidden');
        document.getElementById('btnStopFocus').classList.add('hidden');
    },
    reset: () => { Focus.stop(); Focus.time = Focus.total; Focus.update(); }
};

// --- SUDOKU ---
const Sudoku = {
    sel: null,
    board: [],
    sol: [],
    init: () => {
        document.getElementById('btnNewSudoku').onclick = Sudoku.newGame;
        document.querySelectorAll('.num').forEach(b => b.onclick = () => Sudoku.fill(b.dataset.val));
        document.getElementById('btnErase').onclick = () => Sudoku.fill(0);
        
        document.querySelectorAll('.diff-btn').forEach(b => {
            b.onclick = () => {
                document.querySelectorAll('.diff-btn').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
            };
        });
        Sudoku.newGame();
    },
    newGame: () => {
        // Simple Generator
        const b = Array.from({length:9}, ()=>Array(9).fill(0));
        // Fill diagonals
        for(let i=0;i<9;i+=3) Sudoku.fillBox(b, i, i);
        Sudoku.solve(b);
        Sudoku.sol = JSON.parse(JSON.stringify(b));
        // Remove
        for(let i=0;i<40;i++) {
            let r = Math.floor(Math.random()*9), c = Math.floor(Math.random()*9);
            b[r][c] = 0;
        }
        Sudoku.board = b;
        Sudoku.render();
    },
    fillBox: (b, r, c) => {
        let n;
        for(let i=0;i<3;i++) for(let j=0;j<3;j++) {
            do { n = Math.floor(Math.random()*9)+1; } 
            while(!Sudoku.safeBox(b,r,c,n));
            b[r+i][c+j] = n;
        }
    },
    safeBox: (b, r, c, n) => {
        for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(b[r+i][c+j]===n) return false;
        return true;
    },
    solve: (b) => {
        for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
            if(b[r][c]===0) {
                for(let n=1;n<=9;n++) {
                    if(Sudoku.safe(b,r,c,n)) {
                        b[r][c]=n;
                        if(Sudoku.solve(b)) return true;
                        b[r][c]=0;
                    }
                }
                return false;
            }
        }
        return true;
    },
    safe: (b,r,c,n) => {
        for(let x=0;x<9;x++) if(b[r][x]===n || b[x][c]===n) return false;
        let sr=r-r%3, sc=c-c%3;
        for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(b[sr+i][sc+j]===n) return false;
        return true;
    },
    render: () => {
        const g = document.getElementById('sudokuGrid');
        g.innerHTML = '';
        for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
            const d = document.createElement('div');
            d.className = 's-cell';
            if(Sudoku.board[r][c] !== 0) { d.innerText = Sudoku.board[r][c]; d.classList.add('fixed'); }
            else {
                d.onclick = () => {
                    document.querySelectorAll('.s-cell').forEach(x => x.classList.remove('selected'));
                    d.classList.add('selected');
                    Sudoku.sel = {r,c,el:d};
                };
            }
            g.appendChild(d);
        }
    },
    fill: (val) => {
        if(!Sudoku.sel) return;
        if(val == 0) { Sudoku.sel.el.innerText = ''; Sudoku.sel.el.className='s-cell selected'; return; }
        Sudoku.sel.el.innerText = val;
        if(val != Sudoku.sol[Sudoku.sel.r][Sudoku.sel.c]) Sudoku.sel.el.classList.add('error');
        else Sudoku.sel.el.classList.remove('error');
    }
};

// --- DECIDE ---
const Decide = {
    init: () => {
        document.getElementById('btnSpin').onclick = () => {
            const txt = document.getElementById('decideInput').value;
            const opts = txt.split('\n').filter(x => x.trim());
            if(opts.length < 2) { alert("Enter at least 2 options"); return; }
            const res = document.getElementById('decideResult');
            let i = 0;
            const t = setInterval(() => {
                res.innerText = opts[Math.floor(Math.random()*opts.length)];
                i++;
                if(i>20) { clearInterval(t); res.style.color = 'var(--primary)'; }
            }, 50);
        };
    }
};

document.addEventListener('DOMContentLoaded', Router.init);
