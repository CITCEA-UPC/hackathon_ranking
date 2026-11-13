"use strict";

const WEIGHTS = Object.freeze({
  damping: 0.35,
  loss: 0.25,
  robustness: 0.25,
  changes: 0.15,
});

const rankingBody = document.querySelector("#ranking-body");
const searchInput = document.querySelector("#team-search");
const refreshButton = document.querySelector("#refresh-button");
const statusMessage = document.querySelector("#status");
const emptyState = document.querySelector("#empty-state");

let globalRanking = [];

/** Calculates the official score on a 100-point scale. */
function calculateScore(team) {
  return (
    WEIGHTS.damping * team.damping +
    WEIGHTS.loss * team.loss +
    WEIGHTS.robustness * team.robustness +
    WEIGHTS.changes * team.changes
  ) * 100;
}

function isValidTeam(team) {
  const metricKeys = Object.keys(WEIGHTS);
  return (
    team &&
    typeof team.name === "string" &&
    team.name.trim().length > 0 &&
    metricKeys.every(
      (key) => typeof team[key] === "number" && team[key] >= 0 && team[key] <= 1,
    )
  );
}

function normalizeForSearch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en");
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function getRankLabel(position) {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[position - 1] ?? String(position);
}

/** Creates cells with textContent to prevent HTML injection from JSON data. */
function createCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function renderRanking() {
  const query = normalizeForSearch(searchInput.value.trim());
  const visibleTeams = globalRanking.filter(({ name }) =>
    normalizeForSearch(name).includes(query),
  );

  const fragment = document.createDocumentFragment();

  visibleTeams.forEach((team) => {
    const row = document.createElement("tr");
    const position = team.globalPosition;

    if (position <= 3) row.classList.add(`podium-${position}`);

    row.append(
      createCell(getRankLabel(position), position <= 3 ? "rank medal" : "rank"),
      createCell(team.name, "team-name"),
      createCell(
        formatPercentage(team.damping),
        team.damping === 0 ? "unstable" : "",
      ),
      createCell(formatPercentage(team.loss)),
      createCell(formatPercentage(team.robustness)),
      createCell(formatPercentage(team.changes)),
      createCell(team.score.toFixed(2), "score"),
    );

    fragment.append(row);
  });

  rankingBody.replaceChildren(fragment);
  emptyState.hidden = visibleTeams.length !== 0;
}

async function loadRanking() {
  refreshButton.disabled = true;
  refreshButton.setAttribute("aria-busy", "true");
  statusMessage.classList.remove("error");
  statusMessage.textContent = "Loading results…";

  try {
    // The timestamp forces a fresh request after every Vercel deployment.
    const response = await fetch(`ranking.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("The JSON file does not contain an array.");

    const invalidTeams = data.filter((team) => !isValidTeam(team));
    if (invalidTeams.length > 0) {
      throw new Error("Some teams have incomplete data or metrics outside the [0, 1] range.");
    }

    globalRanking = data
      .map((team) => ({ ...team, score: calculateScore(team) }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "en"))
      .map((team, index) => ({ ...team, globalPosition: index + 1 }));

    renderRanking();
    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    statusMessage.textContent = `${globalRanking.length} teams · Data updated at ${time}`;
  } catch (error) {
    console.error("The leaderboard could not be loaded:", error);
    statusMessage.classList.add("error");
    statusMessage.textContent =
      "The data could not be loaded. Check ranking.json or try again.";
  } finally {
    refreshButton.disabled = false;
    refreshButton.removeAttribute("aria-busy");
  }
}

searchInput.addEventListener("input", renderRanking);
refreshButton.addEventListener("click", loadRanking);

loadRanking();
