/* ═══════════════════════════════════════════════════
   MAIN.JS — Signature: Particle Choreography
   Warm gold particles that drift and respond to cursor.
   One technique, executed deep.
   ═══════════════════════════════════════════════════ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderMeta = document.getElementById('loaderMeta');
const loadSteps = ['initializing', 'loading system', 'calibrating', 'ready'];

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 20 + 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    loaderMeta.textContent = loadSteps[3];
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0, duration: 0.6, ease: 'power2.inOut',
        onComplete: () => { loader.style.display = 'none'; }
      });
      gsap.to('.hero-label', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
      gsap.to('.hero-title', { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
      gsap.to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, delay: 0.5 });
      gsap.to('.hero-meta', { opacity: 1, y: 0, duration: 0.8, delay: 0.7 });
      gsap.to('.scroll-hint', { opacity: 1, duration: 0.6, delay: 1 });
    }, 400);
  }
  loaderFill.style.width = loadProgress + '%';
  const stepIdx = Math.min(Math.floor(loadProgress / 25), 2);
  loaderMeta.textContent = loadSteps[stepIdx];
}, 100);

gsap.set('.hero-label, .hero-title, .hero-subtitle, .hero-meta, .scroll-hint', { opacity: 0, y: 40 });

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -9999, y: -9999 };
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = -9999; mouse.y = -9999;
});

class Particle {
  constructor() {
    this.reset();
    this.y = Math.random() * H;
  }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.size = Math.random() * 2 + 0.5;
    this.baseOpacity = Math.random() * 0.4 + 0.1;
    this.opacity = this.baseOpacity;
    this.hue = Math.random() * 20 + 35;
  }
  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 200;
    if (dist < maxDist) {
      const force = (1 - dist / maxDist) * 0.5;
      this.vx += (dx / dist) * force * 0.1;
      this.vy += (dy / dist) * force * 0.1;
      this.opacity = this.baseOpacity + force * 0.4;
    } else {
      this.opacity += (this.baseOpacity - this.opacity) * 0.05;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.vx += (Math.random() - 0.5) * 0.01;
    this.vy += (Math.random() - 0.5) * 0.01;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    grad.addColorStop(0, `hsla(${this.hue}, 60%, 65%, ${this.opacity})`);
    grad.addColorStop(1, `hsla(${this.hue}, 60%, 65%, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const opacity = (1 - dist / 120) * 0.08;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(196, 166, 105, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function initParticles() {
  const count = prefersReducedMotion ? 0 : Math.min(80, Math.floor((W * H) / 15000));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();
window.addEventListener('resize', initParticles);

function animate() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animate);
}
if (!prefersReducedMotion) animate();

let lenis = null;
if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.fade-up').forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      }
    );
  });
  document.querySelectorAll('.project').forEach(project => {
    const name = project.querySelector('.project-name');
    project.addEventListener('mouseenter', () => {
      gsap.to(name, { x: 8, duration: 0.4, ease: 'power2.out' });
    });
    project.addEventListener('mouseleave', () => {
      gsap.to(name, { x: 0, duration: 0.4, ease: 'power2.out' });
    });
  });
  gsap.to('.hero-title', {
    yPercent: -20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
  document.querySelectorAll('.section-title').forEach(title => {
    gsap.fromTo(title,
      { yPercent: 10 },
      { yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: title, start: 'top bottom', end: 'bottom top', scrub: 1 }
      }
    );
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

console.log('%c NB. ', 'background: #c4a669; color: #0a0908; font-size: 14px; font-weight: bold; padding: 4px 8px;');
console.log('%cPortfolio — Built with the $10K Playbook', 'color: #c4a669; font-size: 12px;');