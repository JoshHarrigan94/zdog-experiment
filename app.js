/*
  Project Jive
  App connection layer v0.1

  Connects:
  jive.js engine
  ↓
  index.html interface
*/

(function () {
  "use strict";

  const engineStatus = document.getElementById("engine-status");
  const currentEmotion = document.getElementById("current-emotion");
  const currentThought = document.getElementById("current-thought");

  const metricEnergy = document.getElementById("metric-energy");
  const metricCuriosity = document.getElementById("metric-curiosity");
  const metricAffection = document.getElementById("metric-affection");
  const metricComfort = document.getElementById("metric-comfort");

  const tickButton = document.getElementById("tick-button");
  const clearLogButton = document.getElementById("clear-log-button");
  const eventLog = document.getElementById("event-log");
  const companionStage = document.getElementById("companion-stage");

  if (!window.Jive) {
    engineStatus.textContent = "Jive failed to load.";
    throw new Error("Jive engine was not found. Check jive.js is loaded before app.js.");
  }

  const engine = new window.Jive.Engine({
    tickRate: 2200,
  });

  const raisin = engine.createCompanion({
    name: "Raisin",
    energy: 72,
    curiosity: 86,
    affection: 52,
    comfort: 64,
    playfulness: 78,
    confidence: 58,
  });

  function round(value) {
    return Math.round(value);
  }

  function renderMetric(element, value) {
    element.textContent = round(value);
  }

  function renderState(state) {
    engineStatus.textContent = `Jive engine running · ${state.name} is ${state.action}`;

    currentEmotion.textContent = capitalise(state.emotion);
    currentThought.textContent = state.thought;

    renderMetric(metricEnergy, state.motives.energy);
    renderMetric(metricCuriosity, state.motives.curiosity);
    renderMetric(metricAffection, state.motives.affection);
    renderMetric(metricComfort, state.motives.comfort);

    companionStage.dataset.emotion = state.emotion;
  }

  function renderEvent(event) {
    const item = document.createElement("li");
    const time = new Date(event.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    item.textContent = `[${time}] ${event.message || event.type}`;

    eventLog.prepend(item);

    while (eventLog.children.length > 8) {
      eventLog.removeChild(eventLog.lastElementChild);
    }
  }

  function capitalise(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function pulseStage() {
    companionStage.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.015)" },
        { transform: "scale(1)" },
      ],
      {
        duration: 260,
        easing: "cubic-bezier(.2,.8,.2,1)",
      }
    );
  }

  raisin.on("state", (event) => {
    renderState(event);
  });

  raisin.on("event", (event) => {
    renderEvent(event);
  });

  tickButton.addEventListener("click", () => {
    engine.tick("manual");
    pulseStage();
  });

  clearLogButton.addEventListener("click", () => {
    eventLog.innerHTML = "";
    renderEvent({
      time: Date.now(),
      message: "Event stream cleared.",
    });
  });

  companionStage.addEventListener("click", () => {
    raisin.interact("pet");
    pulseStage();
  });

  companionStage.addEventListener("dblclick", () => {
    raisin.interact("play");
    pulseStage();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "p") {
      raisin.interact("pet");
    }

    if (event.key.toLowerCase() === "c") {
      raisin.interact("call");
    }

    if (event.key.toLowerCase() === "t") {
      raisin.interact("play");
    }

    if (event.key.toLowerCase() === "m") {
      engine.tick("manual");
    }
  });

  renderEvent({
    time: Date.now(),
    message: "App connected to Jive.",
  });

  renderState(raisin.getState());
  engine.start();

  window.ProjectJive = {
    engine,
    raisin,
  };
})();