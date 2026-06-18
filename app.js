/* ========================================
   SafeZone AI Guardian — app.js
   ======================================== */

// ====================== UTILITIES ======================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ====================== PARTICLE CANVAS ======================
(function initParticles() {
    const canvas = $('#particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height, animId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.1,
            color: Math.random() > 0.5 ? '108,99,255' : '224,64,251',
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 120 }, createParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
            ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(108,99,255,${0.08 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animId);
        init();
        draw();
    });

    init();
    draw();
})();

// ====================== NAVBAR ======================
(function initNavbar() {
    const nav = $('#main-nav');
    const toggle = $('#nav-toggle');
    const links = $('#nav-links');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    toggle?.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('open');
    });

    // Close mobile nav on link click
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('open');
        });
    });
})();

// ====================== COUNTER ANIMATION ======================
(function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target).toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
            observer.unobserve(el);
        });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
})();

// ====================== AOS (Animate on Scroll) ======================
(function initAOS() {
    const elements = $$('[data-aos]');
    if (!elements.length) return;

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(32px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
        const delay = el.dataset.aosDelay ? parseInt(el.dataset.aosDelay) : 0;
        el.style.transitionDelay = delay + 'ms';
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    elements.forEach(el => observer.observe(el));
})();

// ====================== EMERGENCY MODAL ======================
(function initEmergencyModal() {
    const modal = $('#emergency-modal');
    const openBtns = $$('#emergency-btn, .demo-sos-btn, .sos-btn');
    const closeBtn = $('#modal-close');
    const cancelBtn = $('#cancel-sos');
    const locationEl = $('#user-location');

    function open() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        detectLocation();
    }

    function close() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function detectLocation() {
        if (!locationEl) return;
        locationEl.textContent = 'Detecting...';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    locationEl.textContent = `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`;
                },
                () => {
                    locationEl.textContent = 'Location unavailable (demo)';
                },
                { timeout: 4000 }
            );
        } else {
            locationEl.textContent = '10.8505°N, 76.2711°E (demo)';
        }
    }

    openBtns.forEach(btn => btn?.addEventListener('click', open));
    closeBtn?.addEventListener('click', close);
    cancelBtn?.addEventListener('click', close);
    modal?.addEventListener('click', e => { if (e.target === modal) close(); });
})();

