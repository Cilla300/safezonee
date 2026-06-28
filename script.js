/* ═══════════════════════════════════════════════════
   SAFEZONE AI GUARDIAN — script.js
   Full interactive JS: particles, typed text,
   scroll reveals, map canvas, phone steps,
   magnetic buttons, Neo4j graph viz, Expo/Base44
═══════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITIES ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;

/* ══════════════════════════════════════════════════
   1. CUSTOM CURSOR / GLOW
══════════════════════════════════════════════════ */
(function initCursor() {
    const glow = $('#cursorGlow');
    if (!glow) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    function animGlow() {
        cx = lerp(cx, mx, 0.08);
        cy = lerp(cy, my, 0.08);
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
        requestAnimationFrame(animGlow);
    }
    animGlow();
})();

/* ══════════════════════════════════════════════════
   2. NAVBAR SCROLL EFFECT
══════════════════════════════════════════════════ */
(function initNav() {
    const nav = $('#navbar');
    const scrollTop = $('#scrollTop');
    const hamburger = $('#hamburger');
    const mobileMenu = $('#mobileMenu');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav?.classList.toggle('scrolled', y > 40);
        scrollTop?.classList.toggle('visible', y > 400);
    }, { passive: true });

    hamburger?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('open');
    });

    scrollTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Close mobile menu when link clicked
    $$('.mobile-link').forEach(l => l.addEventListener('click', () => {
        mobileMenu?.classList.remove('open');
    }));
})();

/* ══════════════════════════════════════════════════
   3. TYPED TEXT EFFECT
══════════════════════════════════════════════════ */
(function initTyped() {
    const el = $('#typedText');
    if (!el) return;
    const phrases = ['Always by Your Side', 'Watching Over You', 'Ready When You Need', 'Your Safety Shield'];
    let pi = 0, ci = 0, deleting = false;

    function type() {
        const phrase = phrases[pi];
        if (!deleting) {
            el.textContent = phrase.slice(0, ci + 1);
            ci++;
            if (ci === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
            setTimeout(type, 68);
        } else {
            el.textContent = phrase.slice(0, ci - 1);
            ci--;
            if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
            setTimeout(type, 38);
        }
    }
    setTimeout(type, 800);
})();

/* ══════════════════════════════════════════════════
   4. SCROLL REVEAL ANIMATION
══════════════════════════════════════════════════ */
(function initReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════
   5. PARTICLE CANVAS BACKGROUND
══════════════════════════════════════════════════ */
(function initParticles() {
    const canvas = $('#particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouse = { x: -999, y: -999 };

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

    const COLORS = ['rgba(245,49,127,', 'rgba(192,16,58,', 'rgba(196,176,216,', 'rgba(31,207,122,'];

    function makeParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            col: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random() * 0.4 + 0.1,
            pulse: Math.random() * Math.PI * 2,
        };
    }
    for (let i = 0; i < 88; i++) particles.push(makeParticle());

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.pulse += 0.018;
            const a = p.alpha + Math.sin(p.pulse) * 0.06;
            // Mouse repel
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                p.vx += dx / dist * 0.04;
                p.vy += dy / dist * 0.04;
            }
            p.vx *= 0.98; p.vy *= 0.98;
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.col + Math.min(a, 0.7) + ')';
            ctx.fill();
        });

        // Draw connecting lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(245,49,127,${(1 - d / 110) * 0.08})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawFrame);
    }
    drawFrame();
})();

/* ══════════════════════════════════════════════════
   6. ANIMATED STAT COUNTERS
══════════════════════════════════════════════════ */
(function initCounters() {
    const stats = [
        { id: 'stat1', target: 50, suffix: 'k+', decimal: false, prefix: '' },
        { id: 'stat2', target: 99.8, suffix: '%', decimal: true, prefix: '' },
        { id: 'stat3', target: 3, suffix: 's', decimal: false, prefix: '<' },
    ];

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const strip = e.target;
            stats.forEach(({ id, target, suffix, decimal, prefix }) => {
                const el = document.getElementById(id);
                if (!el) return;
                let start = 0, startTime = null;
                const duration = 1800;
                function animate(ts) {
                    if (!startTime) startTime = ts;
                    const prog = Math.min((ts - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - prog, 3);
                    const val = decimal ? (start + (target - start) * ease).toFixed(1)
                        : Math.floor(start + (target - start) * ease);
                    el.textContent = prefix + val + suffix;
                    if (prog < 1) requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);
            });
            obs.unobserve(strip);
        });
    }, { threshold: 0.4 });

    const strip = $('.stats-strip');
    if (strip) obs.observe(strip);
})();

