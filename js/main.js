const trackerCard = document.getElementById("trackerCard");
const tracker = document.getElementById("tracker");
const main = document.querySelector(".main");

const problemInput = document.getElementById("problemName");
const platformInput = document.getElementById("platform");
const addBtn = document.getElementById("addPractice");
const list = document.getElementById("practiceList");

trackerCard.addEventListener("click", () => {
    main.style.display = "none";
    tracker.classList.remove("hidden");
});

addBtn.addEventListener("click", () => {
    const problem = problemInput.value.trim();
    const platform = platformInput.value.trim();

    if (problem === "" || platform === "") return;

    const li = document.createElement("li");
    li.textContent = `${problem} (${platform})`;

    list.appendChild(li);

    problemInput.value = "";
    platformInput.value = "";
});
