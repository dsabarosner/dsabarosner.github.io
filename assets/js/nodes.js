// nodes.js — animación de nodos para el canvas #nodes-bg
(() => {
  const canvas = document.getElementById('nodes-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const DPR = window.devicePixelRatio || 1;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.scale(DPR, DPR);

  const MOUSE = { x: W/2, y: H/2, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    MOUSE.x = e.clientX; MOUSE.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => { MOUSE.x = W/2; MOUSE.y = H/2; });

  const config = {
    count: Math.round(Math.min(120, (W * H) / 7000)),
    maxDist: 140,
    speed: 0.3,
    nodeRadius: 2.2
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  class Node {
    constructor() {
      this.x = rand(0, W);
      this.y = rand(0, H);
      this.vx = rand(-config.speed, config.speed);
      this.vy = rand(-config.speed, config.speed);
      this.r = config.nodeRadius;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      // small attraction to mouse
      const dx = this.x - MOUSE.x; const dy = this.y - MOUSE.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < (MOUSE.radius*2.5)*(MOUSE.radius*2.5)) {
        this.x += -dx * 0.0008 * (MOUSE.radius / (Math.sqrt(d2)+1));
        this.y += -dy * 0.0008 * (MOUSE.radius / (Math.sqrt(d2)+1));
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  let nodes = new Array(config.count).fill().map(() => new Node());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // fondo suave
    ctx.fillStyle = 'rgba(10,12,15,0.35)';
    ctx.fillRect(0,0,W,H);

    // nodos
    ctx.fillStyle = 'rgba(180,220,255,0.95)';
    nodes.forEach(n => { n.update(); n.draw(); });

    // líneas entre nodos
    ctx.strokeStyle = 'rgba(0,183,255,0.12)';
    ctx.lineWidth = 1;
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < config.maxDist) {
          const alpha = 1 - dist / config.maxDist;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,183,255,${0.08 * alpha})`;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // líneas al mouse
    ctx.beginPath();
    for (let i=0;i<nodes.length;i++){
      const n = nodes[i];
      const dx = n.x - MOUSE.x, dy = n.y - MOUSE.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < config.maxDist*1.2){
        ctx.strokeStyle = `rgba(0,183,255,${0.08 * (1 - dist/(config.maxDist*1.2))})`;
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(MOUSE.x, MOUSE.y);
      }
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  // resize handling
  function onResize(){
    W = canvas.width = innerWidth; H = canvas.height = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
    // recompute count lightly
    const newCount = Math.round(Math.min(140, (W * H) / 7000));
    if (newCount > nodes.length) {
      while (nodes.length < newCount) nodes.push(new Node());
    } else if (newCount < nodes.length) {
      nodes = nodes.slice(0, newCount);
    }
  }
  window.addEventListener('resize', onResize);

  // estilos de dibujo iniciales
  ctx.fillStyle = 'rgba(180,220,255,0.95)';

  // start
  draw();
})();
