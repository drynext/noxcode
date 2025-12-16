/* --- HỆ THỐNG ĐIỀU HƯỚNG (ROUTER) --- */
const Router = {
    go: (id) => {
        // Ẩn tất cả views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        // Bỏ active button menu
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        // Hiện view cần đến
        const target = document.getElementById(`view-${id}`);
        if (target) target.classList.add('active');
        
        // Highlight button tương ứng (nếu có)
        // Tìm button có onclick chứa id này
        const btns = document.querySelectorAll('.nav-btn');
        btns.forEach(btn => {
            if(btn.getAttribute('onclick').includes(id)) {
                btn.classList.add('active');
            }
        });
    }
};

/* --- HIỆU ỨNG MATRIX RAIN --- */
const Matrix = {
    init: () => {
        const c = document.getElementById('matrixCanvas');
        const ctx = c.getContext('2d');
        let w = c.width = window.innerWidth;
        let h = c.height = window.innerHeight;
        
        const cols = Math.floor(w / 20);
        const drops = Array(cols).fill(1);
        
        const draw = () => {
            // Tạo hiệu ứng mờ dần
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
            ctx.fillRect(0, 0, w, h);
            
            // Lấy màu chủ đạo từ CSS
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary');
            ctx.font = '14px monospace';
            
            drops.forEach((y, i) => {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                ctx.fillText(text, i * 20, y * 20);
                
                // Reset ngẫu nhiên khi chạm đáy
                if(y * 20 > h && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        };
        
        setInterval(draw, 33);
        
        window.onresize = () => { 
            w = c.width = window.innerWidth; 
            h = c.height = window.innerHeight; 
        };
    }
};

/* --- MODULE: PRACTICE TRACKER --- */
const Tracker = {
    data: JSON.parse(localStorage.getItem('nox_tasks')) || [],
    
    add: () => {
        const n = document.getElementById('trackName');
        const p = document.getElementById('trackPlat');
        
        if(!n.value) return;
        
        Tracker.data.unshift({
            id: Date.now(), 
            name: n.value, 
            plat: p.value || 'General', 
            done: false
        });
        
        n.value = ''; p.value = ''; 
        Tracker.save();
    },
    
    toggle: (id) => { 
        const t = Tracker.data.find(x => x.id === id); 
        if(t){ t.done = !t.done; Tracker.save(); } 
    },
    
    del: (id) => { 
        Tracker.data = Tracker.data.filter(x => x.id !== id); 
        Tracker.save(); 
    },
    
    save: () => { 
        localStorage.setItem('nox_tasks', JSON.stringify(Tracker.data)); 
        Tracker.render(); 
    },
    
    render: () => {
        const list = document.getElementById('taskList'); 
        list.innerHTML = '';
        
        Tracker.data.forEach(t => {
            list.innerHTML += `
                <li class="task">
                    <div class="task-info">
                        <span style="font-weight:600; font-size:16px; text-decoration:${t.done?'line-through':''}">${t.name}</span>
                        <span class="task-meta">${t.plat}</span>
                    </div>
                    <div class="task-actions">
                        <span class="badge ${t.done?'done':'todo'}">${t.done?'DONE':'TODO'}</span>
                        <button onclick="Tracker.toggle(${t.id})">✓</button>
                        <button onclick="Tracker.del(${t.id})">X</button>
                    </div>
                </li>`;
        });
        
        // Update stats sidebar
        document.getElementById('statDone').innerText = Tracker.data.filter(x=>x.done).length;
        document.getElementById('statPending').innerText = Tracker.data.filter(x=>!x.done).length;
    }
};

/* --- MODULE: FOCUS TIMER --- */
const Focus = {
    time: 1500, total: 1500, timer: null,
    
    set: (min, btn) => {
        Focus.stop(); 
        Focus.time = Focus.total = min * 60; 
        Focus.update();
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },
    
    start: () => {
        if(Focus.timer) return;
        document.getElementById('btnStart').classList.add('hidden');
        document.getElementById('btnStop').classList.remove('hidden');
        
        Focus.timer = setInterval(() => {
            Focus.time--; 
            Focus.update();
            if(Focus.time <= 0) { 
                Focus.stop(); 
                alert("Session Done!"); 
                Focus.reset(); 
            }
        }, 1000);
    },
    
    stop: () => {
        clearInterval(Focus.timer); 
        Focus.timer = null;
        document.getElementById('btnStart').classList.remove('hidden');
        document.getElementById('btnStop').classList.add('hidden');
    },
    
    reset: () => { 
        Focus.stop(); 
        Focus.time = Focus.total; 
        Focus.update(); 
    },
    
    update: () => {
        const m = Math.floor(Focus.time / 60).toString().padStart(2,0);
        const s = (Focus.time % 60).toString().padStart(2,0);
        document.getElementById('timerDisplay').innerText = `${m}:${s}`;
        
        // Update SVG Circle (880 is approx circumference for r=140)
        const off = 880 - (Focus.time / Focus.total) * 880;
        document.getElementById('timerPath').style.strokeDashoffset = off;
    }
};

/* --- MODULE: SUDOKU ENGINE (BACKTRACKING) --- */
const Sudoku = {
    sel: null, board: [], sol: [], diff: 30,
    
    setDiff: (d, btn) => {
        Sudoku.diff = d;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },
    
    newGame: () => {
        const b = Array.from({length:9}, ()=>Array(9).fill(0));
        // Fill diagonals first (safe)
        for(let i=0; i<9; i+=3) Sudoku.fillBox(b, i, i);
        // Solve to generate full board
        Sudoku.solve(b); 
        Sudoku.sol = JSON.parse(JSON.stringify(b));
        // Remove cells based on difficulty
        for(let i=0; i<Sudoku.diff; i++) {
            let r = Math.floor(Math.random()*9);
            let c = Math.floor(Math.random()*9);
            b[r][c] = 0;
        }
        Sudoku.board = b; 
        Sudoku.render();
    },
    
    fillBox: (b,r,c) => {
        let n; 
        for(let i=0;i<3;i++) for(let j=0;j<3;j++) {
            do{ n=Math.floor(Math.random()*9)+1 } while(!Sudoku.safeBox(b,r,c,n));
            b[r+i][c+j] = n;
        }
    },
    
    safeBox: (b,r,c,n) => { 
        for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(b[r+i][c+j]==n) return false; 
        return true; 
    },
    
    solve: (b) => {
        for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(b[r][c]==0) {
            for(let n=1;n<=9;n++) if(Sudoku.safe(b,r,c,n)) {
                b[r][c]=n; 
                if(Sudoku.solve(b)) return true; 
                b[r][c]=0;
            }
            return false;
        }
        return true;
    },
    
    safe: (b,r,c,n) => {
        for(let x=0;x<9;x++) if(b[r][x]==n || b[x][c]==n) return false;
        let sr=r-r%3, sc=c-c%3;
        for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(b[sr+i][sc+j]==n) return false;
        return true;
    },
    
    render: () => {
        const g = document.getElementById('sudokuGrid'); 
        g.innerHTML = '';
        for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
            const d = document.createElement('div');
            d.className = 'cell ' + (Sudoku.board[r][c]?'fixed':'');
            d.innerText = Sudoku.board[r][c] || '';
            if(!Sudoku.board[r][c]) {
                d.onclick = () => {
                    document.querySelectorAll('.cell').forEach(x=>x.classList.remove('selected'));
                    d.classList.add('selected'); 
                    Sudoku.sel = {r,c,el:d};
                };
            }
            g.appendChild(d);
        }
        document.getElementById('errCount').innerText = "0";
    },
    
    fill: (v) => {
        if(!Sudoku.sel) return;
        if(v==0) { 
            Sudoku.sel.el.innerText = ''; 
            Sudoku.sel.el.classList.remove('error');
            return; 
        }
        
        Sudoku.sel.el.innerText = v;
        const correct = Sudoku.sol[Sudoku.sel.r][Sudoku.sel.c];
        
        if(v != correct) {
            Sudoku.sel.el.classList.add('error');
            let err = document.getElementById('errCount');
            err.innerText = parseInt(err.innerText) + 1;
        } else {
            Sudoku.sel.el.classList.remove('error');
        }
    }
};

/* --- MODULE: DECISION MAKER --- */
const Decide = {
    run: () => {
        const txt = document.getElementById('decideInput').value;
        const opts = txt.split('\n').filter(x=>x.trim());
        
        if(opts.length<2) { alert('Enter 2+ options'); return; }
        
        const res = document.getElementById('decideResult');
        let i=0; 
        const t = setInterval(() => {
            res.innerText = opts[Math.floor(Math.random()*opts.length)];
            if(++i>20) clearInterval(t);
        }, 50);
    }
};

/* --- COMMAND PALETTE (CTRL+K) --- */
const Cmd = {
    list: [
        {k:'goto dashboard', d:'Go Home', f:()=>Router.go('dashboard')},
        {k:'goto tracker', d:'Manage Tasks', f:()=>Router.go('tracker')},
        {k:'goto focus', d:'Pomodoro Timer', f:()=>Router.go('focus')},
        {k:'goto sudoku', d:'Play Sudoku', f:()=>Router.go('sudoku')},
        {k:'goto decide', d:'Randomizer', f:()=>Router.go('decide')},
        {k:'theme blue', d:'Cyber Blue Theme', f:()=>document.body.setAttribute('data-theme','blue')},
        {k:'theme red', d:'Alert Red Theme', f:()=>document.body.setAttribute('data-theme','red')},
        {k:'theme gold', d:'Industrial Theme', f:()=>document.body.setAttribute('data-theme','gold')},
        {k:'theme green', d:'Matrix Theme', f:()=>document.body.removeAttribute('data-theme')},
        {k:'clear', d:'Clear Done Tasks', f:()=>{ 
            Tracker.data = Tracker.data.filter(x=>!x.done); 
            Tracker.save(); 
        }}
    ],
    
    init: () => {
        // Toggle Listener
        document.addEventListener('keydown', e => {
            if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()=='k') {
                e.preventDefault();
                const ol = document.getElementById('cmdOverlay');
                ol.classList.toggle('show');
                if(ol.classList.contains('show')) {
                    document.getElementById('cmdInput').value = '';
                    document.getElementById('cmdInput').focus();
                    Cmd.render(Cmd.list);
                }
            }
            if(e.key=='Escape') document.getElementById('cmdOverlay').classList.remove('show');
        });

        // Input Listener
        document.getElementById('cmdInput').addEventListener('input', e => {
            const val = e.target.value.toLowerCase();
            const filtered = Cmd.list.filter(c => c.k.includes(val));
            Cmd.render(filtered);
        });

        // Enter Listener
        document.getElementById('cmdInput').addEventListener('keydown', e => {
            if(e.key=='Enter') {
                const val = e.target.value.toLowerCase();
                const cmd = Cmd.list.find(c => c.k === val);
                if(cmd) { 
                    cmd.f(); 
                    document.getElementById('cmdOverlay').classList.remove('show'); 
                } else {
                    // Nếu ấn enter mà chưa chọn chính xác, chạy cái đầu tiên trong list gợi ý
                    const first = document.querySelector('.cmd-item');
                    if(first) first.click();
                }
            }
        });
    },

    render: (items) => {
        const l = document.getElementById('cmdList');
        l.innerHTML = '';
        items.forEach(c => {
            l.innerHTML += `
                <div class="cmd-item" onclick="Cmd.exec('${c.k}')">
                    <span>${c.k}</span>
                    <span>${c.d}</span>
                </div>`;
        });
    },

    exec: (key) => {
        const cmd = Cmd.list.find(c => c.k === key);
        if(cmd) cmd.f();
        document.getElementById('cmdOverlay').classList.remove('show');
    }
};

/* --- INITIALIZATION --- */
window.onload = () => {
    Matrix.init(); 
    Tracker.render(); 
    Sudoku.newGame(); 
    Cmd.init();
    
    // Typing Effect on Dashboard
    const t = "Initializing NOXCODE V3.5... System Ready.";
    let i=0; const el = document.getElementById('typing');
    el.innerText='';
    const type = () => { if(i<t.length){el.innerText+=t.charAt(i++); setTimeout(type,30)} };
    type();
};
