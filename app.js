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
  const metricTrust = document.getElementById("metric-trust");
const metricBond = document.getElementById("metric-bond");
  const tickButton = document.getElementById("tick-button");
  const clearLogButton = document.getElementById("clear-log-button");
  const eventLog = document.getElementById("event-log");
  const companionStage = document.getElementById("companion-stage");

  if (!window.Jive) {
    engineStatus.textContent = "Jive failed to load.";
    throw new Error("Jive engine was not found. Check jive.js is loaded before app.js.");
  }

if (!window.RaisinRenderer) {
  engineStatus.textContent = "Raisin renderer failed to load.";
  throw new Error("RaisinRenderer was not found. Check raisinRenderer.js is loaded before app.js.");
}

const renderer = new window.RaisinRenderer(companionStage);

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
  renderer.setState(state);

  engineStatus.textContent = `Jive engine running · ${state.name} is ${state.action}`;

    currentEmotion.textContent = capitalise(state.emotion);
    currentThought.textContent = state.thought;

    renderMetric(metricEnergy, state.motives.energy);
    renderMetric(metricCuriosity, state.motives.curiosity);
    renderMetric(metricAffection, state.motives.affection);
    renderMetric(metricComfort, state.motives.comfort);
    renderMetric(metricTrust, state.relationship.trust);
renderMetric(metricBond, state.relationship.bond);
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

    let pressTimer = null;
  let pressStart = null;
  let lastTapAt = 0;

  function triggerInteraction(type) {
  const labels = {
    pet: "+ Affection",
    play: "+ Playfulness",
    comfort: "+ Comfort",
    call: "Raisin noticed you",
  };

  raisin.interact(type);
  pulseStage();
  showFloatingFeedback(labels[type] || type);
}

  companionStage.addEventListener("pointerdown", (event) => {
    pressStart = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };

    pressTimer = window.setTimeout(() => {
      triggerInteraction("comfort");
      pressTimer = null;
      pressStart = null;
    }, 650);
  });

  companionStage.addEventListener("pointerup", (event) => {
    if (!pressStart) return;

    if (pressTimer) {
      window.clearTimeout(pressTimer);
      pressTimer = null;
    }

    const dx = event.clientX - pressStart.x;
    const dy = event.clientY - pressStart.y;
    const distance = Math.hypot(dx, dy);
    const now = Date.now();

    if (distance > 55) {
      triggerInteraction("call");
      pressStart = null;
      return;
    }

    if (now - lastTapAt < 320) {
      triggerInteraction("play");
      lastTapAt = 0;
      pressStart = null;
      return;
    }

    triggerInteraction("pet");
    lastTapAt = now;
    pressStart = null;
  });

  companionStage.addEventListener("pointercancel", () => {
    if (pressTimer) {
      window.clearTimeout(pressTimer);
      pressTimer = null;
    }

    pressStart = null;
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
  renderer,
};
})();