/* ══════════════════════════════════════════════════
   7. MAP CANVAS — animated safety map
══════════════════════════════════════════════════ */
(function initMapCanvas() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Map data
    const roads=[

[80,40,80,480],

[240,0,240,520],

[430,20,430,500],

[700,0,700,520],

[0,120,1000,120],

[0,270,1000,270],

[0,430,1000,430],

[80,120,240,270],

[240,270,430,430],

[430,120,700,270],

[700,270,940,430]

];

roads.forEach(r=>{

ctx.strokeStyle="#232b46";
ctx.lineWidth=10;

ctx.beginPath();
ctx.moveTo(r[0],r[1]);
ctx.lineTo(r[2],r[3]);
ctx.stroke();

ctx.strokeStyle="#44527a";
ctx.lineWidth=2;

ctx.stroke();

});

const buildings=[

[130,70],

[520,80],

[820,160],

[330,360],

[720,360],

[550,250],

[170,240]

];

buildings.forEach(b=>{

ctx.fillStyle="#1b2238";

ctx.fillRect(b[0],b[1],40,40);

ctx.strokeStyle="#3f5077";

ctx.strokeRect(b[0],b[1],40,40);

});

    const zones = [
        { x: 0.12, y: 0.55, r: 0.06, col: 'rgba(31,207,122,', alpha: 0.14, border: 'rgba(31,207,122,0.3)', label: 'Safe' },
        { x: 0.38, y: 0.30, r: 0.07, col: 'rgba(245,166,35,', alpha: 0.12, border: 'rgba(245,166,35,0.3)', label: 'Moderate' },
        { x: 0.65, y: 0.60, r: 0.06, col: 'rgba(232,24,78,', alpha: 0.16, border: 'rgba(232,24,78,0.35)', label: 'Danger' },
        { x: 0.82, y: 0.30, r: 0.05, col: 'rgba(245,166,35,', alpha: 0.12, border: 'rgba(245,166,35,0.25)', label: 'Moderate' },
        { x: 0.20, y: 0.80, r: 0.04, col: 'rgba(232,24,78,', alpha: 0.12, border: 'rgba(232,24,78,0.3)', label: 'Danger' },
    ];
    const police = [
        { x: 0.10, y: 0.22, label: 'P' },
        { x: 0.62, y: 0.82, label: 'P' },
    ];

    // Animated user path
    const pathPoints = [
        { x: 0.05, y: 0.42 }, { x: 0.22, y: 0.42 }, { x: 0.22, y: 0.28 }, { x: 0.38, y: 0.28 },
        { x: 0.55, y: 0.28 }, { x: 0.55, y: 0.42 }, { x: 0.68, y: 0.42 }, { x: 0.80, y: 0.42 },
        { x: 0.80, y: 0.60 }, { x: 0.80, y: 0.80 },
    ];
    let pathProgress = 0;
    let pulseT = 0;

    function getW() { return canvas.offsetWidth || canvas.width; }
    function getH() { return canvas.offsetHeight || 280; }

    function draw() {
        const W = canvas.width = canvas.offsetWidth || 1040;
        const H = canvas.height = 280;
        ctx.clearRect(0, 0, W, H);

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0e0620');
        bg.addColorStop(1, '#080412');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(245,49,127,0.035)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += W / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += H / 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        

        // Zones
        zones.forEach(z => {
            const grd = ctx.createRadialGradient(z.x * W, z.y * H, 0, z.x * W, z.y * H, z.r * W);
            grd.addColorStop(0, z.col + (z.alpha * 1.8) + ')');
            grd.addColorStop(1, z.col + '0)');
            ctx.beginPath();
            ctx.arc(z.x * W, z.y * H, z.r * W, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(z.x * W, z.y * H, z.r * W, 0, Math.PI * 2);
            ctx.strokeStyle = z.border;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Police stations
        police.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * W, p.y * H, 11, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(60,100,255,0.75)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(100,150,255,0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px DM Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P', p.x * W, p.y * H);
        });

        // User path (trail)
        pathProgress = (pathProgress + 0.004) % 1;
        const totalSeg = pathPoints.length - 1;
        const globalT = pathProgress * totalSeg;
        const segIdx = Math.min(Math.floor(globalT), totalSeg - 1);
        const segT = globalT - segIdx;
        const head = {
            x: lerp(pathPoints[segIdx].x, pathPoints[segIdx + 1].x, segT) * W,
            y: lerp(pathPoints[segIdx].y, pathPoints[segIdx + 1].y, segT) * H,
        };

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x * W, pathPoints[0].y * H);
        for (let i = 0; i <= segIdx; i++) {
            const nx = i < segIdx ? pathPoints[i + 1].x * W : head.x;
            const ny = i < segIdx ? pathPoints[i + 1].y * H : head.y;
            ctx.lineTo(nx, ny);
        }
        ctx.strokeStyle = 'rgba(245,49,127,0.35)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([6, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Location pin at head
        pulseT += 0.06;
        const pAlpha = 0.4 + Math.sin(pulseT) * 0.3;
        // Pulse rings
        [28, 42].forEach((r, i) => {
            ctx.beginPath();
            ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(245,49,127,${pAlpha * (i === 0 ? 0.5 : 0.25)})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        });
        // Pin body
        ctx.beginPath();
        ctx.arc(head.x, head.y - 4, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#f5317f';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(head.x - 6, head.y + 2);
        ctx.quadraticCurveTo(head.x, head.y + 16, head.x + 6, head.y + 2);
        ctx.fillStyle = '#f5317f';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(head.x, head.y - 4, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Coordinates display
        const lat = (8.8922 + Math.sin(pulseT * 0.1) * 0.0005).toFixed(5);
        const lng = (76.6140 + Math.cos(pulseT * 0.08) * 0.0003).toFixed(5);
        ctx.fillStyle = 'rgba(12,8,22,0.8)';
        ctx.beginPath();
        roundRect(ctx, head.x + 18, head.y - 22, 130, 28, 7);
        ctx.fill();
        ctx.fillStyle = '#1fcf7a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`📍 ${lat}, ${lng}`, head.x + 25, head.y - 5);

        requestAnimationFrame(draw);
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) draw();
    }, { threshold: 0.1 });
    obs.observe(canvas);
})();

