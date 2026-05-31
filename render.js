/*
  Project Jive
  Raisin Zdog renderer v0.1

  Turns companion state into a simple living spaniel.
*/

(function () {
  "use strict";

  if (!window.Zdog) {
    throw new Error("Zdog was not found. Check the CDN script is loaded before raisinRenderer.js.");
  }

  class RaisinRenderer {
    constructor(stageElement) {
      this.stageElement = stageElement;
      this.state = null;
      this.time = 0;
      this.pointer = { x: 0, y: 0, active: false };

      this.canvas = document.createElement("canvas");
      this.canvas.className = "raisin-canvas";
      this.stageElement.innerHTML = "";
      this.stageElement.appendChild(this.canvas);

      this.illo = new Zdog.Illustration({
        element: this.canvas,
        zoom: 3.1,
        dragRotate: true,
        resize: true,
        rotate: { x: -0.12, y: 0.18, z: 0 },
      });

      this.createDog();
      this.bindEvents();
      this.animate();
    }

    createDog() {
      const TAU = Zdog.TAU;

      this.root = new Zdog.Anchor({
        addTo: this.illo,
        translate: { y: 10 },
      });

      this.shadow = new Zdog.Ellipse({
        addTo: this.root,
        diameter: 76,
        quarters: 2,
        translate: { y: 36, z: -8 },
        rotate: { x: TAU / 4 },
        stroke: 8,
        color: "rgba(0,0,0,0.22)",
        fill: false,
      });

      this.body = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -26, y: 8, z: 0 },
          { x: -12, y: -10, z: 0 },
          { x: 18, y: -8, z: 0 },
          { x: 32, y: 8, z: 0 },
          { x: 18, y: 22, z: 0 },
          { x: -16, y: 24, z: 0 },
        ],
        stroke: 28,
        color: "#5a351f",
        fill: true,
        closed: true,
      });

      this.chest = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -8, y: 2 },
          { x: 6, y: 4 },
          { x: 4, y: 20 },
          { x: -10, y: 18 },
        ],
        translate: { x: -8, y: 5, z: 12 },
        stroke: 14,
        color: "#f3d7b4",
        fill: true,
        closed: true,
      });

      this.neck = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -10, y: -16 },
          { x: 8, y: -16 },
        ],
        translate: { x: -18, y: -5, z: 2 },
        stroke: 18,
        color: "#6b3f24",
      });

      this.headAnchor = new Zdog.Anchor({
        addTo: this.root,
        translate: { x: -34, y: -24, z: 4 },
        rotate: { z: -0.04 },
      });

      this.head = new Zdog.Shape({
        addTo: this.headAnchor,
        path: [
          { x: -15, y: -13 },
          { x: 12, y: -15 },
          { x: 20, y: 4 },
          { x: 6, y: 20 },
          { x: -16, y: 14 },
          { x: -22, y: -4 },
        ],
        stroke: 22,
        color: "#6b3f24",
        fill: true,
        closed: true,
      });

      this.muzzle = new Zdog.Shape({
        addTo: this.headAnchor,
        path: [
          { x: -18, y: 2 },
          { x: 2, y: 0 },
          { x: 8, y: 11 },
          { x: -10, y: 17 },
        ],
        translate: { z: 13 },
        stroke: 12,
        color: "#e7c29b",
        fill: true,
        closed: true,
      });

      this.nose = new Zdog.Ellipse({
        addTo: this.headAnchor,
        diameter: 7,
        translate: { x: -18, y: 4, z: 23 },
        stroke: 5,
        color: "#201510",
        fill: true,
      });

      this.leftEye = new Zdog.Ellipse({
        addTo: this.headAnchor,
        diameter: 5,
        translate: { x: -2, y: -7, z: 18 },
        stroke: 2,
        color: "#160f0b",
        fill: true,
      });

      this.rightEye = new Zdog.Ellipse({
        addTo: this.headAnchor,
        diameter: 5,
        translate: { x: 12, y: -7, z: 14 },
        stroke: 2,
        color: "#160f0b",
        fill: true,
      });

      this.leftEar = new Zdog.Shape({
        addTo: this.headAnchor,
        path: [
          { x: -13, y: -7 },
          { x: -23, y: 14 },
          { x: -18, y: 33 },
          { x: -6, y: 18 },
        ],
        translate: { z: 3 },
        stroke: 13,
        color: "#3f2417",
        fill: true,
        closed: false,
      });

      this.rightEar = new Zdog.Shape({
        addTo: this.headAnchor,
        path: [
          { x: 14, y: -8 },
          { x: 22, y: 12 },
          { x: 18, y: 30 },
          { x: 7, y: 18 },
        ],
        translate: { z: -4 },
        stroke: 12,
        color: "#3a2115",
        fill: true,
        closed: false,
      });

      this.tailAnchor = new Zdog.Anchor({
        addTo: this.root,
        translate: { x: 36, y: -5, z: 0 },
        rotate: { z: -0.45 },
      });

      this.tail = new Zdog.Shape({
        addTo: this.tailAnchor,
        path: [
          { x: 0, y: 0 },
          { x: 14, y: -7 },
          { x: 25, y: -3 },
        ],
        stroke: 10,
        color: "#4b2b1a",
        closed: false,
      });

      this.legs = [];

      [
        { x: -18, z: 12 },
        { x: 12, z: 11 },
        { x: -16, z: -10 },
        { x: 15, z: -11 },
      ].forEach((leg) => {
        const anchor = new Zdog.Anchor({
          addTo: this.root,
          translate: { x: leg.x, y: 22, z: leg.z },
        });

        new Zdog.Shape({
          addTo: anchor,
          path: [
            { x: 0, y: 0 },
            { x: -1, y: 18 },
          ],
          stroke: 8,
          color: "#4b2b1a",
        });

        new Zdog.Shape({
          addTo: anchor,
          path: [
            { x: -7, y: 20 },
            { x: 5, y: 20 },
          ],
          stroke: 7,
          color: "#2f1b12",
        });

        this.legs.push(anchor);
      });

      this.cheekPatch = new Zdog.Shape({
        addTo: this.headAnchor,
        path: [
          { x: 4, y: 4 },
          { x: 14, y: 7 },
          { x: 10, y: 15 },
          { x: 0, y: 13 },
        ],
        translate: { z: 20 },
        stroke: 5,
        color: "#f0d0a9",
        fill: true,
        closed: true,
      });
    }

    bindEvents() {
      this.stageElement.addEventListener("pointermove", (event) => {
        const rect = this.stageElement.getBoundingClientRect();

        this.pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        this.pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        this.pointer.active = true;
      });

      this.stageElement.addEventListener("pointerleave", () => {
        this.pointer.active = false;
      });
    }

    setState(state) {
      this.state = state;
    }

    getMoodValues() {
      const emotion = this.state?.emotion || "calm";
      const motives = this.state?.motives || {};

      const energy = motives.energy ?? 60;
      const affection = motives.affection ?? 50;
      const curiosity = motives.curiosity ?? 50;
      const playfulness = motives.playfulness ?? 50;

      return {
        emotion,
        energy,
        affection,
        curiosity,
        playfulness,
      };
    }

    applyMoodPose() {
      const mood = this.getMoodValues();
      const t = this.time;

      const breath = Math.sin(t * 0.045) * 0.035;
      const curiousTilt = mood.emotion === "curious" ? Math.sin(t * 0.035) * 0.22 : 0;
      const sleepyDrop = mood.emotion === "sleepy" ? 0.26 : 0;
      const excitedLift = mood.emotion === "excited" ? -0.16 : 0;
      const playBounce = mood.emotion === "playful" ? Math.sin(t * 0.09) * 2.2 : 0;

      this.root.translate.y = 10 + playBounce;
      this.body.scale = {
        x: 1 + breath,
        y: 1 - breath * 0.45,
        z: 1,
      };

      this.headAnchor.rotate.z =
        -0.04 + curiousTilt + this.pointer.x * 0.1;

      this.headAnchor.rotate.x =
        sleepyDrop + this.pointer.y * 0.08;

      this.headAnchor.translate.y =
        -24 + sleepyDrop * 22 + excitedLift * 10;

      const wagIntensity =
        mood.emotion === "excited"
          ? 0.75
          : mood.emotion === "playful"
            ? 0.55
            : mood.affection > 70
              ? 0.35
              : 0.18;

      this.tailAnchor.rotate.z =
        -0.45 + Math.sin(t * (0.08 + wagIntensity * 0.12)) * wagIntensity;

      const earSway = Math.sin(t * 0.035) * 0.08;
      this.leftEar.rotate = { z: earSway };
      this.rightEar.rotate = { z: -earSway * 0.8 };

      const blink = Math.sin(t * 0.018) > 0.985;
      this.leftEye.scale = { x: 1, y: blink ? 0.15 : 1, z: 1 };
      this.rightEye.scale = { x: 1, y: blink ? 0.15 : 1, z: 1 };

      if (mood.emotion === "sleepy") {
        this.tailAnchor.rotate.z = -0.7 + Math.sin(t * 0.02) * 0.05;
      }

      if (mood.emotion === "uncertain") {
        this.root.rotate.y = Math.sin(t * 0.025) * 0.08 - 0.12;
      } else {
        this.root.rotate.y = Math.sin(t * 0.015) * 0.04;
      }
    }

    animate() {
      this.time += 1;
      this.applyMoodPose();
      this.illo.updateRenderGraph();

      window.requestAnimationFrame(() => this.animate());
    }
  }

  window.RaisinRenderer = RaisinRenderer;
})();