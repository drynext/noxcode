document.addEventListener("DOMContentLoaded", () => {
    const trackerCard = document.getElementById("trackerCard");
    const focusCard = document.getElementById("focusCard");
    const tracker = document.getElementById("tracker");
    const focus = document.getElementById("focus");
    const main = document.querySelector(".main");
    const logo = document.getElementById("logo");
    const problemInput = document.getElementById("problemName");
    const platformInput = document.getElementById("platform");
    const addBtn = document.getElementById("addPractice");
    const list = document.getElementById("practiceList");
    const timerDisplay = document.getElementById("timer");
    const startBtn = document.getElementById("startFocus");
    const stopBtn = document.getElementById("stopFocus");
    const resetBtn = document.getElementById("resetFocus");

    let practices = JSON.parse(localStorage.getItem("practices")) || [];
    let focusTime = 25 * 60;
    let focusInterval = null;

    function startTyping() {
        const typingText = "Code in the dark. Track in silence.";
        const typingElement = document.getElementById("typingText");
        typingElement.textContent = "";
        let index = 0;
        const typingSpeed = 80;

        function type() {
            if (index < typingText.length) {
                typingElement.textContent += typingText.charAt(index);
                index++;
                setTimeout(type, typingSpeed);
            }
        }

        type();
    }

    function render() {
        list.innerHTML = "";
        document.getElementById("practiceCount").textContent = `You have ${practices.length} tasks.`;
        practices.forEach((p, index) => {
            const li = document.createElement("li");
            li.textContent = `${p.problem} (${p.platform})`;
            const del = document.createElement("span");
            del.textContent = "✖";
            del.onclick = () => {
                practices.splice(index, 1);
                save();
            };
            li.appendChild(del);
            list.appendChild(li);
        });
    }

    function save() {
        localStorage.setItem("practices", JSON.stringify(practices));
        render();
    }

    addBtn.addEventListener("click", () => {
        const problem = problemInput.value.trim();
        const platform = platformInput.value.trim();
        if (problem.length < 3 || platform.length < 2) return;
        practices.push({ problem, platform });
        save();
        problemInput.value = "";
        platformInput.value = "";
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
    });

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(focusTime);
    }

    function updateProgress() {
        const percent = ((25 * 60 - focusTime) / (25 * 60)) * 100;
        document.getElementById("progress").style.width = percent + "%";
    }

    function startFocusTimer() {
        if (focusInterval) return;
        focusInterval = setInterval(() => {
            if (focusTime > 0) {
                focusTime--;
                updateTimerDisplay();
                updateProgress();
            } else {
                clearInterval(focusInterval);
                focusInterval = null;
            }
        }, 1000);
    }

    function stopFocusTimer() {
        clearInterval(focusInterval);
        focusInterval = null;
    }

    function resetFocusTimer() {
        stopFocusTimer();
        focusTime = 25 * 60;
        updateTimerDisplay();
        updateProgress();
    }

    startBtn.addEventListener("click", startFocusTimer);
    stopBtn.addEventListener("click", stopFocusTimer);
    resetBtn.addEventListener("click", resetFocusTimer);

    function showTracker() {
        main.style.display = "none";
        focus.classList.add("hidden");
        tracker.classList.remove("hidden");
        localStorage.setItem("view", "tracker");
    }

    function showFocus() {
        main.style.display = "none";
        tracker.classList.add("hidden");
        focus.classList.remove("hidden");
        localStorage.setItem("view", "focus");
    }

    function showMain() {
        tracker.classList.add("hidden");
        focus.classList.add("hidden");
        main.style.display = "block";
        localStorage.setItem("view", "main");
        resetFocusTimer();
        startTyping();
    }

    trackerCard.addEventListener("click", showTracker);
    focusCard.addEventListener("click", showFocus);
    logo.addEventListener("click", showMain);

    const view = localStorage.getItem("view");
    if (view === "tracker") showTracker();
    else if (view === "focus") showFocus();
    else showMain();

    render();
    updateTimerDisplay();
    updateProgress();
});
