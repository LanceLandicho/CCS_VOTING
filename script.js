/* ==============================
   SIDEBAR NAVIGATION
============================== */
const sections = {
  upload: document.getElementById("uploadSection"),
  emails: document.getElementById("emailsSection"),
  results: document.getElementById("resultsSection"),
  stats: document.getElementById("statsSection")
};

if (document.getElementById("uploadCandidatesBtn")) {
  document.getElementById("uploadCandidatesBtn").onclick = () => showSection("upload");
  document.getElementById("viewEmailsBtn").onclick = () => showSection("emails");
  document.getElementById("viewResultsBtn").onclick = () => showSection("results");
  document.getElementById("voteStatsBtn").onclick = () => showSection("stats");
}

function showSection(name) {
  Object.values(sections).forEach(sec => sec.classList.add("hidden"));
  sections[name].classList.remove("hidden");
}

/* ==============================
   CANDIDATE UPLOAD (ADMIN)
============================== */
const form = document.getElementById("candidateForm");
const candidateList = document.getElementById("candidateList");
let candidates = JSON.parse(localStorage.getItem("candidates")) || [];

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const position = document.getElementById("position").value;
    const name = document.getElementById("candidateName").value.trim();
    const partylist = document.getElementById("candidatePartylist").value.trim();

    if (position && name && partylist) {
      candidates.push({ position, name, partylist });
      localStorage.setItem("candidates", JSON.stringify(candidates));
      renderCandidates();
      form.reset();
      alert("✅ Candidate added successfully!");
    } else {
      alert("⚠️ Please fill in all fields.");
    }
  });
}

function renderCandidates() {
  if (!candidateList) return;
  candidateList.innerHTML = "";
  if (candidates.length === 0) {
    candidateList.innerHTML = "<li>No candidates added yet.</li>";
    return;
  }
  candidates.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.position}: ${c.name} (${c.partylist})`;
    candidateList.appendChild(li);
  });
}
renderCandidates();

/* ==============================
   STUDENT EMAIL LIST (ADMIN)
============================== */
const emailList = document.getElementById("emailList");
let users = JSON.parse(localStorage.getItem("users")) || [];

function renderEmails() {
  if (!emailList) return;
  emailList.innerHTML = "";
  if (users.length === 0) {
    emailList.innerHTML = "<li>No registered students yet.</li>";
    return;
  }
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.fullName} (${u.email})`;
    emailList.appendChild(li);
  });
}
renderEmails();

/* ==============================
   RESULTS DISPLAY (ADMIN)
============================== */
const resultsContainer = document.getElementById("resultsContainer");

function renderResults() {
  if (!resultsContainer) return;

  let votes = JSON.parse(localStorage.getItem("votes")) || {};
  resultsContainer.innerHTML = "";

  if (candidates.length === 0) {
    resultsContainer.innerHTML = "<p>No candidates to show results for.</p>";
    return;
  }

  const positions = [...new Set(candidates.map(c => c.position))];
  positions.forEach(position => {
    const posDiv = document.createElement("div");
    posDiv.classList.add("result-block");
    posDiv.innerHTML = `<h3>${position}</h3>`;

    const positionCandidates = candidates.filter(c => c.position === position);
    positionCandidates.forEach(c => {
      const voteCount = votes[c.name] || 0;
      const p = document.createElement("p");
      p.textContent = `${c.name} (${c.partylist}) — ${voteCount} votes`;
      posDiv.appendChild(p);
    });

    resultsContainer.appendChild(posDiv);
  });
}
renderResults();

/* ==============================
   CHART STATISTICS (ADMIN)
============================== */
function renderChart() {
  const ctx = document.getElementById("voteChart");
  if (!ctx) return; // Avoid error if chart is not on this page

  const votes = JSON.parse(localStorage.getItem("votes")) || {};
  if (Object.keys(votes).length === 0) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(votes),
      datasets: [{
        label: 'Votes Received',
        data: Object.values(votes),
        backgroundColor: '#ff8c42'
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { labels: { color: '#fff' } },
        title: { display: true, text: 'Voting Statistics', color: '#fff' }
      }
    }
  });
}
renderChart();

/* ==============================
   VOTING PAGE (VOTERS)
============================== */
const voteForm = document.getElementById("voteForm");
if (voteForm) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    alert("⚠️ You must log in first!");
    window.location.href = "login.html";
  }

  const candidates = JSON.parse(localStorage.getItem("candidates")) || [];

  // Group candidates by position
  const grouped = candidates.reduce((acc, c) => {
    if (!acc[c.position]) acc[c.position] = [];
    acc[c.position].push({ name: c.name, partylist: c.partylist });
    return acc;
  }, {});

  // Dynamically render positions and candidates
  Object.entries(grouped).forEach(([position, list]) => {
    const div = document.createElement("div");
    div.classList.add("position");
    div.innerHTML = `<h3>${position}</h3>`;

    list.forEach(c => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="${position}" value="${c.name}" required>
        ${c.name} (${c.partylist})
      `;
      div.appendChild(label);
    });

    voteForm.appendChild(div);
  });

  // Handle voting
  voteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const votes = JSON.parse(localStorage.getItem("votes")) || {};
    const formData = new FormData(voteForm);

    for (let [position, name] of formData.entries()) {
      votes[name] = (votes[name] || 0) + 1;
    }

    localStorage.setItem("votes", JSON.stringify(votes));
    alert("✅ Your vote has been submitted successfully!");
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}
