/* 
  Project Jive
  Core behaviour engine v0.1

  This file does not render Raisin yet.
  It creates the living simulation layer:
  state → motivation drift → emotion → behaviour → events
*/

(function () {
  "use strict";

  const clamp = (value, min = 0, max = 100) => {
    return Math.max(min, Math.min(max, value));
  };

  const randomBetween = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const now = () => Date.now();

  class JiveCompanion {
    constructor(options = {}) {
      this.name = options.name || "Raisin";

      this.createdAt = now();
      this.lastTickAt = now();

      this.motives = {
        energy: options.energy ?? 72,
        curiosity: options.curiosity ?? 84,
        affection: options.affection ?? 48,
        comfort: options.comfort ?? 64,
        playfulness: options.playfulness ?? 76,
        confidence: options.confidence ?? 58,
      };

      this.emotion = "waking";
      this.currentAction = "booting";
      this.currentThought = "I am becoming aware of the room.";

      this.memory = {
        totalTicks: 0,
        totalInteractions: 0,
        lastInteraction: null,
        favouriteInteraction: null,
        interactionCounts: {},
      };

      this.events = [];
      this.listeners = {};
    }

    on(eventName, callback) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }

      this.listeners[eventName].push(callback);

      return () => {
        this.listeners[eventName] = this.listeners[eventName].filter(
          (listener) => listener !== callback
        );
      };
    }

    emit(eventName, payload = {}) {
      const event = {
        type: eventName,
        time: now(),
        companion: this.name,
        ...payload,
      };

      if (eventName !== "state") {
        this.events.unshift(event);
        this.events = this.events.slice(0, 30);
      }

      const listeners = this.listeners[eventName] || [];

      listeners.forEach((callback) => {
        callback(event);
      });

      const allListeners = this.listeners["*"] || [];

      allListeners.forEach((callback) => {
        callback(event);
      });
    }

    tick(forceReason = "ambient") {
      const currentTime = now();
      const deltaMs = currentTime - this.lastTickAt;
      this.lastTickAt = currentTime;

      this.memory.totalTicks += 1;

      this.driftMotivations(deltaMs);
      this.deriveEmotion();
      this.chooseAction(forceReason);

      this.emit("state", this.getState());

      if (forceReason !== "ambient") {
        this.emit("event", {
          message: `${this.name} had a manual simulation tick.`,
          reason: forceReason,
        });
      }

      return this.getState();
    }

    driftMotivations(deltaMs) {
      const seconds = Math.max(deltaMs / 1000, 1);

      this.motives.energy = clamp(
        this.motives.energy - randomBetween(0.03, 0.12) * seconds
      );

      this.motives.curiosity = clamp(
        this.motives.curiosity + randomBetween(-0.18, 0.22) * seconds
      );

      this.motives.affection = clamp(
        this.motives.affection - randomBetween(0.01, 0.04) * seconds
      );

      this.motives.comfort = clamp(
        this.motives.comfort + randomBetween(-0.08, 0.1) * seconds
      );

      this.motives.playfulness = clamp(
        this.motives.playfulness + randomBetween(-0.16, 0.14) * seconds
      );

      this.motives.confidence = clamp(
        this.motives.confidence + randomBetween(-0.08, 0.09) * seconds
      );
    }

    deriveEmotion() {
      const m = this.motives;

      if (m.energy < 24) {
        this.emotion = "sleepy";
        return;
      }

      if (m.comfort < 28 || m.confidence < 25) {
        this.emotion = "uncertain";
        return;
      }

      if (m.affection > 75 && m.playfulness > 60) {
        this.emotion = "excited";
        return;
      }

      if (m.curiosity > 78) {
        this.emotion = "curious";
        return;
      }

      if (m.comfort > 78 && m.energy < 55) {
        this.emotion = "settled";
        return;
      }

      if (m.playfulness > 74) {
        this.emotion = "playful";
        return;
      }

      this.emotion = "calm";
    }

    chooseAction(reason = "ambient") {
      const m = this.motives;

      if (this.emotion === "sleepy") {
        this.currentAction = "resting";
        this.currentThought = "I might curl up for a while.";
      } else if (this.emotion === "uncertain") {
        this.currentAction = "watching carefully";
        this.currentThought = "Something feels unfamiliar.";
      } else if (this.emotion === "excited") {
        this.currentAction = "tail wagging";
        this.currentThought = "You are here. This is excellent.";
      } else if (this.emotion === "curious") {
        this.currentAction = "investigating";
        this.currentThought = "What is that? I should inspect it.";
      } else if (this.emotion === "playful") {
        this.currentAction = "looking for play";
        this.currentThought = "There should be a toy around here somewhere.";
      } else if (this.emotion === "settled") {
        this.currentAction = "soft breathing";
        this.currentThought = "This place feels safe.";
      } else {
        this.currentAction = "idling";
        this.currentThought = "I am here. I am listening.";
      }

      if (reason === "manual") {
        this.currentThought = "Something nudged the world forward.";
      }
    }

    interact(type = "attention") {
      this.memory.totalInteractions += 1;
      this.memory.lastInteraction = type;

      this.memory.interactionCounts[type] =
        (this.memory.interactionCounts[type] || 0) + 1;

      this.memory.favouriteInteraction = Object.entries(
        this.memory.interactionCounts
      ).sort((a, b) => b[1] - a[1])[0][0];

      if (type === "pet") {
        this.motives.affection = clamp(this.motives.affection + 12);
        this.motives.comfort = clamp(this.motives.comfort + 8);
        this.motives.confidence = clamp(this.motives.confidence + 4);
      }

      if (type === "call") {
        this.motives.curiosity = clamp(this.motives.curiosity + 10);
        this.motives.affection = clamp(this.motives.affection + 4);
      }

      if (type === "play") {
        this.motives.playfulness = clamp(this.motives.playfulness + 12);
        this.motives.energy = clamp(this.motives.energy - 8);
        this.motives.affection = clamp(this.motives.affection + 6);
      }

      if (type === "comfort") {
        this.motives.comfort = clamp(this.motives.comfort + 14);
        this.motives.confidence = clamp(this.motives.confidence + 8);
        this.motives.energy = clamp(this.motives.energy + 4);
      }

      this.deriveEmotion();
      this.chooseAction(type);

      this.emit("event", {
        message: `${this.name} received: ${type}.`,
        interaction: type,
      });

      this.emit("state", this.getState());

      return this.getState();
    }

    getState() {
      return {
        name: this.name,
        emotion: this.emotion,
        action: this.currentAction,
        thought: this.currentThought,
        motives: { ...this.motives },
        memory: { ...this.memory },
        events: [...this.events],
      };
    }
  }

  class JiveEngine {
    constructor(options = {}) {
      this.tickRate = options.tickRate || 2200;
      this.companions = [];
      this.intervalId = null;
      this.isRunning = false;
    }

    createCompanion(options = {}) {
      const companion = new JiveCompanion(options);
      this.companions.push(companion);

      companion.emit("event", {
        message: `${companion.name} entered the simulation.`,
      });

      return companion;
    }

    start() {
      if (this.isRunning) return;

      this.isRunning = true;

      this.intervalId = window.setInterval(() => {
        this.tick();
      }, this.tickRate);
    }

    stop() {
      if (!this.isRunning) return;

      window.clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
    }

    tick(reason = "ambient") {
      return this.companions.map((companion) => {
        return companion.tick(reason);
      });
    }
  }

  window.Jive = {
    Engine: JiveEngine,
    Companion: JiveCompanion,
    utils: {
      clamp,
      randomBetween,
    },
  };
})();