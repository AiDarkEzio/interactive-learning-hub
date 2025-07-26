// assets/js/randomness-explained.js

// --- MARKOV CHAIN LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Model and State Variables ---
  let markovModel = new Map();
  let isModelTrained = false;
  let modelOrder = 2;
  let startWords = [];

  // --- DOM Element References ---
  const trainButton = document.getElementById("trainButton");
  const trainButtonText = document.getElementById("trainButtonText");
  const loader = document.getElementById("loader");
  const playground = document.getElementById("playground");
  const liveInput = document.getElementById("liveInput");
  const predictionsDiv = document.getElementById("predictions");
  const generateSentenceButton = document.getElementById(
    "generateSentenceButton"
  );
  const generatedSentenceDiv = document.getElementById("generatedSentence");
  const modelOrderSelect = document.getElementById("modelOrder");
  const trainingText = document.getElementById("trainingText");
  const trainStatus = document.getElementById("train-status");

  // --- Event Listeners ---
  if (trainButton) {
    trainButton.addEventListener("click", trainModel);
    liveInput.addEventListener("input", showPredictions);
    generateSentenceButton.addEventListener("click", generateFullSentence);
    modelOrderSelect.addEventListener("change", () => {
      modelOrder = parseInt(modelOrderSelect.value, 10);
      isModelTrained = false; // Require retraining
      playground.classList.add("disabled");
      trainStatus.textContent =
        "Model settings changed. Please retrain the engine.";
    });
  }

  // --- Core Functions ---
  function trainModel() {
    showLoading(true);
    markovModel.clear();
    startWords = [];

    // Use a timeout to allow the UI to update with the loader
    setTimeout(() => {
      const text = trainingText.value;
      // Tokenize: split by space/newline, handle punctuation as separate tokens
      const tokens = text
        .replace(/([.,!?;"])/g, " $1 ")
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (tokens.length < modelOrder + 1) {
        trainStatus.textContent =
          "Training text is too short for the selected model order.";
        showLoading(false);
        return;
      }

      // Build frequency map
      for (let i = 0; i <= tokens.length - modelOrder; i++) {
        const ngram = tokens.slice(i, i + modelOrder).join(" ");
        const nextWord = tokens[i + modelOrder];

        if (i === 0 || tokens[i - 1].match(/[.!?]/)) {
          startWords.push(ngram);
        }

        if (!markovModel.has(ngram)) {
          markovModel.set(ngram, new Map());
        }
        const nextWordMap = markovModel.get(ngram);
        nextWordMap.set(nextWord, (nextWordMap.get(nextWord) || 0) + 1);
      }

      isModelTrained = true;
      playground.classList.remove("disabled");
      trainStatus.textContent = `Engine trained successfully with ${markovModel.size} unique word sequences!`;
      showLoading(false);
    }, 100); // Short delay for UX
  }

  function showPredictions() {
    if (!isModelTrained) return;

    const text = liveInput.value;
    const tokens = text.trim().split(/\s+/);
    if (tokens.length < modelOrder) {
      predictionsDiv.innerHTML = "<p>Keep typing to see predictions...</p>";
      return;
    }

    const key = tokens.slice(-modelOrder).join(" ");

    if (markovModel.has(key)) {
      const predictions = getTopPredictions(key);
      let html = "<ol>";
      predictions.forEach((p) => {
        html += `<li>${p.word} <span class="prob">(${(p.prob * 100).toFixed(
          1
        )}%)</span></li>`;
      });
      html += "</ol>";
      predictionsDiv.innerHTML = html;
    } else {
      predictionsDiv.innerHTML =
        "<p>No prediction available for this sequence.</p>";
    }
  }

  function generateFullSentence() {
    if (!isModelTrained || startWords.length === 0) {
      generatedSentenceDiv.textContent = "Please train the model first.";
      return;
    }

    let currentNgram =
      startWords[Math.floor(Math.random() * startWords.length)];
    let result = currentNgram.split(" ");

    for (let i = 0; i < 50; i++) {
      // Max sentence length
      const nextWord = predictNextWord(currentNgram);
      if (!nextWord) break;

      result.push(nextWord);

      if (nextWord.match(/[.!?]/)) break; // End on punctuation

      currentNgram = result.slice(-modelOrder).join(" ");
    }

    generatedSentenceDiv.textContent = result
      .join(" ")
      .replace(/\s+([.,!?;"])/g, "$1");
  }

  // --- Helper Functions ---
  function getTopPredictions(key) {
    const nextWordMap = markovModel.get(key);
    let total = 0;
    for (let count of nextWordMap.values()) {
      total += count;
    }

    const probabilities = [];
    for (let [word, count] of nextWordMap.entries()) {
      probabilities.push({
        word,
        prob: count / total,
      });
    }

    return probabilities.sort((a, b) => b.prob - a.prob).slice(0, 3);
  }

  function predictNextWord(key) {
    if (!markovModel.has(key)) return null;

    const nextWordMap = markovModel.get(key);
    const weightedList = [];
    for (const [word, count] of nextWordMap.entries()) {
      for (let i = 0; i < count; i++) {
        weightedList.push(word);
      }
    }
    return weightedList[Math.floor(Math.random() * weightedList.length)];
  }

  function showLoading(isLoading) {
    if (isLoading) {
      trainButtonText.classList.add("hidden");
      loader.classList.remove("hidden");
      trainButton.disabled = true;
    } else {
      trainButtonText.classList.remove("hidden");
      loader.classList.add("hidden");
      trainButton.disabled = false;
    }
  }
});

// --- COIN FLIP LOGIC ---
let headsCount = 0;
let tailsCount = 0;
let totalFlips = 0;

function flipCoin() {
  const isHeads = Math.random() < 0.5;
  totalFlips++;
  if (isHeads) headsCount++;
  else tailsCount++;
  updateCoinStats();
}

async function runBulkFlip() {
  const flipsInput = document.getElementById("flipsInput");
  let numberOfFlips = parseInt(flipsInput.value, 10) || 500;

  for (let i = 0; i < numberOfFlips; i++) {
    const isHeads = Math.random() < 0.5;
    totalFlips++;
    if (isHeads) headsCount++;
    else tailsCount++;
    if (i % 20 === 0) {
      // Update UI periodically to prevent slowdown
      updateCoinStats();
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }
  updateCoinStats(); // Final update
}

function resetCoinStats() {
  headsCount = 0;
  tailsCount = 0;
  totalFlips = 0;
  updateCoinStats();
}

function updateCoinStats() {
  document.getElementById("headsCount").textContent = headsCount;
  document.getElementById("tailsCount").textContent = tailsCount;
  document.getElementById("totalFlips").textContent = totalFlips;

  const headsPercent = totalFlips > 0 ? (headsCount / totalFlips) * 100 : 0;
  const tailsPercent = totalFlips > 0 ? (tailsCount / totalFlips) * 100 : 0;

  document.getElementById("headsPercent").textContent =
    headsPercent.toFixed(1) + "%";
  document.getElementById("tailsPercent").textContent =
    tailsPercent.toFixed(1) + "%";

  const maxHeight = 250;
  document.getElementById("headsBar").style.height =
    (headsPercent / 100) * maxHeight + "px";
  document.getElementById("tailsBar").style.height =
    (tailsPercent / 100) * maxHeight + "px";
}

// --- PAGERANK LOGIC ---
let surfingInterval;
let pageVisits = { Amy: 0, Ben: 0, Chris: 0, Dan: 0 };
let totalVisits = 0;
let currentPage = "Amy";
const DAMPING_FACTOR = 0.85;

const links = {
  Amy: ["Ben"],
  Ben: ["Amy", "Chris", "Dan"],
  Chris: ["Dan"],
  Dan: ["Amy", "Ben"],
};

const networkDiagram = document.getElementById("networkDiagram");
const svgCanvas = document.getElementById("link-canvas");
const surferDot = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "circle"
);
let nodeElements = {};
let nodePositions = {};

function getNodePositions() {
  if (!networkDiagram) return;
  const diagramRect = networkDiagram.getBoundingClientRect();
  document.querySelectorAll(".node").forEach((node) => {
    const name = node.dataset.name;
    nodeElements[name] = node;
    const rect = node.getBoundingClientRect();
    nodePositions[name] = {
      x: rect.left + rect.width / 2 - diagramRect.left,
      y: rect.top + rect.height / 2 - diagramRect.top,
    };
  });
}

function drawLinks() {
  if (!svgCanvas) return;
  svgCanvas.innerHTML = ""; // Clear old links, but not the dot which is re-appended

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("refX", "8");
  marker.setAttribute("refY", "3.5");
  marker.setAttribute("orient", "auto");
  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
  polygon.style.fill = "#4ecdc4";
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svgCanvas.appendChild(defs);

  for (const startNode in links) {
    for (const endNode of links[startNode]) {
      const pos1 = nodePositions[startNode];
      const pos2 = nodePositions[endNode];
      if (!pos1 || !pos2) continue;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
      const nodeRadius = 40;
      const startX = pos1.x + nodeRadius * Math.cos(angle);
      const startY = pos1.y + nodeRadius * Math.sin(angle);
      const endX = pos2.x - nodeRadius * Math.cos(angle);
      const endY = pos2.y - nodeRadius * Math.sin(angle);

      line.setAttribute("x1", startX);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", endX);
      line.setAttribute("y2", endY);
      line.setAttribute("marker-end", "url(#arrowhead)");
      svgCanvas.appendChild(line);
    }
  }
  svgCanvas.appendChild(surferDot); // Ensure dot is on top
}

function startSurfing() {
  pageVisits = { Amy: 0, Ben: 0, Chris: 0, Dan: 0 };
  totalVisits = 0;
  currentPage = "Amy";
  if (surfingInterval) clearInterval(surfingInterval);

  surfingInterval = setInterval(() => {
    totalVisits++;
    pageVisits[currentPage]++;

    Object.values(nodeElements).forEach((node) =>
      node.classList.remove("active")
    );
    if (nodeElements[currentPage]) {
      const currentPos = nodePositions[currentPage];
      surferDot.setAttribute("cx", currentPos.x);
      surferDot.setAttribute("cy", currentPos.y);
      nodeElements[currentPage].classList.add("active");
    }

    updatePageRankChart();

    let nextPage;
    if (Math.random() < DAMPING_FACTOR && links[currentPage]?.length > 0) {
      const possibleLinks = links[currentPage];
      nextPage =
        possibleLinks[Math.floor(Math.random() * possibleLinks.length)];
    } else {
      const pages = Object.keys(links);
      nextPage = pages[Math.floor(Math.random() * pages.length)];
    }
    currentPage = nextPage;

    if (totalVisits >= 500) {
      clearInterval(surfingInterval);
      Object.values(nodeElements).forEach((node) =>
        node.classList.remove("active")
      );
    }
  }, 200);
}

function updatePageRankChart() {
  Object.keys(pageVisits).forEach((page) => {
    const percentage =
      totalVisits > 0 ? (pageVisits[page] / totalVisits) * 100 : 0;
    const bar = document.getElementById(`${page.toLowerCase()}Bar`);
    const value = document.getElementById(`${page.toLowerCase()}Value`);
    if (bar) bar.style.width = `${percentage}%`;
    if (value) value.textContent = `${percentage.toFixed(1)}%`;
  });
}

// --- CONSOLIDATED DOMCONTENTLOADED FOR ALL INITIALIZATIONS ---
document.addEventListener("DOMContentLoaded", function () {
  // --- Timeline Initialization ---
  const timelineData = [
    {
      date: "January 22, 1905",
      title: "Bloody Sunday",
      description:
        "The revolution begins. Unarmed demonstrators are fired upon by Imperial Guard soldiers, shattering the Tsar's image and sparking nationwide outrage.",
    },
    {
      date: "June 14, 1905",
      title: "Mutiny on the Battleship Potemkin",
      description:
        "Sailors mutiny against their officers, a potent symbol of rebellion spreading through the Russian military and inspiring further unrest.",
    },
    {
      date: "October 1905",
      title: "The Great October Strike",
      description:
        "A massive general strike paralyzes the Russian Empire, shutting down railways and factories, and forcing the government to a breaking point.",
    },
    {
      date: "October 17, 1905",
      title: "The October Manifesto",
      description:
        "Tsar Nicholas II reluctantly grants civil liberties—including freedom of speech and an elected legislature (the Duma)—in response to the strike.",
    },
    {
      date: "December 7-18, 1905",
      title: "Moscow Uprising",
      description:
        "Radical socialists launch an armed uprising in Moscow, which is brutally crushed by loyalist troops, marking the violent climax of the revolution.",
    },
    {
      date: "1906 and beyond",
      title: "The Mathematical Fallout",
      description:
        "The deep political divisions seep into academia, intensifying the clash between Nekrasov and Markov and leading Markov to develop his groundbreaking work on Markov Chains.",
    },
  ];
  const pointsContainer = document.getElementById("timelinePoints");
  const titleEl = document.getElementById("timelineTitle");
  const descriptionEl = document.getElementById("timelineDescription");

  if (pointsContainer) {
    timelineData.forEach((event, index) => {
      const point = document.createElement("div");
      point.className = "timeline-point";
      point.dataset.index = index;
      point.addEventListener("click", () => {
        const eventData = timelineData[index];
        titleEl.textContent = `${eventData.title} (${eventData.date})`;
        descriptionEl.textContent = eventData.description;
        document
          .querySelectorAll(".timeline-point")
          .forEach((p) => p.classList.remove("active"));
        point.classList.add("active");
      });
      pointsContainer.appendChild(point);
    });
    // FIX: Display the first timeline event on page load
    const firstPoint = pointsContainer.querySelector(".timeline-point");
    if (firstPoint) {
      firstPoint.click();
    }
  }

  // --- Monte Carlo Simulator Initialization ---
  const analogySection = document.getElementById("solitaireAnalogy");
  const tryItButton = document.getElementById("tryItButton");
  const solitaireResult = document.getElementById("solitaireResult");
  const solitaireTransition = document.getElementById("solitaireTransition");
  const simulatorSection = document.getElementById("neutronSimulator");
  const canvas = document.getElementById("neutronCanvas");
  const fissionSlider = document.getElementById("fissionSlider");
  const fissionValue = document.getElementById("fissionValue");
  const sizeSlider = document.getElementById("sizeSlider");
  const sizeValue = document.getElementById("sizeValue");
  const runSingleSimBtn = document.getElementById("runSingleNeutronSim");
  const runBulkSimBtn = document.getElementById("runBulkNeutronSim");
  const kFactorDisplay = document.getElementById("kFactor");
  const statusDisplay = document.getElementById("reactionStatus");
  const failedBar = document.getElementById("failedBar");
  const sustainedBar = document.getElementById("sustainedBar");
  const ahaMoment = document.getElementById("ahaMoment");

  if (simulatorSection && canvas) {
    const ctx = canvas.getContext("2d");
    let p_fission = 0.3;
    const maxCoreRadius = canvas.width / 2 - 10;
    let coreRadius = maxCoreRadius * 0.5;
    let animationFrameId = null; // FIXED: Added missing variable declaration

    const showAnalogy = () => {
      solitaireResult.textContent =
        "Is this layout winnable? It's hard to tell. Calculating the exact odds is nearly impossible.";
      solitaireTransition.classList.remove("hidden");
      solitaireTransition.classList.add("highlight-insight");
      tryItButton.textContent = "Proceed to the Real Problem";
      tryItButton.onclick = () => {
        analogySection.classList.add("hidden");
        simulatorSection.classList.remove("hidden");
      };
    };

    const updateFissionProb = () => {
      p_fission = parseInt(fissionSlider.value) / 100;
      fissionValue.textContent = `${fissionSlider.value}%`;
      checkGlow();
    };
    const updateCoreSize = () => {
      coreRadius = maxCoreRadius * (parseInt(sizeSlider.value) / 100);
      sizeValue.textContent = `${sizeSlider.value}%`;
      drawInitialState();
      checkGlow();
    };

    const checkGlow = () => {
      const p_escape_estimate = 0.8 * (1 - coreRadius / maxCoreRadius);
      const k_estimate = (p_fission * 2.5) / (p_fission + p_escape_estimate);
      canvas.classList.toggle("glowing", k_estimate > 0.95);
    };

    const drawInitialState = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#4ecdc4";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, coreRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const getNeutronFate = () => {
      const p_escape = 0.8 * (1 - coreRadius / maxCoreRadius);
      const rand = Math.random();
      if (rand < p_fission) return "fission";
      if (rand < p_fission + p_escape) return "escape";
      return "absorb";
    };

    const updateResults = (k) => {
      kFactorDisplay.textContent = k;
      if (k > 1.0) {
        statusDisplay.textContent = "SUSTAINED";
        statusDisplay.className = "status-sustained";
      } else {
        statusDisplay.textContent = "FAILED";
        statusDisplay.className = "status-failed";
      }
    };

    // --- FIXED: Improved Animation Functions ---
    function drawSimulationFrame(neutrons) {
      drawInitialState();
      neutrons.forEach((n) => {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    async function animateFlash(x, y, color) {
      return new Promise((resolve) => {
        let r = 1;
        const flashStep = () => {
          if (r >= 20) {
            drawInitialState();
            resolve();
            return;
          }

          drawInitialState();
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.globalAlpha = 1 - r / 20;
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          r += 2;
          animationFrameId = requestAnimationFrame(flashStep);
        };
        flashStep();
      });
    }

    async function runSingleAnimatedSimulation() {
      // FIXED: Clear any existing animations
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      runSingleSimBtn.disabled = true;
      runBulkSimBtn.disabled = true;

      // Set neutral "simulating" state
      kFactorDisplay.textContent = "--";
      statusDisplay.textContent = "SIMULATING...";
      statusDisplay.className = "status-pending";
      drawInitialState();

      let neutrons = [
        { x: canvas.width / 2, y: canvas.height / 2, alive: true },
      ];
      const initialNeutrons = neutrons.length;
      let finalNeutronCount = 0;

      // Show the initial neutron
      drawSimulationFrame(neutrons);
      await new Promise((res) => setTimeout(res, 500));

      // FIXED: Better animation loop with proper timing
      for (let generation = 0; generation < 8; generation++) {
        if (neutrons.length === 0) break;

        const nextGeneration = [];

        // Process each neutron in the current generation
        for (const n of neutrons) {
          const result = getNeutronFate();

          if (result === "fission") {
            const newNeutronsCount = Math.random() < 0.5 ? 2 : 3;
            for (let i = 0; i < newNeutronsCount; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.min(30, coreRadius / 3);
              const newX = Math.max(
                40,
                Math.min(canvas.width - 40, n.x + Math.cos(angle) * dist)
              );
              const newY = Math.max(
                40,
                Math.min(canvas.height - 40, n.y + Math.sin(angle) * dist)
              );
              nextGeneration.push({
                x: newX,
                y: newY,
                alive: true,
              });
            }
            await animateFlash(n.x, n.y, "#50fa7b"); // Green flash for fission
          } else if (result === "escape") {
            await animateFlash(n.x, n.y, "#4ecdc4"); // Blue flash for escape
          } else {
            // absorb
            await animateFlash(n.x, n.y, "#ff6b6b"); // Red flash for absorption
          }

          // Small pause between neutron fates
          await new Promise((res) => setTimeout(res, 100));
        }

        neutrons = nextGeneration;
        finalNeutronCount = neutrons.length;

        // Draw the new generation of neutrons
        if (neutrons.length > 0) {
          drawSimulationFrame(neutrons);
          await new Promise((res) => setTimeout(res, 600));
        }
      }

      const kFactor = (finalNeutronCount / initialNeutrons).toFixed(2);
      updateResults(kFactor);

      runSingleSimBtn.disabled = false;
      runBulkSimBtn.disabled = false;
    }

    const runBulkSimulations = () => {
      runSingleSimBtn.disabled = true;
      runBulkSimBtn.disabled = true;

      let sustainedCount = 0;
      for (let i = 0; i < 100; i++) {
        let neutronCount = 1;
        for (let gen = 0; gen < 10; gen++) {
          if (neutronCount === 0) break;
          let nextGenCount = 0;
          for (let n = 0; n < neutronCount; n++) {
            if (getNeutronFate() === "fission")
              nextGenCount += Math.random() < 0.5 ? 2 : 3;
          }
          neutronCount = nextGenCount;
        }
        if (neutronCount > 1) sustainedCount++;
      }

      const successRate = sustainedCount / 100;
      const avgK =
        (sustainedCount / 100) * 2 + ((100 - sustainedCount) / 100) * 0.3;

      failedBar.style.height = `${(1 - successRate) * 100}%`;
      sustainedBar.style.height = `${successRate * 100}%`;

      kFactorDisplay.textContent = avgK.toFixed(2);
      if (avgK > 1.0) {
        statusDisplay.textContent = "SUSTAINED";
        statusDisplay.className = "status-sustained";
      } else {
        statusDisplay.textContent = "FAILED";
        statusDisplay.className = "status-failed";
      }

      ahaMoment.classList.toggle("hidden", successRate < 0.7);
      runSingleSimBtn.disabled = false;
      runBulkSimBtn.disabled = false;
    };

    if (tryItButton) tryItButton.addEventListener("click", showAnalogy);
    if (fissionSlider)
      fissionSlider.addEventListener("input", updateFissionProb);
    if (sizeSlider) sizeSlider.addEventListener("input", updateCoreSize);
    if (runSingleSimBtn)
      runSingleSimBtn.addEventListener("click", runSingleAnimatedSimulation);
    if (runBulkSimBtn)
      runBulkSimBtn.addEventListener("click", runBulkSimulations);

    // Initialize
    drawInitialState();
    updateFissionProb();
    updateCoreSize();
  }

  // --- PageRank Initialization ---
  if (networkDiagram) {
    surferDot.setAttribute("r", "8");
    surferDot.setAttribute("class", "surfer-dot");
    svgCanvas.appendChild(surferDot);

    const initializePageRank = () => {
      getNodePositions();
      drawLinks();
      updatePageRankChart();

      // Position the surfer dot on the initial node ("Amy") on page load
      const initialPage = "Amy";
      const initialPos = nodePositions[initialPage];
      if (initialPos) {
        surferDot.setAttribute("cx", initialPos.x);
        surferDot.setAttribute("cy", initialPos.y);
        surferDot.style.opacity = 1;
        if (nodeElements[initialPage]) {
          Object.values(nodeElements).forEach((node) =>
            node.classList.remove("active")
          );
          nodeElements[initialPage].classList.add("active");
        }
      }
    };

    initializePageRank();
    window.addEventListener("resize", initializePageRank);
  }
});