/* ══════════════════════════════════════════════════
   8. HOW-IT-WORKS PHONE STEP SWITCHER
══════════════════════════════════════════════════ */
(function initSteps() {
    const steps = $$('.step-item');
    const screens = $$('.screen-state');
    let current = 0, timer = null;

    function activate(idx) {
        steps.forEach((s, i) => s.classList.toggle('active-step', i === idx));
        screens.forEach((s, i) => s.classList.toggle('active', i === idx));
        current = idx;
    }

    function autoAdvance() {
        activate((current + 1) % steps.length);
        timer = setTimeout(autoAdvance, 3200);
    }

    steps.forEach((s, i) => {
        s.addEventListener('click', () => {
            clearTimeout(timer);
            activate(i);
            timer = setTimeout(autoAdvance, 3200);
        });
    });

    // Start auto-cycle when section in view
    const how = $('.section-how');
    if (how) {
        new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !timer) {
                timer = setTimeout(autoAdvance, 2800);
            }
        }, { threshold: 0.3 }).observe(how);
    }
})();

/* ══════════════════════════════════════════════════
   9. MAGNETIC BUTTON EFFECT
══════════════════════════════════════════════════ */
(function initMagnetic() {
    $$('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
})();

/* ══════════════════════════════════════════════════
   10. FLOATING CARDS PARALLAX
══════════════════════════════════════════════════ */
(function initFloatParallax() {
    const cards = [
        { el: $('#floatSafe'), sx: 0.018, sy: 0.012 },
        { el: $('#floatLive'), sx: -0.014, sy: -0.016 },
        { el: $('#floatAI'), sx: 0.012, sy: -0.018 },
    ];
    let baseX = window.innerWidth / 2, baseY = window.innerHeight / 2;
    document.addEventListener('mousemove', e => {
        const dx = e.clientX - baseX;
        const dy = e.clientY - baseY;
        cards.forEach(({ el, sx, sy }) => {
            if (!el) return;
            el.style.transform = `translate(${dx * sx}px, ${dy * sy}px)`;
        });
    }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   11. NEO4J KNOWLEDGE GRAPH VISUALIZATION
   Community safety relationship graph
══════════════════════════════════════════════════ */
(function initNeo4jGraph() {
    const section = document.getElementById('neo4j-section');
    const canvas = document.getElementById('neo4jCanvas');
    if (!section || !canvas) return;
    const ctx = canvas.getContext('2d');

    // Neo4j-style node/relationship data
    const nodes = [
        { id: 0, label: 'User', sub: 'Meera', x: 0.50, y: 0.50, col: '#f5317f', r: 28, type: 'user' },
        { id: 1, label: 'Contact', sub: 'Sister', x: 0.22, y: 0.25, col: '#c47fbf', r: 22, type: 'contact' },
        { id: 2, label: 'Contact', sub: 'Mom', x: 0.78, y: 0.25, col: '#c47fbf', r: 22, type: 'contact' },
        { id: 3, label: 'Police', sub: 'Station A', x: 0.18, y: 0.72, col: '#7799ff', r: 22, type: 'police' },
        { id: 4, label: 'Danger Zone', sub: 'High Risk', x: 0.72, y: 0.76, col: '#e8184e', r: 22, type: 'zone' },
        { id: 5, label: 'Incident', sub: 'Harassment', x: 0.50, y: 0.82, col: '#f5a623', r: 19, type: 'incident' },
        { id: 6, label: 'Safe Zone', sub: 'Park Area', x: 0.82, y: 0.52, col: '#1fcf7a', r: 19, type: 'safe' },
        { id: 7, label: 'Journey', sub: 'Active', x: 0.50, y: 0.18, col: '#e8611a', r: 20, type: 'journey' },
        { id: 8, label: 'Community', sub: '50k+', x: 0.20, y: 0.50, col: '#c47fbf', r: 20, type: 'community' },
    ];

    const edges = [
        { from: 0, to: 1, label: 'TRUSTS', col: 'rgba(196,176,216,0.5)' },
        { from: 0, to: 2, label: 'TRUSTS', col: 'rgba(196,176,216,0.5)' },
        { from: 0, to: 3, label: 'ALERTS', col: 'rgba(119,153,255,0.5)' },
        { from: 0, to: 4, label: 'NEAR', col: 'rgba(232,24,78,0.4)' },
        { from: 0, to: 5, label: 'REPORTED', col: 'rgba(245,166,35,0.5)' },
        { from: 0, to: 6, label: 'IN', col: 'rgba(31,207,122,0.5)' },
        { from: 0, to: 7, label: 'STARTED', col: 'rgba(232,97,26,0.5)' },
        { from: 0, to: 8, label: 'MEMBER_OF', col: 'rgba(196,176,216,0.4)' },
        { from: 5, to: 4, label: 'WITHIN', col: 'rgba(232,24,78,0.3)' },
        { from: 7, to: 6, label: 'ROUTES_VIA', col: 'rgba(31,207,122,0.3)' },
        { from: 3, to: 4, label: 'MONITORS', col: 'rgba(119,153,255,0.35)' },
        { from: 1, to: 8, label: 'MEMBER_OF', col: 'rgba(196,176,216,0.3)' },
    ];

    // Physics simulation
    const ICONS = { user: '👤', contact: '📞', police: '🚔', zone: '⚠️', incident: '📋', safe: '🛡️', journey: '🗺️', community: '💜' };
    let t = 0;
    let hoveredNode = null;

    // Soft physics: nodes repel, edges attract
    const vel = nodes.map(() => ({ x: 0, y: 0 }));

    function resize() {
        canvas.width = canvas.offsetWidth || 700;
        canvas.height = canvas.offsetHeight || 400;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function drawArrow(x1, y1, x2, y2, col) {
        const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return;
        const ux = dx / len, uy = dy / len;
        const sx = x1 + ux * 32, sy = y1 + uy * 32, ex = x2 - ux * 32, ey = y2 - uy * 32;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        // Arrowhead
        const ax = ex - ux * 9 + uy * 5, ay = ey - uy * 9 - ux * 5;
        const bx = ex - ux * 9 - uy * 5, by = ey - uy * 9 + ux * 5;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ax, ay); ctx.lineTo(bx, by);
        ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    }

    function frame() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.012;

        // Background
        ctx.fillStyle = '#0a0614';
        ctx.fillRect(0, 0, W, H);

        // Subtle grid
        ctx.strokeStyle = 'rgba(245,49,127,0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += W / 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += H / 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        // Map node positions to canvas
        const pos = nodes.map(n => ({
            x: n.x * W + Math.sin(t + n.id * 1.3) * 6,
            y: n.y * H + Math.cos(t * 0.7 + n.id * 0.9) * 5,
        }));

        // Animated particles along edges
        edges.forEach((e, ei) => {
            const p1 = pos[e.from], p2 = pos[e.to];
            // Edge line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = e.col; ctx.lineWidth = 1.4; ctx.stroke();
            // Arrow
            drawArrow(p1.x, p1.y, p2.x, p2.y, e.col);
            // Edge label
            const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
            ctx.save();
            ctx.fillStyle = 'rgba(12,8,20,0.75)';
            const tw = ctx.measureText(e.label).width;
            ctx.beginPath(); roundRectCtx(ctx, mx - tw / 2 - 5, my - 9, tw + 10, 14, 4); ctx.fill();
            ctx.fillStyle = 'rgba(200,170,220,0.7)';
            ctx.font = '7.5px DM Sans, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(e.label, mx, my);
            ctx.restore();

            // Animated pulse dot along edge
            const pt = (t * 0.35 + ei * 0.7) % 1;
            const px = p1.x + (p2.x - p1.x) * pt;
            const py = p1.y + (p2.y - p1.y) * pt;
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = e.col.replace(/[\d.]+\)$/, '0.9)');
            ctx.fill();
        });

        // Nodes
        nodes.forEach((n, i) => {
            const { x, y } = pos[i];
            const hov = hoveredNode === i;
            const r = n.r + (hov ? 5 : 0);

            // Glow
            const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
            grd.addColorStop(0, n.col + '44');
            grd.addColorStop(1, n.col + '00');
            ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();

            // Node circle
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = '#0e0820';
            ctx.fill();
            ctx.strokeStyle = n.col;
            ctx.lineWidth = hov ? 2.5 : 1.8;
            ctx.stroke();

            // Icon
            ctx.font = `${r * 0.65}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(ICONS[n.type] || '●', x, y - 3);

            // Label
            ctx.fillStyle = '#f0e8f5';
            ctx.font = 'bold 9px DM Sans,sans-serif';
            ctx.fillText(n.label, x, y + r + 11);
            ctx.fillStyle = 'rgba(160,130,180,0.7)';
            ctx.font = '8px DM Sans,sans-serif';
            ctx.fillText(n.sub, x, y + r + 21);
        });

        requestAnimationFrame(frame);
    }

    // Hover detection
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        hoveredNode = null;
        const W = canvas.width, H = canvas.height;
        nodes.forEach((n, i) => {
            const x = n.x * W, y = n.y * H;
            if (Math.hypot(mx - x, my - y) < n.r + 8) hoveredNode = i;
        });
        canvas.style.cursor = hoveredNode !== null ? 'pointer' : 'default';
    });

    function roundRectCtx(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) frame();
    }, { threshold: 0.15 }).observe(section);
})();

/* ══════════════════════════════════════════════════
   12. EXPO / BASE44 DOWNLOAD SECTION INTERACTIVITY
══════════════════════════════════════════════════ */
(function initExpoBase44() {
    // QR code canvas for Expo / Base44 download
    const qrCanvas = document.getElementById('qrCanvas');
    if (qrCanvas) {
        const ctx = qrCanvas.getContext('2d');
        qrCanvas.width = qrCanvas.height = 160;
        drawMockQR(ctx, 160);
    }

    function drawMockQR(ctx, size) {
        const s = size;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#0c0810';
        // Corner squares
        [0, s - 40].forEach(ox => {
            [0, s - 40].forEach(oy => {
                if (ox === s - 40 && oy === s - 40) return;
                ctx.fillRect(ox + 4, oy + 4, 32, 32);
                ctx.fillStyle = '#fff';
                ctx.fillRect(ox + 8, oy + 8, 24, 24);
                ctx.fillStyle = '#0c0810';
                ctx.fillRect(ox + 12, oy + 12, 16, 16);
                ctx.fillStyle = '#0c0810';
            });
        });
        // Random data modules
        const cell = 5;
        for (let y = 0; y < s; y += cell) {
            for (let x = 0; x < s; x += cell) {
                if (x < 44 && y < 44) continue;
                if (x > s - 44 && y < 44) continue;
                if (x < 44 && y > s - 44) continue;
                if (Math.random() > 0.52) {
                    ctx.fillStyle = '#0c0810';
                    ctx.fillRect(x + 1, y + 1, cell - 1, cell - 1);
                }
            }
        }
        // Centre logo
        ctx.fillStyle = '#f5317f';
        ctx.beginPath();
        ctx.roundRect(s / 2 - 16, s / 2 - 16, 32, 32, 7);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛡️', s / 2, s / 2);
    }

    // Platform tab switcher
    const platformTabs = $$('.platform-tab');
    const platformContents = $$('.platform-content');
    platformTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            platformTabs.forEach(t => t.classList.remove('active-tab'));
            platformContents.forEach(c => c.classList.remove('active-content'));
            tab.classList.add('active-tab');
            const target = tab.dataset.platform;
            const content = document.getElementById('platform-' + target);
            if (content) content.classList.add('active-content');
        });
    });

    // Download buttons — demo toast
    $$('.dl-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const platform = btn.dataset.dl || 'app';
            showToast(`📲 Opening ${platform} download…`);
        });
    });
})();

/* ══════════════════════════════════════════════════
   13. TOAST NOTIFICATION SYSTEM
══════════════════════════════════════════════════ */
function showToast(msg, type = 'success', dur = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
      position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
      z-index:9999; display:flex; flex-direction:column; gap:10px; align-items:center; pointer-events:none;
    `;
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
    background: #1a1030; border: 1px solid rgba(245,49,127,0.35);
    color: #f0e8f5; padding: 12px 22px; border-radius: 12px;
    font-size: 13px; font-weight: 600; font-family: DM Sans, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: toastIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
    pointer-events: none;
  `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, dur);
}

// Add toast keyframes dynamically
const toastStyle = document.createElement('style');
toastStyle.textContent = `
@keyframes toastIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes toastOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(10px)} }
`;
document.head.appendChild(toastStyle);

/* ══════════════════════════════════════════════════
   14. SMOOTH ANCHOR SCROLLING
══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

/* ══════════════════════════════════════════════════
   15. FEATURE CARD TILT EFFECT
══════════════════════════════════════════════════ */
$$('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${-cy * 8}deg) rotateY(${cx * 8}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ══════════════════════════════════════════════════
   16. CTA BUTTON — SIGN IN / GET STARTED LINK
══════════════════════════════════════════════════ */
$$('.btn-primary-sm, .btn-primary, .btn-ghost-sm').forEach(btn => {
    if (btn.getAttribute('href') === '#' && !btn.dataset.dl) {
        btn.addEventListener('click', e => {
            // If this page is standalone (no React app), show toast
            if (!document.querySelector('[data-reactroot]')) {
                // Already handled by href="#" smooth scroll above or by page nav
            }
        });
    }
});

console.log('%c🛡️ SafeZone AI Guardian loaded', 'color:#f5317f;font-size:14px;font-weight:bold');