// ==========================================
// Particle System - Magical floating particles
// ==========================================
export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  addParticles(count = 40, options = {}) {
    const defaults = {
      color: 'rgba(212, 168, 71, 0.6)',
      minSize: 1,
      maxSize: 3,
      speed: 0.5,
      glow: true
    };
    const config = { ...defaults, ...options };

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: config.minSize + Math.random() * (config.maxSize - config.minSize),
        speedX: (Math.random() - 0.5) * config.speed,
        speedY: -Math.random() * config.speed - 0.2,
        color: config.color,
        glow: config.glow,
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  clear() {
    this.particles = [];
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.02;

      const alpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);

      if (p.glow) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = p.color;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(/[\d.]+\)$/, alpha + ')');
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Reset particles that go off screen
      if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
        p.x = Math.random() * this.canvas.width;
        p.y = this.canvas.height + 10;
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  start(count, options) {
    this.clear();
    this.addParticles(count, options);
    this.animate();
  }
}