// ====================== FAKE CALL MODAL ======================
(function initFakeCall() {
    const modal = $('#fakecall-modal');
    const declineBtn = $('#decline-call');
    const acceptBtn = $('#accept-call');

    // Triggered from quick-action button in phone mockup
    const fakeCallBtn = document.querySelector('.quick-action:nth-child(2)');

    function open() {
        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    fakeCallBtn?.addEventListener('click', open);
    declineBtn?.addEventListener('click', close);
    acceptBtn?.addEventListener('click', close);
    modal?.addEventListener('click', e => { if (e.target === modal) close(); });
})();

// ====================== REPORT DANGER MODAL ======================
(function initReportModal() {
    const modal = $('#report-modal');
    const openBtn = $('#report-btn');
    const closeBtn = $('#report-close');
    const form = $('#report-form');
    const severityBtns = $$('.severity-btn');

    function open() {
        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    modal?.addEventListener('click', e => { if (e.target === modal) close(); });

    severityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            severityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    form?.addEventListener('submit', e => {
        e.preventDefault();
        // Add marker to map if Leaflet map is available
        if (window.safeMap) {
            const center = window.safeMap.getCenter();
            const severity = $('.severity-btn.active')?.dataset.level || 'caution';
            const colorMap = { moderate: '#facc15', caution: '#fb923c', danger: '#ff6b6b' };
            L.circleMarker([center.lat + (Math.random() - 0.5) * 0.01, center.lng + (Math.random() - 0.5) * 0.01], {
                radius: 14,
                fillColor: colorMap[severity],
                color: 'transparent',
                fillOpacity: 0.7,
            }).addTo(window.safeMap).bindPopup(`<b>${severity.toUpperCase()} RISK</b><br>Just reported`).openPopup();
        }
        close();
        showToast('Report submitted anonymously. Thank you for keeping your community safe.');
    });
})();

// ====================== TOAST NOTIFICATION ======================
function showToast(msg, type = 'success') {
    const existing = $('.safezone-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'safezone-toast';
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚡'}</span> ${msg}`;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: type === 'success'
            ? 'linear-gradient(135deg,#4ade80,#06b6d4)'
            : 'linear-gradient(135deg,#6c63ff,#e040fb)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '100px',
        fontWeight: '600',
        fontSize: '0.9rem',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        opacity: '0',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        whiteSpace: 'nowrap',
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ====================== AI GUARDIAN DEMO ======================
(function initGuardianDemo() {
    const input = $('#guardian-input');
    const log = $('#detection-log');
    const micBtn = $('#guardian-mic');
    const waveform = $('#waveform');

    if (!input || !log) return;

    const distressKeywords = [
        'help', 'stop', 'leave me alone', 'let me go', 'don\'t touch',
        'get away', 'i\'m scared', 'please no', 'call police', 'somebody help',
        'danger', 'emergency', 'save me', 'please stop', 'go away',
        'someone stop', 'fire', 'attack',
    ];

    const safeKeywords = ['hello', 'how are you', 'good morning', 'test', 'demo', 'hi'];

    function addLog(msg, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false });
        entry.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${msg}</span>`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    function analyzeText(text) {
        const lower = text.toLowerCase();
        const matched = distressKeywords.find(kw => lower.includes(kw));
        if (matched) {
            triggerAlert(matched, text);
            return;
        }
        if (safeKeywords.some(kw => lower.includes(kw))) {
            addLog(`Ambient phrase detected: "${text}" — No threat identified.`, 'info');
            return;
        }
        if (text.length > 3) {
            addLog(`Analyzing: "${text}" — Scanning for distress signals...`, 'info');
            setTimeout(() => addLog('Analysis complete — No immediate threat detected.', 'info'), 800);
        }
    }

    function triggerAlert(keyword, fullText) {
        waveform?.classList.add('alert');
        addLog(`⚡ DISTRESS KEYWORD DETECTED: "${keyword}"`, 'alert');
        setTimeout(() => addLog('🧠 Voice stress pattern confirmed — AI confidence: 94%', 'alert'), 500);
        setTimeout(() => addLog('📍 GPS location locked — broadcasting to safety circle...', 'alert'), 1000);
        setTimeout(() => addLog('🚨 Emergency alert sent to 3 contacts + local authorities!', 'danger'), 1500);
        setTimeout(() => {
            waveform?.classList.remove('alert');
            addLog('✓ Guardian resumed normal monitoring.', 'system');
        }, 4000);
    }

    let typingTimer;
    input.addEventListener('input', () => {
        clearTimeout(typingTimer);
        const val = input.value.trim();
        if (!val) return;
        typingTimer = setTimeout(() => {
            analyzeText(val);
            input.value = '';
        }, 600);
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            clearTimeout(typingTimer);
            const val = input.value.trim();
            if (val) {
                analyzeText(val);
                input.value = '';
            }
        }
    });

    // Mic button — simulates voice input
    const phrases = [
        'help me please',
        'someone stop him',
        'let me go',
        'I\'m scared',
        'please don\'t',
        'get away from me',
    ];

    micBtn?.addEventListener('click', () => {
        micBtn.classList.add('recording');
        addLog('🎤 Voice input simulated — processing...', 'info');
        setTimeout(() => {
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            addLog(`Voice transcribed: "${phrase}"`, 'info');
            analyzeText(phrase);
            micBtn.classList.remove('recording');
        }, 1200);
    });
})();

// ====================== LEAFLET MAP ======================
(function initMap() {
    if (typeof L === 'undefined') return;
    const mapEl = document.getElementById('safety-map');
    if (!mapEl) return;

    // Default center: Kerala, India (user locale)
    const defaultCenter = [10.8505, 76.2711];

    const map = L.map('safety-map', {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
    });

    window.safeMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Sample risk zones
    const zones = [
        { lat: 10.8505, lng: 76.2711, level: 'safe', label: 'Safe Zone', reports: 0 },
        { lat: 10.8560, lng: 76.2780, level: 'moderate', label: 'Moderate Risk', reports: 12 },
        { lat: 10.8430, lng: 76.2640, level: 'caution', label: 'Caution Area', reports: 27 },
        { lat: 10.8590, lng: 76.2610, level: 'danger', label: 'High Risk Zone', reports: 48 },
        { lat: 10.8480, lng: 76.2830, level: 'safe', label: 'Safe Zone', reports: 2 },
        { lat: 10.8540, lng: 76.2690, level: 'moderate', label: 'Moderate Risk', reports: 8 },
        { lat: 10.8470, lng: 76.2750, level: 'caution', label: 'Caution Area', reports: 19 },
    ];

    const colorMap = {
        safe: '#4ade80',
        moderate: '#facc15',
        caution: '#fb923c',
        danger: '#ff6b6b',
    };

    zones.forEach(z => {
        L.circleMarker([z.lat, z.lng], {
            radius: z.level === 'danger' ? 22 : z.level === 'caution' ? 18 : 14,
            fillColor: colorMap[z.level],
            color: 'transparent',
            fillOpacity: z.level === 'danger' ? 0.75 : 0.55,
        })
            .addTo(map)
            .bindPopup(
                `<div style="font-family:Inter,sans-serif;min-width:140px;">
           <b style="color:${colorMap[z.level]}">${z.label}</b><br>
           <small style="color:#aaa;">${z.reports} community reports</small>
         </div>`
            );
    });

    // User marker (pulsing)
    const userIcon = L.divIcon({
        html: `<div style="
      width:16px;height:16px;background:#6c63ff;border-radius:50%;
      border:3px solid #fff;box-shadow:0 0 0 6px rgba(108,99,255,0.3);
      animation:pulseMarker 2s ease-in-out infinite;
    "></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    // Inject keyframes for pulsing marker
    if (!document.getElementById('map-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'map-pulse-style';
        style.textContent = `
      @keyframes pulseMarker {
        0%,100% { box-shadow: 0 0 0 6px rgba(108,99,255,0.3); }
        50% { box-shadow: 0 0 0 14px rgba(108,99,255,0.1); }
      }
    `;
        document.head.appendChild(style);
    }

    L.marker(defaultCenter, { icon: userIcon })
        .addTo(map)
        .bindPopup('<b style="color:#6c63ff">You are here</b>');

    // Try to get real position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const ll = [pos.coords.latitude, pos.coords.longitude];
            map.setView(ll, 14);
        }, () => { }, { timeout: 4000 });
    }
})();

// ====================== MODAL CSS INJECTION ======================
// Ensure modals have the .active toggling behaviour
(function injectModalStyles() {
    if (document.getElementById('modal-runtime-styles')) return;
    const s = document.createElement('style');
    s.id = 'modal-runtime-styles';
    s.textContent = `
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.25s ease;
    }
    .modal-overlay.active { display: flex; }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .modal {
      position: relative;
      width: 100%;
      max-width: 480px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
      animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.97); } to { opacity:1; transform:none; } }
    .modal-close {
      position: absolute;
      top: 16px; right: 20px;
      font-size: 1.6rem;
      color: #64748b;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s;
    }
    .modal-close:hover { color: #f1f5f9; }
    /* Emergency modal */
    .emergency-header { text-align:center; margin-bottom:24px; }
    .emergency-pulse-ring {
      width:80px; height:80px; border-radius:50%;
      background:rgba(255,107,107,0.15);
      border:2px solid rgba(255,107,107,0.4);
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 16px;
      font-size:2rem;
      animation:pulseRing 1.5s ease-in-out infinite;
    }
    @keyframes pulseRing {
      0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,0.4);}
      50%{box-shadow:0 0 0 20px rgba(255,107,107,0);}
    }
    .emergency-header h2 { color:#ff6b6b; font-size:1.3rem; }
    .emergency-info { margin-bottom:20px; }
    .info-row {
      display:flex; justify-content:space-between;
      padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);
      font-size:0.85rem;
    }
    .info-label { color:#64748b; }
    .info-value { color:#f1f5f9; font-weight:600; }
    .alert-active { color:#ff6b6b; animation:blink 1s step-end infinite; }
    .recording-active { color:#e040fb; animation:blink 1s step-end infinite; }
    @keyframes blink { 50%{opacity:0.4;} }
    .emergency-contacts { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
    .contact-item {
      display:flex; align-items:center; gap:12px;
      background:rgba(255,255,255,0.04); border-radius:12px; padding:10px 14px;
    }
    .contact-avatar { font-size:1.4rem; }
    .contact-name { font-size:0.9rem; font-weight:600; }
    .contact-status { font-size:0.75rem; color:#4ade80; margin-top:2px; }
    /* Fake call modal */
    .fakecall-modal {
      background: linear-gradient(160deg,#1a1a3e,#0c1220);
      text-align:center;
    }
    .fakecall-screen { padding:20px 0; }
    .caller-avatar-ring {
      width:100px; height:100px; border-radius:50%;
      background:rgba(108,99,255,0.15);
      border:3px solid rgba(108,99,255,0.4);
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 20px;
      font-size:3rem;
      animation:callerPulse 2s ease-in-out infinite;
    }
    @keyframes callerPulse {
      0%,100%{box-shadow:0 0 0 0 rgba(108,99,255,0.4);}
      50%{box-shadow:0 0 0 20px rgba(108,99,255,0);}
    }
    .caller-name { font-size:1.8rem; font-weight:700; margin-bottom:4px; }
    .caller-label { color:#64748b; font-size:0.9rem; margin-bottom:40px; }
    .call-actions { display:flex; gap:60px; justify-content:center; }
    .call-btn {
      width:64px; height:64px; border-radius:50%; border:none;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:transform 0.2s;
    }
    .call-btn:hover { transform:scale(1.1); }
    .call-btn.decline { background:#ff6b6b; }
    .call-btn.accept { background:#4ade80; }
    /* Report modal */
    .report-modal h2 { margin-bottom:8px; font-size:1.3rem; }
    .report-modal > p { color:#64748b; font-size:0.9rem; margin-bottom:24px; }
    .form-group { margin-bottom:20px; }
    .form-group label { display:block; font-size:0.85rem; color:#94a3b8; margin-bottom:8px; }
    .form-group select, .form-group textarea {
      width:100%; background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.1); border-radius:10px;
      padding:10px 14px; color:#f1f5f9; font-family:inherit; font-size:0.9rem;
    }
    .form-group select:focus, .form-group textarea:focus { outline:none; border-color:#6c63ff; }
    .severity-selector { display:flex; gap:10px; }
    .severity-btn {
      flex:1; padding:8px; border-radius:8px; border:1px solid transparent;
      font-weight:600; font-size:0.8rem; cursor:pointer; transition:all 0.2s;
      background:rgba(255,255,255,0.05); color:#64748b;
    }
    .severity-btn.moderate.active { background:rgba(250,204,21,0.15); border-color:#facc15; color:#facc15; }
    .severity-btn.caution.active { background:rgba(251,146,60,0.15); border-color:#fb923c; color:#fb923c; }
    .severity-btn.danger.active { background:rgba(255,107,107,0.15); border-color:#ff6b6b; color:#ff6b6b; }
    /* Guardian log */
    .detection-log { max-height:140px; overflow-y:auto; padding-top:8px; }
    .log-entry { display:flex; gap:10px; font-size:0.78rem; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
    .log-time { color:#6c63ff; font-weight:600; white-space:nowrap; }
    .log-entry.alert .log-msg { color:#fb923c; }
    .log-entry.danger .log-msg { color:#ff6b6b; font-weight:700; }
    .log-entry.system .log-msg { color:#64748b; }
    .log-entry.info .log-msg { color:#94a3b8; }
    /* Guardian mic button */
    .guardian-mic.recording { color:#ff6b6b !important; animation:blink 0.6s step-end infinite; }
    /* Waveform alert state */
    .waveform.alert .wave-bar { background:linear-gradient(to top,#ff6b6b,#e040fb) !important; }
    /* Nav mobile open */
    @media(max-width:768px){
      .nav-links.open {
        display:flex; flex-direction:column; position:absolute;
        top:100%; left:0; width:100%;
        background:rgba(6,9,15,0.97); backdrop-filter:blur(20px);
        padding:20px 24px; gap:16px; border-bottom:1px solid rgba(255,255,255,0.08);
      }
    }
    /* Map wrapper height */
    .safety-map { height:420px; border-radius:16px; overflow:hidden; }
  `;
    document.head.appendChild(s);
})();

// ====================== DEMO SOS BUTTON ======================
(function initDemoSos() {
    const btn = $('#demo-sos');
    if (!btn) return;
    let active = false;

    btn.addEventListener('click', () => {
        if (active) return;
        active = true;
        btn.style.background = 'linear-gradient(135deg,#ff6b6b,#e040fb)';
        btn.querySelector('.sos-text').textContent = 'SOS SENT!';
        showToast('Demo: Emergency SOS would be triggered now!', 'alert');
        setTimeout(() => {
            btn.style.background = '';
            btn.querySelector('.sos-text').textContent = 'TAP FOR SOS';
            active = false;
        }, 3000);
    });
})();

// ====================== SMOOTH SECTION SCROLL ======================
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ====================== STORE BUTTON FEEDBACK ======================
$$('.store-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('App coming soon! Stay tuned.', 'info');
    });
});