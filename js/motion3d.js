/**
 * VERIDEX — 3D Motion Design Engine (Vanilla JavaScript & 3D Math)
 * 
 * Features:
 * - Real-time 3D projected flowing luminous ribbon mesh (Cyan, Emerald, Violet)
 * - Mouse motion tracking with inertia damping & 3D camera orbit tilt
 * - Interactive 3D cursor magnetic wake & elastic wave distortion
 * - 3D floating constellation nodes with depth attenuation
 * - Dynamic CSS variable updates for background parallax & card 3D tilt
 */

export const Motion3D = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  dpr: 1,
  animId: null,

  // Mouse & Camera state
  mouse: {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    normX: 0,
    normY: 0,
    prevX: 0,
    prevY: 0,
    velX: 0,
    velY: 0,
    isHovering: false,
    lastMoveTime: 0
  },

  camera: {
    rotX: 0,
    rotY: 0,
    targetRotX: 0,
    targetRotY: 0,
    fov: 650,
    zDist: 500
  },

  // 3D Scene Objects
  ribbons: [],
  nodes3D: [],
  sparks: [],
  startTime: 0,

  /**
   * Initializes the 3D Motion Design Background on a given canvas or #particleCanvas
   */
  init(canvasId = 'particleCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.startTime = performance.now();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Center mouse initially
    this.mouse.x = this.mouse.targetX = this.width / 2;
    this.mouse.y = this.mouse.targetY = this.height / 2;

    this.setupMouseEvents();
    this.setupCardTilt();
    this.initSceneObjects();

    // Start 60fps render loop
    cancelAnimationFrame(this.animId);
    this.render = this.render.bind(this);
    this.animId = requestAnimationFrame(this.render);
  },

  handleResize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.camera.fov = Math.max(500, Math.min(this.width, this.height) * 0.85);
  },

  setupMouseEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.isHovering = true;
      this.mouse.lastMoveTime = performance.now();

      // Velocity calculation
      this.mouse.velX = e.clientX - this.mouse.prevX;
      this.mouse.velY = e.clientY - this.mouse.prevY;
      this.mouse.prevX = e.clientX;
      this.mouse.prevY = e.clientY;

      // Spawn energy particle spark on fast movement
      const speed = Math.hypot(this.mouse.velX, this.mouse.velY);
      if (speed > 8 && this.sparks.length < 50) {
        this.spawnSpark(e.clientX, e.clientY, speed);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.isHovering = false;
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = e.touches[0].clientX;
        this.mouse.targetY = e.touches[0].clientY;
        this.mouse.isHovering = true;
        this.mouse.lastMoveTime = performance.now();
      }
    }, { passive: true });
  },

  /**
   * 3D Card Tilt for all dashboard cards, security cards, stage cards
   */
  setupCardTilt() {
    const selector = '.card, .security-card, .stage-card, .feature-card, .dashboard-card, .blockchain-card, .verify-card, .pipeline-node, .stat-card';
    
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest(selector);
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale3d(1.015, 1.015, 1.015)`;
      card.style.setProperty('--card-mouse-x', `${(x / rect.width * 100).toFixed(1)}%`);
      card.style.setProperty('--card-mouse-y', `${(y / rect.height * 100).toFixed(1)}%`);
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest(selector);
      if (card && (!e.relatedTarget || !card.contains(e.relatedTarget))) {
        card.style.transform = '';
      }
    });
  },

  initSceneObjects() {
    // 3D Ribbons spanning across the 3D space
    this.ribbons = [
      {
        id: 'blue-prime',
        slices: 64,
        strands: 3,
        baseY: -30,
        spanX: 1800,
        colorMain: 'rgba(2, 132, 199, ',
        colorGlow: 'rgba(2, 132, 199, 0.35)',
        colorSecondary: 'rgba(124, 58, 237, ',
        freqX: 0.0022,
        speed: 0.0016,
        ampY: 110,
        ampZ: 260,
        twistFreq: 0.0035,
        wireOpacity: 0.2,
        zOffset: -60
      },
      {
        id: 'violet-mid',
        slices: 58,
        strands: 3,
        baseY: 120,
        spanX: 1900,
        colorMain: 'rgba(124, 58, 237, ',
        colorGlow: 'rgba(124, 58, 237, 0.28)',
        colorSecondary: 'rgba(2, 132, 199, ',
        freqX: 0.0018,
        speed: -0.0012,
        ampY: 130,
        ampZ: 290,
        twistFreq: 0.0028,
        wireOpacity: 0.16,
        zOffset: 120
      },
      {
        id: 'teal-deep',
        slices: 50,
        strands: 2,
        baseY: -160,
        spanX: 1700,
        colorMain: 'rgba(5, 150, 105, ',
        colorGlow: 'rgba(5, 150, 105, 0.25)',
        colorSecondary: 'rgba(2, 132, 199, ',
        freqX: 0.0025,
        speed: 0.0010,
        ampY: 90,
        ampZ: 220,
        twistFreq: 0.003,
        wireOpacity: 0.14,
        zOffset: -200
      }
    ];

    // 3D Floating Constellation Nodes
    this.nodes3D = [];
    const nodeCount = Math.min(Math.floor(this.width / 24), 60);
    for (let i = 0; i < nodeCount; i++) {
      this.nodes3D.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1100,
        z: (Math.random() - 0.5) * 800,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.2 + 0.8,
        colorType: i % 3 === 0 ? 'blue' : (i % 3 === 1 ? 'emerald' : 'violet'),
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  },

  spawnSpark(x, y, speed) {
    const count = Math.min(Math.floor(speed / 4), 3);
    for (let i = 0; i < count; i++) {
      this.sparks.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 3 + this.mouse.velX * 0.15,
        vy: (Math.random() - 0.5) * 3 + this.mouse.velY * 0.15,
        alpha: 0.8,
        size: Math.random() * 3 + 1.5,
        hue: Math.random() > 0.5 ? 'cyan' : 'emerald'
      });
    }
  },

  /**
   * 3D Perspective Projection Matrix
   */
  project(x, y, z, rotX, rotY, fov, centerX, centerY) {
    // Rotate around Y axis (azimuth / horizontal tilt)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    // Rotate around X axis (elevation / vertical tilt)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective depth division
    const depth = z2 + this.camera.zDist;
    if (depth <= 10) {
      return { x: centerX, y: centerY, scale: 0, visible: false, depth: 0 };
    }

    const scale = fov / depth;
    return {
      x: centerX + x1 * scale,
      y: centerY + y2 * scale,
      scale: scale,
      visible: scale > 0,
      depth: depth,
      rawZ: z2
    };
  },

  /**
   * Core 60fps Animation Loop
   */
  render(currentTime) {
    this.animId = requestAnimationFrame(this.render);

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const dpr = this.dpr;
    const time = currentTime - this.startTime;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Smoothly interpolate mouse position (Spring physics)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    // Normalize coordinates (-1 to 1)
    const normX = (this.mouse.x / width) * 2 - 1;
    const normY = (this.mouse.y / height) * 2 - 1;

    // If mouse is idle, add subtle autonomous floating wave
    const idleTime = currentTime - this.mouse.lastMoveTime;
    const idleSwayX = Math.sin(time * 0.0006) * 0.15;
    const idleSwayY = Math.cos(time * 0.0005) * 0.12;

    this.camera.targetRotY = (normX * 0.38) + idleSwayX;
    this.camera.targetRotX = (-normY * 0.28) + idleSwayY;

    this.camera.rotX += (this.camera.targetRotX - this.camera.rotX) * 0.06;
    this.camera.rotY += (this.camera.targetRotY - this.camera.rotY) * 0.06;

    // Update global CSS custom properties for body background parallax
    const tiltDegX = (-normY * 8).toFixed(2);
    const tiltDegY = (normX * 8).toFixed(2);
    const parallaxPxX = (-normX * 24).toFixed(1);
    const parallaxPxY = (-normY * 18).toFixed(1);

    document.documentElement.style.setProperty('--mouse-x', `${(this.mouse.x / width * 100).toFixed(1)}%`);
    document.documentElement.style.setProperty('--mouse-y', `${(this.mouse.y / height * 100).toFixed(1)}%`);
    document.documentElement.style.setProperty('--tilt-x', `${tiltDegX}deg`);
    document.documentElement.style.setProperty('--tilt-y', `${tiltDegY}deg`);
    document.documentElement.style.setProperty('--parallax-x', `${parallaxPxX}px`);
    document.documentElement.style.setProperty('--parallax-y', `${parallaxPxY}px`);

    const centerX = width * 0.5;
    const centerY = height * 0.52;

    // =========================================================================
    // 1. Draw 3D Floating Constellation Nodes
    // =========================================================================
    const projectedNodes = [];
    for (let i = 0; i < this.nodes3D.length; i++) {
      const node = this.nodes3D[i];
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      // Wrap boundaries in 3D volume
      if (node.x < -800) node.x = 800;
      if (node.x > 800) node.x = -800;
      if (node.y < -550) node.y = 550;
      if (node.y > 550) node.y = -550;
      if (node.z < -400) node.z = 400;
      if (node.z > 400) node.z = -400;

      const proj = this.project(node.x, node.y, node.z, this.camera.rotX, this.camera.rotY, this.camera.fov, centerX, centerY);
      if (proj.visible) {
        projectedNodes.push({ proj, node });
      }
    }

    // Connect close 3D nodes
    for (let i = 0; i < projectedNodes.length; i++) {
      const p1 = projectedNodes[i].proj;
      for (let j = i + 1; j < projectedNodes.length; j++) {
        const p2 = projectedNodes[j].proj;
        const screenDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (screenDist < 120) {
          const alpha = (1 - screenDist / 120) * 0.14 * Math.min(p1.scale, p2.scale) * 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.75})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      // Draw node glow dot
      const node = projectedNodes[i].node;
      const pulse = Math.sin(time * 0.003 + node.pulseOffset) * 0.3 + 0.7;
      const r = node.radius * p1.scale * pulse * 1.4;
      if (r > 0.4) {
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2);
        const color = node.colorType === 'blue' ? `rgba(2, 132, 199, ${0.45 * pulse})` :
                      (node.colorType === 'emerald' ? `rgba(5, 150, 105, ${0.4 * pulse})` : `rgba(124, 58, 237, ${0.4 * pulse})`);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    // =========================================================================
    // 2. Draw 3D Flowing Ribbons & Mouse Magnetic Deformation
    // =========================================================================
    for (const ribbon of this.ribbons) {
      this.drawRibbon(ribbon, time, centerX, centerY, width, height);
    }

    // =========================================================================
    // 3. Draw Dynamic Interactive Mouse Sparks & Ripple Field
    // =========================================================================
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.94;
      s.vy *= 0.94;
      s.alpha *= 0.92;

      if (s.alpha <= 0.02) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.hue === 'cyan' ? `rgba(2, 132, 199, ${s.alpha * 0.7})` : `rgba(124, 58, 237, ${s.alpha * 0.7})`;
      ctx.fill();
    }

    // Dynamic mouse focal glow
    const mouseGlow = ctx.createRadialGradient(this.mouse.x, this.mouse.y, 0, this.mouse.x, this.mouse.y, 220);
    mouseGlow.addColorStop(0, 'rgba(2, 132, 199, 0.04)');
    mouseGlow.addColorStop(0.5, 'rgba(124, 58, 237, 0.015)');
    mouseGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = mouseGlow;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  },

  /**
   * Renders a 3D undulating ribbon mesh with mouse interactive deformation
   */
  drawRibbon(ribbon, time, centerX, centerY, width, height) {
    const ctx = this.ctx;
    const slices = ribbon.slices;
    const strands = ribbon.strands;
    const stepX = ribbon.spanX / slices;
    const startX = -ribbon.spanX / 2;

    // Grid of projected 3D vertices [strandIdx][sliceIdx]
    const grid = [];

    for (let s = 0; s < strands; s++) {
      const strandPoints = [];
      const strandOffsetRatio = (s / (strands - 1 || 1)) - 0.5; // -0.5 to 0.5
      const strandWidthY = strandOffsetRatio * 65;
      const strandWidthZ = strandOffsetRatio * 90;

      for (let i = 0; i <= slices; i++) {
        const u = i / slices; // 0..1 along ribbon
        const worldX = startX + i * stepX;

        // Wave harmonics in 3D
        const phase1 = worldX * ribbon.freqX + time * ribbon.speed;
        const phase2 = worldX * (ribbon.freqX * 1.8) - time * (ribbon.speed * 0.7);
        const twistPhase = worldX * ribbon.twistFreq + time * 0.001;

        let worldY = ribbon.baseY + strandWidthY + 
                     Math.sin(phase1) * ribbon.ampY + 
                     Math.cos(phase2) * (ribbon.ampY * 0.45) +
                     Math.sin(twistPhase) * 35;

        let worldZ = ribbon.zOffset + strandWidthZ + 
                     Math.cos(phase1) * ribbon.ampZ + 
                     Math.sin(phase2) * (ribbon.ampZ * 0.5);

        // Project point into 2D screen space
        const proj = this.project(worldX, worldY, worldZ, this.camera.rotX, this.camera.rotY, this.camera.fov, centerX, centerY);

        // Interactive Mouse Magnetic Deformation:
        // When mouse cursor approaches projected ribbon points, deflect them in 3D space
        if (proj.visible) {
          const distToMouse = Math.hypot(proj.x - this.mouse.x, proj.y - this.mouse.y);
          const maxDist = 240;
          if (distToMouse < maxDist) {
            const influence = Math.pow(1 - distToMouse / maxDist, 2.2);
            // Deflect in Z and Y
            worldZ += influence * 180;
            worldY -= influence * 60 * (this.mouse.y > proj.y ? 1 : -1);
            // Re-project with displaced 3D coords
            const reProj = this.project(worldX, worldY, worldZ, this.camera.rotX, this.camera.rotY, this.camera.fov, centerX, centerY);
            reProj.mouseDist = distToMouse;
            strandPoints.push(reProj);
          } else {
            proj.mouseDist = distToMouse;
            strandPoints.push(proj);
          }
        } else {
          strandPoints.push(proj);
        }
      }
      grid.push(strandPoints);
    }

    // Draw translucent facet fills between adjacent strands
    for (let s = 0; s < strands - 1; s++) {
      for (let i = 0; i < slices; i++) {
        const p00 = grid[s][i];
        const p10 = grid[s + 1][i];
        const p11 = grid[s + 1][i + 1];
        const p01 = grid[s][i + 1];

        if (!p00.visible || !p10.visible || !p11.visible || !p01.visible) continue;

        // Depth-based alpha
        const avgScale = (p00.scale + p10.scale + p11.scale + p01.scale) * 0.25;
        const normDist = (p00.mouseDist !== undefined && p00.mouseDist < 240) ? (1 - p00.mouseDist / 240) : 0;
        const facetAlpha = Math.min(0.24, (0.05 + normDist * 0.16) * avgScale * 1.6);

        ctx.beginPath();
        ctx.moveTo(p00.x, p00.y);
        ctx.lineTo(p10.x, p10.y);
        ctx.lineTo(p11.x, p11.y);
        ctx.lineTo(p01.x, p01.y);
        ctx.closePath();

        // Shimmering neon fill gradient
        const fillGrad = ctx.createLinearGradient(p00.x, p00.y, p11.x, p11.y);
        fillGrad.addColorStop(0, `${ribbon.colorMain}${facetAlpha})`);
        fillGrad.addColorStop(1, `${ribbon.colorSecondary}${facetAlpha * 0.6})`);
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Cross-rib wireframe isolines (adds high-end 3D CAD aesthetic)
        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.moveTo(p00.x, p00.y);
          ctx.lineTo(p10.x, p10.y);
          ctx.strokeStyle = `${ribbon.colorMain}${ribbon.wireOpacity * avgScale})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw glowing longitudinal contour strands
    for (let s = 0; s < strands; s++) {
      const strand = grid[s];
      ctx.beginPath();
      let started = false;

      for (let i = 0; i <= slices; i++) {
        const p = strand[i];
        if (!p.visible) {
          started = false;
          continue;
        }

        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          // Smooth curve via midpoints
          const prev = strand[i - 1];
          const midX = (prev.x + p.x) * 0.5;
          const midY = (prev.y + p.y) * 0.5;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
      }

      // Outer edges get intense luminous glow
      const isEdge = s === 0 || s === strands - 1;
      const strokeAlpha = isEdge ? 0.65 : 0.28;
      ctx.strokeStyle = `${ribbon.colorMain}${strokeAlpha})`;
      ctx.lineWidth = isEdge ? 1.6 : 0.9;
      ctx.shadowColor = ribbon.colorGlow;
      ctx.shadowBlur = isEdge ? 12 : 4;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
  }
};

// Auto-initialize if DOM is already ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Motion3D.init());
  } else {
    // If canvas exists, init
    setTimeout(() => Motion3D.init(), 50);
  }
}
