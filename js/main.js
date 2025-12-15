const trackerCard = document.getElementById("trackerCard");
const tracker = document.getElementById("tracker");
const main = document.querySelector(".main");

const problemInput = document.getElementById("problemName");
const platformInput = document.getElementById("platform");
const addBtn = document.getElementById("addPractice");
const list = document.getElementById("practiceList");

let practices = JSON.parse(localStorage.getItem("practices")) || [];

function render() {
    list.innerHTML = "";
    practices.forEach((p, index) => {
        const li = document.createElement("li");
        li.textContent = `${p.problem} (${p.platform})`;

        const del = document.createElement("span");
        del.textContent = " ✖";
        del.style.cursor = "pointer";
        del.style.color = "#ff5555";
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

function showTracker() {
    main.style.display = "none";
    tracker.classList.remove("hidden");
    localStorage.setItem("view", "tracker");
}

trackerCard.addEventListener("click", showTracker);


addBtn.addEventListener("click", () => {
    const problem = problemInput.value.trim();
    const platform = platformInput.value.trim();

    if (problem.length < 3 || platform.length < 2) return;

    practices.push({ problem, platform });
    save();

    problemInput.value = "";
    platformInput.value = "";
});

render();

const view = localStorage.getItem("view");
if (view === "tracker") {
    showTracker();
}
