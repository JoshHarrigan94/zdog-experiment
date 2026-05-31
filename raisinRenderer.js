(function () {
  "use strict";

  class RaisinRenderer {
    constructor(stageElement) {
      this.stageElement = stageElement;
      this.state = null;
      this.time = 0;

      this.canvas = document.createElement("canvas");
      this.canvas.className = "raisin-canvas";

      this.stageElement.innerHTML = "";
      this.stageElement.appendChild(this.canvas);

      this.illo = new Zdog.Illustration({
        element: this.canvas,
        zoom: 3,
        resize: true,
        dragRotate: true,
        rotate: { x: -0.15, y: 0.25, z: 0 },
      });

      this.root = new Zdog.Anchor({
        addTo: this.illo,
      });

      this.body = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -28, y: 5 },
          { x: 28, y: 5 },
        ],
        stroke: 32,
        color: "#6b3f24",
      });

      this.head = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -18, y: -28 },
          { x: 0, y: -38 },
          { x: 18, y: -28 },
          { x: 12, y: -8 },
          { x: -12, y: -8 },
        ],
        translate: { x: -34, y: -14, z: 8 },
        stroke: 18,
        color: "#7a4a2b",
        fill: true,
        closed: true,
      });

      this.muzzle = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -12, y: -12 },
          { x: 6, y: -10 },
        ],
        translate: { x: -48, y: -10, z: 22 },
        stroke: 10,
        color: "#e7c29b",
      });

      this.nose = new Zdog.Ellipse({
        addTo: this.root,
        diameter: 6,
        translate: { x: -58, y: -12, z: 30 },
        stroke: 4,
        color: "#15100d",
        fill: true,
      });

      this.leftEar = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -40, y: -28 },
          { x: -52, y: -2 },
          { x: -42, y: 18 },
        ],
        stroke: 12,
        color: "#3f2417",
      });

      this.rightEar = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: -20, y: -28 },
          { x: -12, y: -2 },
          { x: -20, y: 16 },
        ],
        stroke: 12,
        color: "#3a2115",
      });

      this.tail = new Zdog.Shape({
        addTo: this.root,
        path: [
          { x: 34, y: -2 },
          { x: 52, y: -16 },
        ],
        stroke: 8,
        color: "#4b2b1a",
      });

      this.eye = new Zdog.Ellipse({
        addTo: this.root,
        diameter: 5,
        translate: { x: -36, y: -24, z: 28 },
        stroke: 3,
        color: "#120c09",
        fill: true,
      });

      this.animate();
    }

    setState(state) {
      this.state = state;
    }

    animate() {
      this.time += 1;

      const emotion = this.state?.emotion || "calm";
      const wag =
        emotion === "excited" || emotion === "playful" ? 0.8 : 0.25;

      this.root.rotate.y = Math.sin(this.time * 0.015) * 0.08;
      this.body.scale = {
        x: 1,
        y: 1 + Math.sin(this.time * 0.04) * 0.03,
        z: 1,
      };

      this.tail.rotate = {
        z: Math.sin(this.time * 0.16) * wag,
      };

      this.illo.updateRenderGraph();
      requestAnimationFrame(() => this.animate());
    }
  }

  window.RaisinRenderer = RaisinRenderer;
})();