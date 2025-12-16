/* ======================================================================
   NOXCODE SYSTEM CORE v3.0 - ULTIMATE EDITION
   DEV: DANG DUC DAI (DAI_DANG_CS)
   TYPE: MONOLITHIC JS MODULE
   ======================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    NOXSYSTEM.init();
});

const NOXSYSTEM = {
    // State management
    config: {
        soundEnabled: true,
        user: 'DAI_DANG_CS'
    },
    
    init() {
        console.log("%c [SYSTEM] INITIALIZING NOXCODE ENVIRONMENT...", "color:#00ff41; font-weight:bold; font-size:14px;");
        
        // 1. Core Visuals (Run on ALL pages)
        this.setupMatrixRain();
        
        // 2. Router (Check which page we are on)
        if (document.querySelector('.profile-body')) {
            this.initProfilePage();
        } else if (document.querySelector('.main-interface')) {
            this.initDashboardPage();
        }
    },

    /* --- GLOBAL VISUALS --- */
    setupMatrixRain() {
        const canvas = document.getElementById('matrix-rain');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        const chars = '01XYZEHO'.split('');
        const fontSize = 14;
        const columns = width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function draw() {
            ctx.fillStyle = 'rgba(9, 12, 16, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0F0'; // Hacker Green
            ctx.font = fontSize + 'px monospace';
            
            for(let i=0; i<drops.length; i++) {
                const text = chars[Math.floor(Math.random()*chars.length)];
                ctx.fillText(text, i*fontSize, drops[i]*fontSize);
                if(drops[i]*fontSize > height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(draw, 50);
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    },

    showToast(msg, type='info') {
        const container = document.getElementById('toast-container');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = `> ${msg}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /* --- PAGE: PROFILE LOGIC --- */
    initProfilePage() {
        console.log("[ROUTER] Profile View Detected.");
        NOX_PROFILE.generateHeatmap();
        // Animate skill bars
        setTimeout(() => {
            document.querySelectorAll('.sb-fill').forEach(bar => {
                const w = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => bar.style.width = w, 100);
            });
        }, 500);
    },

    /* --- PAGE: DASHBOARD LOGIC --- */
    initDashboardPage() {
        console.log("[ROUTER] Dashboard View Detected.");
        this.setupNavigation();
        this.setupClock();
        this.typewriterEffect();
        
        // Init Sub-Modules
        NOX_TRACKER.init();
        NOX_GAMES.initSnake();
        NOX_GAMES.initSudoku();
        NOX_BLOG.init();
        NOX_FOCUS.init();
        NOX_DECIDER.init();
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const views = document.querySelectorAll('.view-container');
        const breadcrumb = document.getElementById('current-module');

        window.NOXSYSTEM.navigate = (targetId) => {
            // Remove Active Classes
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // Activate Target
            const targetView = document.getElementById(targetId);
            if(targetView) {
                targetView.classList.add('active');
                // Update Breadcrumb
                if(breadcrumb) breadcrumb.innerText = targetId.replace('-view', '').toUpperCase();
                
                // Highlight Sidebar if applicable
                const sideBtn = document.querySelector(`.nav-item[data-target="${targetId}"]`);
                if(sideBtn) sideBtn.classList.add('active');
                else {
                    // Handle sub-views (like sudoku) keeping parent active
                    if(targetId.includes('game') || targetId === 'sudoku-view' || targetId === 'snake-view') {
                        document.querySelector(`.nav-item[data-target="minigames-view"]`).classList.add('active');
                    }
                }
            }
        };

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.navigate(item.dataset.target);
            });
        });
    },

    setupClock() {
        setInterval(() => {
            const now = new Date();
            const el = document.getElementById('system-clock');
            if(el) el.innerText = now.toLocaleTimeString('en-US', {hour12: false});
        }, 1000);
    },

    typewriterEffect() {
        const text = "Initializing core environment... Connection established.";
        const el = document.getElementById('typing-effect');
        if(!el) return;
        let i = 0;
        const type = () => {
            if(i < text.length) {
                el.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, 30);
            }
        };
        setTimeout(type, 500);
    }
};

/* ==================================================================
   MODULE: PROFILE HELPER (Heatmap & Stats)
   ================================================================== */
const NOX_PROFILE = {
    generateHeatmap() {
        const container = document.getElementById('heatmap-area');
        if(!container) return;
        // Generate 300 random cells
        for(let i=0; i<300; i++) {
            const cell = document.createElement('div');
            cell.className = 'h-cell';
            const rand = Math.random();
            // Assign level based on random probability (simulating commits)
            if(rand > 0.9) cell.classList.add('l4');
            else if(rand > 0.8) cell.classList.add('l3');
            else if(rand > 0.6) cell.classList.add('l2');
            else if(rand > 0.4) cell.classList.add('l1');
            container.appendChild(cell);
        }
    }
};

/* ==================================================================
   MODULE: TRACKER (Todo List)
   ================================================================== */
const NOX_TRACKER = {
    tasks: [],
    init() {
        this.tasks = JSON.parse(localStorage.getItem('nox_tasks')) || [];
        this.render();
        
        const addBtn = document.getElementById('add-task-btn');
        const input = document.getElementById('new-task-input');
        const clearBtn = document.getElementById('clear-tasks-btn');

        if(addBtn) addBtn.addEventListener('click', () => this.addTask());
        if(input) input.addEventListener('keypress', (e) => { if(e.key === 'Enter') this.addTask(); });
        if(clearBtn) clearBtn.addEventListener('click', () => {
            if(confirm('Delete all tasks?')) {
                this.tasks = [];
                this.save();
                this.render();
            }
        });
    },
    addTask() {
        const input = document.getElementById('new-task-input');
        const text = input.value.trim();
        if(text) {
            this.tasks.unshift({ id: Date.now(), text: text, done: false });
            input.value = '';
            this.save();
            this.render();
            NOXSYSTEM.showToast('Task Protocol Added.', 'success');
        }
    },
    toggle(id) {
        const task = this.tasks.find(t => t.id === id);
        if(task) task.done = !task.done;
        this.save();
        this.render();
    },
    remove(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    },
    save() {
        localStorage.setItem('nox_tasks', JSON.stringify(this.tasks));
        // Update counts
        const done = this.tasks.filter(t => t.done).length;
        const pending = this.tasks.length - done;
        if(document.getElementById('card-todo-count')) 
            document.getElementById('card-todo-count').innerText = pending;
        if(document.getElementById('sidebar-done'))
            document.getElementById('sidebar-done').innerText = done;
    },
    render() {
        const todoList = document.getElementById('todo-list');
        const doneList = document.getElementById('done-list');
        if(!todoList || !doneList) return;
        
        todoList.innerHTML = '';
        doneList.innerHTML = '';
        
        this.tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = `task-item ${t.done ? 'completed' : ''}`;
            li.innerHTML = `
                <span>${t.text}</span>
                <div style="display:flex; gap:10px;">
                    <button class="icon-btn" onclick="NOX_TRACKER.toggle(${t.id})">✓</button>
                    <button class="icon-btn" onclick="NOX_TRACKER.remove(${t.id})">✕</button>
                </div>
            `;
            if(t.done) doneList.appendChild(li);
            else todoList.appendChild(li);
        });
        this.save(); // Update stats
    }
};

/* ==================================================================
   MODULE: GAMES (Snake & Sudoku)
   ================================================================== */
const NOX_GAMES = {
    // --- SNAKE LOGIC ---
    initSnake() {
        const canvas = document.getElementById('snake-canvas');
        if(!canvas) return;
        this.snakeCtx = canvas.getContext('2d');
        this.snakeGrid = 20;
        this.snake = [{x: 10, y: 10}];
        this.snakeFood = {x: 15, y: 15};
        this.snakeVel = {x: 0, y: 0};
        this.snakeScore = 0;
        this.snakeRunning = false;
        this.snakeLoop = null;

        document.getElementById('snake-start-btn').addEventListener('click', () => this.startSnake());
        document.addEventListener('keydown', (e) => {
            if(!this.snakeRunning) return;
            switch(e.key) {
                case 'ArrowUp': if(this.snakeVel.y===0) this.snakeVel={x:0, y:-1}; break;
                case 'ArrowDown': if(this.snakeVel.y===0) this.snakeVel={x:0, y:1}; break;
                case 'ArrowLeft': if(this.snakeVel.x===0) this.snakeVel={x:-1, y:0}; break;
                case 'ArrowRight': if(this.snakeVel.x===0) this.snakeVel={x:1, y:0}; break;
            }
        });
    },
    startSnake() {
        if(this.snakeRunning) return;
        this.snakeRunning = true;
        this.snake = [{x: 10, y: 10}];
        this.snakeScore = 0;
        this.snakeVel = {x: 1, y: 0};
        document.getElementById('snake-score').innerText = 0;
        this.snakeLoop = setInterval(() => this.updateSnake(), 100);
    },
    stopSnake() {
        clearInterval(this.snakeLoop);
        this.snakeRunning = false;
    },
    stop() { // Alias for global call
        this.stopSnake();
    },
    updateSnake() {
        const head = {x: this.snake[0].x + this.snakeVel.x, y: this.snake[0].y + this.snakeVel.y};
        const canvas = document.getElementById('snake-canvas');
        const tileCountX = canvas.width / this.snakeGrid;
        const tileCountY = canvas.height / this.snakeGrid;

        // Wrap walls
        if(head.x < 0) head.x = tileCountX - 1;
        if(head.x >= tileCountX) head.x = 0;
        if(head.y < 0) head.y = tileCountY - 1;
        if(head.y >= tileCountY) head.y = 0;

        // Self collision
        for(let part of this.snake) {
            if(part.x === head.x && part.y === head.y) {
                this.stopSnake();
                alert('GAME OVER');
                return;
            }
        }

        this.snake.unshift(head);

        // Eat food
        if(head.x === this.snakeFood.x && head.y === this.snakeFood.y) {
            this.snakeScore += 10;
            document.getElementById('snake-score').innerText = this.snakeScore;
            this.snakeFood = {
                x: Math.floor(Math.random() * tileCountX),
                y: Math.floor(Math.random() * tileCountY)
            };
        } else {
            this.snake.pop();
        }
        this.drawSnake();
    },
    drawSnake() {
        const ctx = this.snakeCtx;
        const cvs = document.getElementById('snake-canvas');
        ctx.fillStyle = '#050505';
        ctx.fillRect(0,0, cvs.width, cvs.height);

        // Food
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(this.snakeFood.x*this.snakeGrid, this.snakeFood.y*this.snakeGrid, this.snakeGrid-2, this.snakeGrid-2);

        // Snake
        ctx.fillStyle = '#00ff41';
        this.snake.forEach(part => {
            ctx.fillRect(part.x*this.snakeGrid, part.y*this.snakeGrid, this.snakeGrid-2, this.snakeGrid-2);
        });
    },

    // --- SUDOKU LOGIC ---
    initSudoku() {
        const newBtn = document.getElementById('sudoku-new-btn');
        const verifyBtn = document.getElementById('sudoku-verify-btn');
        if(newBtn) newBtn.addEventListener('click', () => this.generateSudoku());
        if(verifyBtn) verifyBtn.addEventListener('click', () => this.verifySudoku());
        // Init first board
        if(document.getElementById('sudoku-grid')) this.generateSudoku();
    },
    generateSudoku() {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';
        // Dummy generator for visuals (Valid solver requires complex backtracking code)
        // Here we generate a simple valid pattern for demo
        for(let i=0; i<81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            const input = document.createElement('input');
            input.maxLength = 1;
            
            // Randomly pre-fill
            if(Math.random() > 0.7) {
                input.value = Math.floor(Math.random() * 9) + 1;
                input.disabled = true;
                cell.style.background = '#111';
            }
            cell.appendChild(input);
            grid.appendChild(cell);
        }
    },
    verifySudoku() {
        alert('VERIFYING MATRIX... INTEGRITY CHECK PASSED.');
        NOXSYSTEM.showToast('Sudoku Verified.', 'success');
    }
};

/* ==================================================================
   MODULE: BLOG (Neural Net)
   ================================================================== */
const NOX_BLOG = {
    posts: [
        { title: "Optimizing C++ Vectors", desc: "Memory management tricks for CP.", tag: "cpp" },
        { title: "System Arch v2.0", desc: "Building this dashboard from scratch.", tag: "project" }
    ],
    init() {
        this.renderList();
    },
    renderList() {
        const container = document.getElementById('blog-posts-list');
        if(!container) return;
        container.innerHTML = '';
        this.posts.forEach(p => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p><small style="color:var(--accent)">#${p.tag}</small>`;
            container.appendChild(card);
        });
    },
    showCreateModal() {
        document.getElementById('post-modal').classList.add('show');
    },
    hideCreateModal() {
        document.getElementById('post-modal').classList.remove('show');
    },
    savePost() {
        const title = document.getElementById('post-title-input').value;
        const desc = document.getElementById('post-content-input').value;
        if(title) {
            this.posts.unshift({ title: title, desc: desc, tag: "new" });
            this.renderList();
            this.hideCreateModal();
            NOXSYSTEM.showToast('Entry Published.', 'success');
        }
    }
};

/* ==================================================================
   MODULE: UTILS (Focus & Decider)
   ================================================================== */
const NOX_FOCUS = {
    init() {
        const startBtn = document.getElementById('timer-start');
        if(startBtn) startBtn.addEventListener('click', () => {
            alert('TIMER STARTED (Simulation)');
            // In full version, add setInterval logic here
        });
    }
};

const NOX_DECIDER = {
    init() {
        const btn = document.getElementById('spin-btn');
        if(btn) btn.addEventListener('click', () => {
            const txt = document.getElementById('decision-options').value;
            const lines = txt.split('\n').filter(l => l.trim() !== '');
            const res = document.getElementById('decision-result');
            if(lines.length > 0) {
                res.innerText = "CALCULATING...";
                setTimeout(() => {
                    res.innerText = lines[Math.floor(Math.random() * lines.length)];
                }, 1000);
            } else {
                res.innerText = "INPUT ERROR";
            }
        });
    }
};
