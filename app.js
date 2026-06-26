
/* ═══════════════════════════════════════════════════════════
   SAFEZONE AI GUARDIAN — app.js
   Vanilla JS rewrite with enhanced motion design
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── CONSTANTS ── */
const T = {
  bg:'#0c0810', surface:'#13101a', surface2:'#1a1524',
  border:'#2a1f35', borderHi:'#3d2a50',
  pink:'#f5317f', rose:'#e8184e', crimson:'#c0103a',
  lilac:'#c47fbf', muted:'#7a6a88', dim:'#4a3d58',
  text:'#f0e8f5', textSub:'#b09bc0',
  green:'#1fcf7a', amber:'#f5a623', orange:'#e8611a',
};


const RISK_MAP  = { red:85, orange:62, yellow:38, green:12 };
const ZONE_RGBA = { red:'242,60,80', orange:'232,97,26', yellow:'245,166,35', green:'31,207,122' };

const OLD_DANGER_ZONES = [
  { id:1, lat:8.8940, lng:76.6150, r:150, lvl:'red',    label:'3 assaults' },
  { id:2, lat:8.8900, lng:76.6120, r:200, lvl:'orange', label:'Harassment' },
  { id:3, lat:8.8960, lng:76.6080, r:120, lvl:'yellow', label:'Theft' },
  { id:4, lat:8.8880, lng:76.6170, r:180, lvl:'green',  label:'Safe area' },
];

const MOCK_POLICE = [
  { id:1, name:'Central Police Station',  dist:'0.8 km', lat:8.8932, lng:76.6141, ph:'100'  },
  { id:2, name:"Women's Safety Unit",     dist:'1.2 km', lat:8.8912, lng:76.6181, ph:'1091' },
  { id:3, name:'East District Station',   dist:'2.1 km', lat:8.8952, lng:76.6101, ph:'100'  },
];

const INIT_CONTACTS = [
  { id:1, name:'Priya (Sister)', phone:'+91 98765 43210', av:'P', notified:false },
  { id:2, name:'Mom',            phone:'+91 87654 32109', av:'M', notified:false },
  { id:3, name:'Asha (Friend)',  phone:'+91 76543 21098', av:'A', notified:false },
];

const FEATURES = [
  { icon:'🛡️', title:'Real-Time GPS Tracking', desc:'Continuously monitors your journey with live location updates every few seconds so someone always knows where you are.' },
  { icon:'🆘', title:'One-Tap Emergency SOS', desc:'A single tap sends your live location, identity, and an emergency alert to all your trusted contacts instantly.' },
  { icon:'🤖', title:'AI Distress Detection', desc:'Detects distress keywords and sudden danger sounds automatically triggering emergency mode.' },
  { icon:'🚔', title:'Nearest Police Alert', desc:'Locates nearby police stations via GPS and auto-generates an alert with your name, location, and incident details.' },
  { icon:'🗺️', title:'Danger Zone Intelligence', desc:'Community-reported unsafe areas displayed on an interactive map with colour-coded risk levels from safe to critical.' },
  { icon:'🔴', title:'AI Risk Score System', desc:'Calculates a 0–100 safety score for your current location based on reports, severity, time of day and recent activity.' },
  { icon:'🧭', title:'Safe Route Recommendation', desc:'Suggests alternate routes that avoid danger zones and prioritise well-lit, lower-risk paths to your destination.' },
  { icon:'🎙️', title:'Emergency Evidence Recording', desc:'Automatically starts audio recording when an emergency is activated. Recordings are stored securely for download.' },
];

const HOW_STEPS = [
  { num:'01', icon:'🛡️', color:'rgba(31,207,122,0.12)', border:'rgba(31,207,122,0.25)',
    title:'Create your profile',
    desc:'Sign up in seconds and add trusted emergency contacts — family, friends, anyone you trust.' },
  { num:'02', icon:'🗺️', color:'rgba(245,49,127,0.12)', border:'rgba(245,49,127,0.25)',
    title:'Start a journey',
    desc:'Tap Start Journey. SafeZone begins live GPS tracking, AI listening, and real-time risk scoring.' },
  { num:'03', icon:'🚨', color:'rgba(232,24,78,0.12)', border:'rgba(232,24,78,0.25)',
    title:'Stay safe automatically',
    desc:'If danger is detected — by keyword, sound, or SOS tap — alerts fire instantly to contacts and police.' },
];

const AI_RESPONSES = [
  { keys:['help','help me','somebody help','someone help'], level:'critical',
    msg:'🚨 DISTRESS DETECTED — I heard you say "help". Do you need emergency assistance right now?',
    actions:['Activate SOS','Alert contacts','I\'m safe'] },
  { keys:['save me','please help'], level:'critical',
    msg:'🚨 I detected a cry for help. Shall I alert your trusted contacts and nearest police station immediately?',
    actions:['Yes, alert now','Cancel'] },
  { keys:['stop','stop it','stop please'], level:'high',
    msg:'⚠️ I noticed you said "stop". Are you in danger or uncomfortable in your current situation?',
    actions:['Activate SOS','Send alert','I\'m okay'] },
  { keys:['leave me alone','let me go'], level:'high',
    msg:'⚠️ That sounds like you may be in an unsafe situation. Want me to alert your contacts quietly?',
    actions:['Alert contacts','Activate SOS','I\'m fine'] },
  { keys:['call police','police'], level:'critical',
    msg:'🚔 I\'m ready to send an alert to the nearest police station with your current location. Confirm?',
    actions:['Send police alert','Cancel'] },
  { keys:['scared','afraid','frightened','fear'], level:'high',
    msg:'💜 I hear you. You\'re not alone — I\'m with you. Do you want me to alert someone right now?',
    actions:['Alert contacts','Start SOS','I\'m okay'] },
  { keys:['follow','following me','stalker'], level:'high',
    msg:'⚠️ If someone is following you, walk towards a busy, well-lit area. Want me to alert your contacts with your live location?',
    actions:['Send location','Activate SOS','I\'m safe'] },
  { keys:['unsafe','not safe','danger'], level:'medium',
    msg:'🔶 Detected unsafe situation. I\'m monitoring your location. Want me to notify a contact to check on you?',
    actions:['Notify contact','Full SOS','I\'m okay'] },
];

/* ── STATE ── */
const state = {
  user: null,
  tab: 'home',
  isTracking: false,
  isEmergency: false,
  sosStep: 0,      // 0=idle, 1=countdown, 2=active
  sosCount: 5,
  contacts: JSON.parse(JSON.stringify(INIT_CONTACTS)),
  zones: [],
  lat: 8.8922,
  lng: 76.614,
  recordings: [],
  activityLog: [],
  journeyDur: 0,
  isRecording: false,
  aiListening: false,
  aiTypingTimer: null,
  // Settings
  settings: { push:true, loc:true, rec:true, priv:false, listening:false, grip:false },
  // Grip SOS
  gripCount: 0,
  gripAlertActive: false,
  gripResetTimer: null,
  gripActivateTimer: null,
  // Call
  callingContact: null,
  callStatus: 'idle', // idle|ringing|connected|ended
  callDur: 0,
  callTimer: null,
  callRingTimer: null,
  // Report
  reportStep: 'form', // form|confirm|submitting|success
  report: { type:'', desc:'', severity:'medium', time:'now', anonymous:false },
  reportZoneCount: 0,
  // Timers
  trackTimer: null,
  journeyTimer: null,
  sosTimer: null,
  mapAnimFrame: null,
  landingMapAnimFrame: null,
  mapPhi: 0,
  landingPhi: 0,
};

/* ═══════════════════════════════════════════════════════════
   SCREEN NAVIGATION
═══════════════════════════════════════════════════════════ */

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');

  if (name === 'landing') initLandingMap();
  if (name === 'app') {
    renderAll();
    setTimeout(() => { startAppMap(); }, 100);
  }
}

/* ═══════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════ */

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.textContent = show ? '🙈' : '👁';
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const err   = document.getElementById('login-error');
  if (!email || !pass) { showErr(err, 'Please fill all required fields.'); return; }
  err.style.display = 'none';
  state.user = { name:'Meera Nair', email, phone:'+91 98765 00001', av:'MN' };
  showScreen('app');
}

function doSignup() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const pass  = document.getElementById('signup-pass').value;
  const err   = document.getElementById('signup-error');
  if (!name)  { showErr(err, 'Please enter your name.'); return; }
  if (!email) { showErr(err, 'Please enter your email.'); return; }
  if (!pass)  { showErr(err, 'Please enter a password.'); return; }
  err.style.display = 'none';
  state.user = { name, email, phone: phone || '+91 98765 00001', av: name.slice(0,2).toUpperCase() };
  showScreen('app');
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = 'popIn 0.3s var(--ease-spring) both'; });
}

function logout() {
  clearAll();
  state.user = null;
  showScreen('landing');
}

/* ═══════════════════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════════════════ */

function switchTab(name) {
  state.tab = name;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + name);
  const btn   = document.getElementById('navbtn-' + name);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');

  if (name === 'map') { renderPoliceList(); renderReportCard(); updateZoneCounts(); startAppMap(); }
  if (name === 'home') { renderContactsList(); renderRiskGauge(); }
  if (name === 'profile') { renderProfile(); }
  if (name === 'alerts') { renderAlerts(); }
}

/* ═══════════════════════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════════════════════ */

function renderAll() {
  if (!state.user) return;
  renderSVGs();
  renderFeaturesGrid();
  renderHowSteps();
  renderContactsList();
  renderRiskGauge();
  renderPoliceList();
  renderReportCard();
  renderProfile();
  renderAlerts();
  renderWave('ai-wave', true);
  renderWave('rec-wave', true);
  updateTopbar();
  updateEmergencyBar();
  updateProfileAv();
}

/* ═══════════════════════════════════════════════════════════
   SVG ILLUSTRATIONS
═══════════════════════════════════════════════════════════ */

function renderSVGs() {
  const heroEl = document.getElementById('hero-svg');
  if (heroEl) heroEl.innerHTML = svgWomenSilhouettes();

  const shieldEl = document.getElementById('shield-svg');
  if (shieldEl) shieldEl.innerHTML = svgShieldProtect();

  const communityEl = document.getElementById('community-svg');
  if (communityEl) communityEl.innerHTML = svgCommunity();

  const aiEl = document.getElementById('ai-svg');
  if (aiEl) aiEl.innerHTML = svgAIListener();
}

function svgWomenSilhouettes() {
  return `
    <circle cx="160" cy="130" r="110" fill="url(#glowR1)" opacity="0.35"/>
    <ellipse cx="198" cy="92" rx="26" ry="26" fill="#5a1a3a"/>
    <path d="M172 118Q172 95 198 92Q224 89 224 118L230 200Q230 210 220 210L176 210Q166 210 166 200Z" fill="#5a1a3a"/>
    <ellipse cx="172" cy="88" rx="28" ry="28" fill="#c0183a"/>
    <path d="M144 116Q144 92 172 88Q200 84 200 116L207 200Q207 212 195 212L149 212Q137 212 137 200Z" fill="#c0183a"/>
    <rect x="164" y="114" width="16" height="14" rx="5" fill="#a01230"/>
    <ellipse cx="144" cy="84" rx="30" ry="30" fill="#f5317f"/>
    <path d="M114 114Q114 88 144 84Q174 80 174 114L182 204Q182 216 168 216L120 216Q106 216 106 204Z" fill="#f5317f"/>
    <ellipse cx="144" cy="62" rx="18" ry="14" fill="#e8184e"/>
    <circle cx="144" cy="54" r="10" fill="#f5317f"/>
    <path d="M126 70Q120 80 124 90" stroke="#e8184e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="230" cy="60" r="3" fill="#f5317f" opacity="0.6"/>
    <circle cx="100" cy="50" r="2" fill="#f5317f" opacity="0.4"/>
    <circle cx="250" cy="140" r="2" fill="#c4b0d8" opacity="0.5"/>
    <circle cx="80" cy="160" r="3" fill="#c4b0d8" opacity="0.4"/>
    <defs>
      <radialGradient id="glowR1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f5317f"/>
        <stop offset="100%" stop-color="#0c0810"/>
      </radialGradient>
    </defs>`;
}

function svgShieldProtect() {
  return `
    <path d="M140 20L240 60L240 140Q240 200 140 240Q40 200 40 140L40 60Z" fill="url(#shO)" opacity="0.15"/>
    <path d="M140 34L228 70L228 144Q228 196 140 228Q52 196 52 144L52 70Z" fill="url(#shM)" stroke="rgba(245,49,127,0.4)" stroke-width="1.5"/>
    <path d="M140 50L214 80L214 148Q214 188 140 212Q66 188 66 148L66 80Z" fill="url(#shI)" opacity="0.6"/>
    <circle cx="140" cy="112" r="22" fill="url(#phHead)"/>
    <ellipse cx="140" cy="98" rx="22" ry="12" fill="#c0183a"/>
    <path d="M118 102Q112 115 118 125" stroke="#e8184e" stroke-width="3" stroke-linecap="round"/>
    <path d="M162 102Q168 115 162 125" stroke="#e8184e" stroke-width="3" stroke-linecap="round"/>
    <path d="M112 134Q112 124 140 124Q168 124 168 134L172 178Q172 185 165 185L115 185Q108 185 108 178Z" fill="url(#phBody)"/>
    <path d="M108 140Q88 132 74 138" stroke="#f5317f" stroke-width="5" stroke-linecap="round"/>
    <path d="M172 140Q192 132 206 138" stroke="#f5317f" stroke-width="5" stroke-linecap="round"/>
    <circle cx="70" cy="140" r="6" fill="#f5317f"/>
    <circle cx="210" cy="140" r="6" fill="#f5317f"/>
    <path d="M122 155L135 168L158 148" stroke="rgba(245,49,127,0.5)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M62 72L65 65L68 72L75 75L68 78L65 85L62 78L55 75Z" fill="#f5317f" opacity="0.7"/>
    <path d="M205 85L207 80L209 85L214 87L209 89L207 94L205 89L200 87Z" fill="#c4b0d8" opacity="0.6"/>
    <circle cx="95" cy="55" r="3" fill="#f5317f" opacity="0.5"/>
    <circle cx="185" cy="52" r="2.5" fill="#c4b0d8" opacity="0.5"/>
    <defs>
      <linearGradient id="shO" x1="140" y1="20" x2="140" y2="240" gradientUnits="userSpaceOnUse">
        <stop stop-color="#f5317f"/><stop offset="1" stop-color="#5a1a3a"/>
      </linearGradient>
      <linearGradient id="shM" x1="140" y1="34" x2="140" y2="228" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2a1040"/><stop offset="1" stop-color="#1a0820"/>
      </linearGradient>
      <linearGradient id="shI" x1="140" y1="50" x2="140" y2="212" gradientUnits="userSpaceOnUse">
        <stop stop-color="rgba(245,49,127,0.15)"/><stop offset="1" stop-color="rgba(245,49,127,0)"/>
      </linearGradient>
      <linearGradient id="phHead" x1="140" y1="90" x2="140" y2="134" gradientUnits="userSpaceOnUse">
        <stop stop-color="#f5317f"/><stop offset="1" stop-color="#e8184e"/>
      </linearGradient>
      <linearGradient id="phBody" x1="140" y1="124" x2="140" y2="185" gradientUnits="userSpaceOnUse">
        <stop stop-color="#c0183a"/><stop offset="1" stop-color="#8a0e28"/>
      </linearGradient>
    </defs>`;
}

function svgCommunity() {
  return `
    <line x1="150" y1="120" x2="80" y2="70" stroke="rgba(245,49,127,0.2)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="150" y1="120" x2="220" y2="70" stroke="rgba(245,49,127,0.2)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="150" y1="120" x2="60" y2="170" stroke="rgba(196,176,216,0.2)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="150" y1="120" x2="240" y2="170" stroke="rgba(196,176,216,0.2)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="80" y1="70" x2="220" y2="70" stroke="rgba(245,49,127,0.1)" stroke-width="1" stroke-dasharray="3 4"/>
    <line x1="60" y1="170" x2="240" y2="170" stroke="rgba(196,176,216,0.1)" stroke-width="1" stroke-dasharray="3 4"/>
    <circle cx="150" cy="90" r="28" fill="url(#cenG)"/>
    <ellipse cx="150" cy="74" rx="20" ry="12" fill="#c0183a"/>
    <circle cx="150" cy="66" r="11" fill="url(#cenG)"/>
    <path d="M122 112Q122 100 150 100Q178 100 178 112L183 150Q183 158 175 158L125 158Q117 158 117 150Z" fill="url(#cenG)"/>
    <circle cx="80" cy="52" r="18" fill="#5a1a3a"/>
    <circle cx="80" cy="43" r="10" fill="#5a1a3a"/>
    <path d="M62 70Q62 62 80 62Q98 62 98 70L101 98Q101 104 94 104L66 104Q59 104 59 98Z" fill="#5a1a3a"/>
    <circle cx="220" cy="52" r="18" fill="#c0183a"/>
    <circle cx="220" cy="43" r="10" fill="#c0183a"/>
    <path d="M202 70Q202 62 220 62Q238 62 238 70L241 98Q241 104 234 104L206 104Q199 104 199 98Z" fill="#c0183a"/>
    <circle cx="60" cy="155" r="15" fill="rgba(196,176,216,0.5)"/>
    <circle cx="60" cy="147" r="8" fill="rgba(196,176,216,0.5)"/>
    <path d="M45 170Q45 163 60 163Q75 163 75 170L77 192Q77 197 72 197L48 197Q43 197 43 192Z" fill="rgba(196,176,216,0.4)"/>
    <circle cx="240" cy="155" r="15" fill="rgba(192,16,58,0.5)"/>
    <circle cx="240" cy="147" r="8" fill="rgba(192,16,58,0.5)"/>
    <path d="M225 170Q225 163 240 163Q255 163 255 170L257 192Q257 197 252 197L228 197Q223 197 223 192Z" fill="rgba(192,16,58,0.4)"/>
    <circle cx="150" cy="120" r="18" fill="#0c0810" stroke="rgba(245,49,127,0.5)" stroke-width="2"/>
    <path d="M150 110L157 113L157 119Q157 124 150 127Q143 124 143 119L143 113Z" fill="#f5317f"/>
    <circle cx="150" cy="120" r="28" fill="none" stroke="rgba(245,49,127,0.15)" stroke-width="1.5"/>
    <circle cx="150" cy="120" r="40" fill="none" stroke="rgba(245,49,127,0.08)" stroke-width="1"/>
    <defs>
      <linearGradient id="cenG" x1="150" y1="60" x2="150" y2="160" gradientUnits="userSpaceOnUse">
        <stop stop-color="#f5317f"/><stop offset="1" stop-color="#c0183a"/>
      </linearGradient>
    </defs>`;
}

function svgAIListener() {
  return `
    <circle cx="140" cy="120" r="90" fill="url(#aiGl)" opacity="0.2"/>
    <rect x="98" y="30" width="84" height="150" rx="14" fill="#1a1030" stroke="rgba(245,49,127,0.35)" stroke-width="1.5"/>
    <rect x="104" y="40" width="72" height="118" rx="8" fill="#0c0810"/>
    <rect x="126" y="33" width="28" height="5" rx="3" fill="#2a1040"/>
    ${[3,7,14,10,6,16,9,4,13,8,5,15,7,11,4].map((h,i) =>
      `<line x1="${112+i*5}" y1="${100-h/2}" x2="${112+i*5}" y2="${100+h/2}"
        stroke="${i>5&&i<10?'#f5317f':'rgba(245,49,127,0.3)'}" stroke-width="3" stroke-linecap="round"/>`
    ).join('')}
    <rect x="112" y="112" width="56" height="16" rx="5" fill="rgba(245,49,127,0.12)" stroke="rgba(245,49,127,0.25)" stroke-width="1"/>
    <circle cx="124" cy="120" r="3.5" fill="#f5317f"/>
    <rect x="130" y="117" width="30" height="2" rx="1" fill="rgba(245,49,127,0.5)"/>
    <rect x="130" y="121" width="20" height="2" rx="1" fill="rgba(245,49,127,0.3)"/>
    <path d="M92 100Q80 110 80 120Q80 130 92 140" stroke="rgba(245,49,127,0.4)" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M82 95Q64 110 64 120Q64 130 82 145" stroke="rgba(245,49,127,0.2)" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M188 100Q200 110 200 120Q200 130 188 140" stroke="rgba(245,49,127,0.4)" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M198 95Q216 110 216 120Q216 130 198 145" stroke="rgba(245,49,127,0.2)" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="182" cy="50" r="16" fill="#f5317f" opacity="0.95"/>
    <path d="M182 44L182 53" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="182" cy="57" r="1.5" fill="white"/>
    <rect x="28" y="72" width="52" height="20" rx="10" fill="rgba(31,207,122,0.12)" stroke="rgba(31,207,122,0.3)" stroke-width="1"/>
    <text x="54" y="85" text-anchor="middle" fill="#1fcf7a" font-size="9" font-weight="700">SAFE ✓</text>
    <rect x="26" y="140" width="58" height="20" rx="10" fill="rgba(245,49,127,0.12)" stroke="rgba(245,49,127,0.3)" stroke-width="1"/>
    <text x="55" y="153" text-anchor="middle" fill="#f5317f" font-size="9" font-weight="700">"HELP" ⚠</text>
    <rect x="200" y="72" width="54" height="20" rx="10" fill="rgba(196,176,216,0.1)" stroke="rgba(196,176,216,0.3)" stroke-width="1"/>
    <text x="227" y="85" text-anchor="middle" fill="#c4b0d8" font-size="9" font-weight="700">AI ON 🎤</text>
    <defs>
      <radialGradient id="aiGl" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f5317f"/>
        <stop offset="100%" stop-color="#0c0810"/>
      </radialGradient>
    </defs>`;
}

/* ═══════════════════════════════════════════════════════════
   FEATURES + HOW-STEPS
═══════════════════════════════════════════════════════════ */

function renderFeaturesGrid() {
  const el = document.getElementById('features-grid');
  if (!el) return;
  el.innerHTML = FEATURES.map((f, i) => `
    <div class="feature-card animate-fade-up stagger-${(i%6)+1}">
      <div class="feature-icon">${f.icon}</div>
      <div class="feature-title">${f.title}</div>
      <div class="feature-desc">${f.desc}</div>
    </div>`
  ).join('');
}

function renderHowSteps() {
  const el = document.getElementById('how-steps');
  if (!el) return;
  el.innerHTML = HOW_STEPS.map(s => `
    <div class="how-step">
      <div class="how-step-icon" style="background:${s.color};border:1px solid ${s.border}">${s.icon}</div>
      <div>
        <div class="how-step-num">${s.num}</div>
        <div class="how-step-title">${s.title}</div>
        <div class="how-step-desc">${s.desc}</div>
      </div>
    </div>`
  ).join('');
}

/* ═══════════════════════════════════════════════════════════
   RISK GAUGE (SVG arc)
═══════════════════════════════════════════════════════════ */

function renderRiskGauge() {
  const el = document.getElementById('risk-gauge');
  if (!el) return;
  const score = computeRisk();
  const col   = score>70?T.rose : score>45?T.orange : score>25?T.amber : T.green;
  const lbl   = score>70?'DANGER' : score>45?'HIGH' : score>25?'MODERATE' : 'SAFE';
  const arc   = (score/100)*94;
  el.innerHTML = `
    <svg width="80" height="52" viewBox="0 0 80 52">
      <path d="M10 47 A30 30 0 0 1 70 47" stroke="#1e1228" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M10 47 A30 30 0 0 1 70 47" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round"
        stroke-dasharray="${arc} 94" style="transition:stroke-dasharray 0.7s ease,stroke 0.4s ease"/>
      <text x="40" y="46" text-anchor="middle" fill="${col}" font-size="14" font-weight="700" font-family="monospace">${score}</text>
    </svg>
    <span class="risk-score-label" style="color:${col}">${lbl}</span>`;
}

function computeRisk() {
  let best = { d: Infinity, lvl: 'green' };
  state.zones.forEach(z => {
    const d = Math.hypot(z.lat - state.lat, z.lng - state.lng) * 111000;
    if (d < best.d) best = { ...z, d };
  });
  return RISK_MAP[best.lvl] || 12;
}

/* ═══════════════════════════════════════════════════════════
   WAVE VISUALISER
═══════════════════════════════════════════════════════════ */

function renderWave(id, active) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = Array.from({length:18}).map((_, i) => {
    const del = (i * 0.06).toFixed(2);
    const dur = active ? (0.3 + Math.random() * 0.6).toFixed(2) : '1';
    return `<div class="wave-bar" style="height:${active?'20%':'20%'};${active?`animation:wave-bar ${dur}s ease-in-out infinite alternate;animation-delay:${del}s;`:'background:var(--dim)'}"></div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   CONTACTS
═══════════════════════════════════════════════════════════ */

function renderContactsList() {
  const el = document.getElementById('contacts-list');
  if (!el) return;
  el.innerHTML = state.contacts.map(c => `
    <div class="contact-row ${c.notified?'notified':''}" id="contact-row-${c.id}">
      <div class="contact-av" style="background:${c.notified?'rgba(245,49,127,0.15)':'rgba(180,130,200,0.12)'};color:${c.notified?T.pink:T.lilac}">${c.av}</div>
      <div style="flex:1">
        <div class="contact-name">${c.name}</div>
        <div class="contact-phone">${c.phone}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${c.notified ? '<div class="badge badge-red">ALERTED</div>' : ''}
        <button class="call-btn" onclick="startCall(${c.id})" title="Call ${c.name}">📞</button>
      </div>
    </div>`
  ).join('');
  updateProfileStats();
}

function toggleAddContact() {
  const f = document.getElementById('add-contact-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
  if (f.style.display === 'block') {
    f.style.animation = 'fadeUp 0.3s var(--ease-out) both';
  }
}

function saveContact() {
  const name  = document.getElementById('new-contact-name').value.trim();
  const phone = document.getElementById('new-contact-phone').value.trim();
  if (!name) return;
  state.contacts.push({
    id: Date.now(), name, phone, av: name[0].toUpperCase(), notified: false
  });
  pushLog(`👤 ${name} added as trusted contact`);
  document.getElementById('new-contact-name').value = '';
  document.getElementById('new-contact-phone').value = '';
  document.getElementById('add-contact-form').style.display = 'none';
  renderContactsList();
}

/* ═══════════════════════════════════════════════════════════
   POLICE LIST
═══════════════════════════════════════════════════════════ */

function renderPoliceList() {
  const el = document.getElementById('police-list');
  if (!el) return;
  el.innerHTML = MOCK_POLICE.map(ps => `
    <div class="police-row">
      <div class="police-av">P</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${ps.name}</div>
        <div style="font-size:11px;color:#5570aa">${ps.dist} away · ${ps.ph}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="alertPolice('${ps.name}')">Alert</button>
    </div>`
  ).join('');
}

function alertPolice(name) {
  pushLog(`📞 Alert sent to ${name}`);
}

/* ═══════════════════════════════════════════════════════════
   JOURNEY & TRACKING
═══════════════════════════════════════════════════════════ */

function startJourney() {
  state.isTracking = true;
  clearInterval(state.trackTimer);
  clearInterval(state.journeyTimer);
  state.journeyDur = 0;
  state.trackTimer   = setInterval(() => {
    state.lat += (Math.random() - 0.5) * 0.0003;
    state.lng += (Math.random() - 0.4) * 0.0004;
    updateMapCoords();
    renderRiskGauge();
  }, 2000);
  state.journeyTimer = setInterval(() => {
    state.journeyDur++;
    const el = document.getElementById('journey-timer');
    if (el) el.textContent = fmtTime(state.journeyDur);
  }, 1000);
  document.getElementById('journey-idle').style.display   = 'none';
  document.getElementById('journey-active').style.display = 'block';
  document.getElementById('topbar-live').style.display    = 'flex';
  const mb = document.getElementById('map-live-badge');
  if (mb) mb.style.display = 'flex';
  pushLog('🛡️ Journey tracking started');
}

function stopJourney() {
  state.isTracking = false;
  clearInterval(state.trackTimer);
  clearInterval(state.journeyTimer);
  document.getElementById('journey-idle').style.display   = 'block';
  document.getElementById('journey-active').style.display = 'none';
  document.getElementById('topbar-live').style.display    = 'none';
  const mb = document.getElementById('map-live-badge');
  if (mb) mb.style.display = 'none';
  pushLog('⏹ Journey tracking stopped');
}

function fmtTime(s) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

/* ═══════════════════════════════════════════════════════════
   SOS SYSTEM
═══════════════════════════════════════════════════════════ */

function handleSOS() {
  if (state.isEmergency) { deactivateEmergency(); return; }
  if (state.sosStep === 1) return;
  state.sosStep = 1;
  state.sosCount = 5;
  showSOSCountdown();
  state.sosTimer = setInterval(() => {
    state.sosCount--;
    const ct = document.getElementById('sos-count');
    const tt = document.getElementById('sos-count-text');
    if (ct) ct.textContent = state.sosCount;
    if (tt) tt.textContent = `Activating in ${state.sosCount}s…`;
    if (state.sosCount <= 0) { clearInterval(state.sosTimer); activateEmergency(); }
  }, 1000);
}

function showSOSCountdown() {
  document.getElementById('sos-normal').style.display    = 'none';
  document.getElementById('sos-countdown').style.display = 'flex';
}

function cancelSOS() {
  clearInterval(state.sosTimer);
  state.sosStep = 0; state.sosCount = 5;
  document.getElementById('sos-normal').style.display    = 'flex';
  document.getElementById('sos-countdown').style.display = 'none';
}

function activateEmergency() {
  state.isEmergency = true;
  state.sosStep = 2;
  state.isRecording = true;
  state.contacts = state.contacts.map(c => ({ ...c, notified: true }));

  if (!state.isTracking) startJourney();

  const ts  = new Date().toLocaleTimeString();
  const rec = { id: Date.now(), name: `Emergency_${ts}.wav`, dur: 'Recording…', date: ts, sz: '—' };
  state.recordings.unshift(rec);

  document.getElementById('sos-normal').style.display    = 'flex';
  document.getElementById('sos-countdown').style.display = 'none';

  const btn = document.getElementById('sos-btn');
  if (btn) { btn.textContent = 'STOP'; btn.classList.add('emergency'); }
  const hint = document.getElementById('sos-hint');
  if (hint) hint.textContent = 'Tap to cancel emergency';

  updateEmergencyBar();
  updateTopbar();
  renderContactsList();
  renderAlerts();
  pushLog('🚨 Emergency activated — contacts notified');
  updateStatEmerg();
}

function deactivateEmergency() {
  state.isEmergency = false;
  state.sosStep = 0;
  state.isRecording = false;
  state.contacts = state.contacts.map(c => ({ ...c, notified: false }));
  if (state.recordings.length) {
    state.recordings[0].dur = '1m 24s';
    state.recordings[0].sz  = '2.3 MB';
  }

  const btn = document.getElementById('sos-btn');
  if (btn) { btn.textContent = 'SOS'; btn.classList.remove('emergency'); }
  const hint = document.getElementById('sos-hint');
  if (hint) hint.textContent = 'Tap to activate emergency alert';

  updateEmergencyBar();
  updateTopbar();
  renderContactsList();
  renderAlerts();
  pushLog('✅ Emergency deactivated — stay safe');
}

function updateEmergencyBar() {
  const bar = document.getElementById('emergency-bar');
  if (bar) bar.style.display = state.isEmergency ? 'flex' : 'none';
}

function updateTopbar() {
  const em = document.getElementById('topbar-emerg');
  if (em) em.style.display = state.isEmergency ? 'flex' : 'none';
}

/* ═══════════════════════════════════════════════════════════
   AI GUARDIAN
═══════════════════════════════════════════════════════════ */

let aiTypingTO = null;

function onAIInput(val) {
  const clearBtn = document.getElementById('ai-clear-btn');
  if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';

  clearTimeout(aiTypingTO);
  const responseEl = document.getElementById('ai-response');
  const typingEl   = document.getElementById('ai-typing');

  if (!val.trim()) {
    if (typingEl)  typingEl.style.display = 'none';
    if (responseEl) responseEl.innerHTML = '';
    return;
  }

  const lower = val.toLowerCase();
  const match = AI_RESPONSES.find(r => r.keys.some(k => lower.includes(k)));

  if (match) {
    if (typingEl)  typingEl.style.display = 'flex';
    if (responseEl) responseEl.innerHTML = '';

    aiTypingTO = setTimeout(() => {
      if (typingEl)  typingEl.style.display = 'none';
      if (responseEl) responseEl.innerHTML = buildAIResponse(match);
      if (match.level === 'critical') pushLog(`🚨 AI detected critical distress: "${val}"`);
      else pushLog('⚠️ AI detected distress keyword in your message');
    }, 900);

    document.getElementById('ai-card').style.borderColor = 'rgba(232,24,78,0.4)';
  } else {
    if (typingEl)  typingEl.style.display = 'none';
    if (responseEl) responseEl.innerHTML = '';
    document.getElementById('ai-card').style.borderColor = '';
  }
}

function buildAIResponse(match) {
  const isCrit = match.level === 'critical';
  const bg   = isCrit ? 'rgba(232,24,78,0.12)' : 'rgba(245,166,35,0.1)';
  const border = isCrit ? 'rgba(232,24,78,0.4)' : 'rgba(245,166,35,0.35)';
  const col  = isCrit ? T.rose : T.amber;
  const title = isCrit ? '🚨 CRITICAL ALERT' : '⚠️ SAFETY ALERT';

  const actionsBtns = match.actions.map(a => {
    const isPrimary = a.includes('SOS') || a.includes('Yes') || a.includes('police') ||
                      a.includes('Alert') || a.includes('Send') || a.includes('Notify');
    return `<button class="ai-action-btn ${isPrimary?'primary':'secondary'}" onclick="handleAIAction('${a.replace(/'/g,"\\'")}')">${a}</button>`;
  }).join('');

  return `
    <div class="ai-response" style="border:1px solid ${border}">
      <div class="ai-response-header" style="background:${bg}">
        <div class="ai-response-title" style="color:${col}">${title}</div>
        <div class="ai-response-msg">${match.msg}</div>
      </div>
      <div class="ai-response-actions">${actionsBtns}</div>
    </div>`;
}

function handleAIAction(action) {
  if (action.includes('SOS') || action === 'Full SOS' || action === 'Start SOS') {
    activateEmergency();
  } else if (action.includes('Alert') || action === 'Yes, alert now' || action === 'Notify contact') {
    state.contacts = state.contacts.map(c => ({ ...c, notified: true }));
    renderContactsList();
    pushLog('📲 Trusted contacts alerted with your live location');
  } else if (action.includes('police alert')) {
    pushLog('🚔 Emergency alert sent to Central Police Station');
  } else if (action === 'Send location') {
    pushLog('📍 Live location shared with all trusted contacts');
  } else {
    pushLog('ℹ️ AI Guardian standing by');
  }
  document.getElementById('ai-response').innerHTML = '';
  document.getElementById('ai-card').style.borderColor = '';
  clearAI();
}

function clearAI() {
  const inp = document.getElementById('ai-input');
  if (inp) inp.value = '';
  const clearBtn = document.getElementById('ai-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
  document.getElementById('ai-response').innerHTML = '';
  document.getElementById('ai-card').style.borderColor = '';
}

function toggleAI() {
  state.aiListening = !state.aiListening;
  const btn  = document.getElementById('ai-listen-btn');
  const wave = document.getElementById('ai-wave');
  const mon  = document.getElementById('ai-monitoring');
  if (btn) {
    btn.textContent  = state.aiListening ? '⏹ Stop' : '🎤 Start Listening';
    btn.style.color  = state.aiListening ? T.pink : T.muted;
    btn.style.background = state.aiListening ? 'rgba(245,49,127,0.14)' : 'rgba(255,255,255,0.05)';
  }
  if (wave) wave.style.display = state.aiListening ? 'flex' : 'none';
  if (mon)  mon.style.display  = state.aiListening ? 'inline' : 'none';
  pushLog(state.aiListening ? '🎤 AI Guardian is listening…' : '🎤 AI Guardian paused');
}

/* ═══════════════════════════════════════════════════════════
   CALL SYSTEM
═══════════════════════════════════════════════════════════ */

function startCall(contactId) {
  const c = state.contacts.find(x => x.id === contactId);
  if (!c) return;
  state.callingContact = c;
  state.callStatus     = 'ringing';
  state.callDur        = 0;

  const modal = document.getElementById('call-modal');
  const av    = document.getElementById('call-avatar');
  modal.style.display = 'flex';
  modal.style.animation = 'fadeIn 0.3s both';

  document.getElementById('call-name').textContent       = c.name;
  document.getElementById('call-phone-disp').textContent = c.phone;
  document.getElementById('call-note').textContent       = `💡 Demo mode — simulating call with ${c.name}`;
  document.getElementById('call-enc').style.display      = 'none';
  document.getElementById('call-duration').style.display = 'none';

  if (av) { av.textContent = c.av; av.className = 'call-avatar ringing'; }

  document.getElementById('call-status-text').innerHTML = `
    <span style="display:flex;align-items:center;gap:6px">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      Calling…
    </span>`;

  pushLog(`📞 Calling ${c.name}…`);

  clearTimeout(state.callRingTimer);
  state.callRingTimer = setTimeout(() => {
    state.callStatus = 'connected';
    if (av) av.className = 'call-avatar connected';
    document.getElementById('call-enc').style.display = 'flex';
    document.getElementById('call-status-text').innerHTML =
      `<span style="font-size:13px;color:var(--green);font-weight:600">Connected</span>`;
    document.getElementById('call-duration').style.display = 'block';
    clearInterval(state.callTimer);
    state.callTimer = setInterval(() => {
      state.callDur++;
      const el = document.getElementById('call-duration');
      if (el) el.textContent = fmtTime(state.callDur);
    }, 1000);
  }, 3000);
}

function endCall() {
  clearInterval(state.callTimer);
  clearTimeout(state.callRingTimer);
  pushLog(`📞 Call with ${state.callingContact?.name} ended (${fmtTime(state.callDur)})`);
  document.getElementById('call-status-text').innerHTML = `<span style="font-size:14px;color:var(--muted);font-weight:600">Call ended</span>`;
  setTimeout(() => {
    document.getElementById('call-modal').style.display = 'none';
    state.callingContact = null; state.callDur = 0;
  }, 1500);
}

function shareLocationDuringCall() {
  if (state.callingContact) {
    pushLog(`📍 Location shared with ${state.callingContact.name} during call`);
  }
}

/* ═══════════════════════════════════════════════════════════
   GRIP SOS
═══════════════════════════════════════════════════════════ */

document.addEventListener('click', function(e) {
  if (!state.settings.grip) return;
  // Don't trigger on buttons/controls
  if (e.target.closest('button, .btn, .nav-tab, .call-ctrl-btn, .toggle-switch, input, textarea, .type-chip, .when-chip, .severity-btn')) return;

  state.gripCount++;
  clearTimeout(state.gripResetTimer);
  state.gripResetTimer = setTimeout(() => { state.gripCount = 0; updateGripBar(); }, 2000);
  updateGripBar();

  if (state.gripCount >= 5) {
    state.gripCount = 0;
    updateGripBar();
    triggerGripAlert();
  }
});

function updateGripBar() {
  const bar  = document.getElementById('grip-tap-bar');
  const txt  = document.getElementById('grip-count-text');
  const pips = document.getElementById('grip-pips');

  if (!state.settings.grip || state.gripCount === 0) {
    if (bar) bar.style.display = 'none';
    return;
  }
  if (bar) bar.style.display = 'block';
  if (txt) txt.textContent = state.gripCount;
  if (pips) {
    pips.innerHTML = Array.from({length:5}).map((_, i) =>
      `<div class="grip-pip ${i < state.gripCount ? 'filled' : ''}"></div>`
    ).join('');
  }
}

function triggerGripAlert() {
  state.gripAlertActive = true;
  const overlay = document.getElementById('grip-overlay');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('grip-tap-bar').style.display = 'none';
  pushLog('✊ Grip SOS detected — activating emergency in 3s');

  let c = 3;
  state.gripActivateTimer = setInterval(() => {
    c--;
    if (c <= 0) {
      clearInterval(state.gripActivateTimer);
      cancelGripAlert();
      // Don't auto-activate in demo — just show notification
      pushLog('🚨 Grip SOS — emergency would activate now');
    }
  }, 1000);
}

function cancelGripAlert() {
  clearInterval(state.gripActivateTimer);
  state.gripAlertActive = false;
  state.gripCount = 0;
  const overlay = document.getElementById('grip-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS TOGGLES
═══════════════════════════════════════════════════════════ */

function toggleSetting(key) {
  state.settings[key] = !state.settings[key];
  const el = document.getElementById('tog-' + key);
  if (el) el.classList.toggle('on', state.settings[key]);
}

function toggleListening() {
  state.settings.listening = !state.settings.listening;
  const tog  = document.getElementById('tog-listen');
  const wrap = document.getElementById('listening-wrap');
  const badge = document.getElementById('listening-active-badge');
  const notice = document.getElementById('travel-active-notice');

  if (tog) tog.classList.toggle('on', state.settings.listening);
  if (wrap) wrap.style.background = state.settings.listening ? 'rgba(245,49,127,0.07)' : 'rgba(255,255,255,0.02)';
  if (wrap) wrap.style.borderColor = state.settings.listening ? 'rgba(245,49,127,0.25)' : 'var(--border)';
  if (badge) badge.style.display = state.settings.listening ? 'flex' : 'none';

  updateTravelNotice(notice);
  state.aiListening = state.settings.listening;
  pushLog(state.settings.listening ? '🎤 Listening Mode enabled — AI Guardian is active' : '🎤 Listening Mode disabled');
}

function toggleGrip() {
  state.settings.grip = !state.settings.grip;
  const tog  = document.getElementById('tog-grip');
  const wrap = document.getElementById('grip-wrap');
  const badge = document.getElementById('grip-active-badge');
  const notice = document.getElementById('travel-active-notice');

  if (tog) { tog.classList.toggle('on', state.settings.grip); tog.classList.toggle('danger-toggle', state.settings.grip); }
  if (wrap) wrap.style.background = state.settings.grip ? 'rgba(232,24,78,0.07)' : 'rgba(255,255,255,0.02)';
  if (wrap) wrap.style.borderColor = state.settings.grip ? 'rgba(232,24,78,0.25)' : 'var(--border)';
  if (badge) badge.style.display = state.settings.grip ? 'flex' : 'none';

  updateTravelNotice(notice);
  state.gripCount = 0;
  pushLog(state.settings.grip ? '✊ Grip SOS enabled — tap screen 5× rapidly to activate' : '✊ Grip SOS disabled');
}

function updateTravelNotice(el) {
  if (!el) return;
  const show = state.settings.listening || state.settings.grip;
  el.style.display = show ? 'block' : 'none';
}

/* ═══════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════ */

function renderProfile() {
  if (!state.user) return;
  updateProfileAv();
  const nd = document.getElementById('profile-name-disp');
  const ed = document.getElementById('profile-email-disp');
  const pd = document.getElementById('profile-phone-disp');
  if (nd) nd.textContent = state.user.name;
  if (ed) ed.textContent = state.user.email;
  if (pd) pd.textContent = state.user.phone;
  updateProfileStats();
}

function updateProfileAv() {
  const av = document.getElementById('profile-av');
  if (av && state.user) av.textContent = state.user.av;
}

function updateProfileStats() {
  const sc = document.getElementById('ps-contacts');
  const sr = document.getElementById('ps-recs');
  const sp = document.getElementById('ps-reports');
  if (sc) sc.textContent = state.contacts.length;
  if (sr) sr.textContent = state.recordings.length;
  if (sp) sp.textContent = state.reportZoneCount;
}

function updateStatEmerg() {
  const se = document.getElementById('stat-emerg');
  if (se) se.textContent = state.recordings.length;
}

function toggleProfileEdit(show) {
  document.getElementById('profile-view').style.display      = show ? 'none' : 'block';
  document.getElementById('profile-edit-view').style.display = show ? 'block' : 'none';
  if (show && state.user) {
    document.getElementById('edit-name').value  = state.user.name;
    document.getElementById('edit-email').value = state.user.email;
    document.getElementById('edit-phone').value = state.user.phone;
  }
}

function saveProfile() {
  const name  = document.getElementById('edit-name').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  if (!name) return;
  state.user.name  = name;
  state.user.email = email;
  state.user.phone = phone;
  state.user.av    = name.slice(0,2).toUpperCase();
  toggleProfileEdit(false);
  renderProfile();
  pushLog('👤 Profile updated successfully');
}

/* ═══════════════════════════════════════════════════════════
   ALERTS / ACTIVITY LOG
═══════════════════════════════════════════════════════════ */

function pushLog(msg) {
  state.activityLog.unshift({ id: Date.now(), msg, time: new Date().toLocaleTimeString() });
  if (state.activityLog.length > 15) state.activityLog.pop();

  // Badge update
  const badge = document.getElementById('alerts-badge');
  if (badge) {
    badge.textContent = state.activityLog.length > 9 ? '9+' : state.activityLog.length;
    badge.style.display = 'flex';
    badge.style.animation = 'none';
    requestAnimationFrame(() => { badge.style.animation = 'popIn 0.3s var(--ease-spring) both'; });
  }

  // If we're on the alerts tab, re-render
  if (state.tab === 'alerts') renderAlerts();
}

function clearLog() {
  state.activityLog = [];
  renderAlerts();
  const badge = document.getElementById('alerts-badge');
  if (badge) badge.style.display = 'none';
}

function renderAlerts() {
  const logEl = document.getElementById('activity-log');
  if (logEl) {
    if (state.activityLog.length === 0) {
      logEl.innerHTML = '<div style="text-align:center;padding:28px 0;color:var(--dim);font-size:13px">No activity yet</div>';
    } else {
      logEl.innerHTML = state.activityLog.map(n => `
        <div class="log-row">
          <div class="log-msg">${n.msg}</div>
          <div class="log-time">${n.time}</div>
        </div>`
      ).join('');
    }
  }

  // Emergency card
  const emCard = document.getElementById('emerg-alert-card');
  const emBody = document.getElementById('emerg-alert-body');
  if (emCard && state.isEmergency) {
    emCard.style.display = 'block';
    if (emBody) emBody.innerHTML = `
      <div style="color:${T.rose};font-weight:700;margin-bottom:8px">🚨 EMERGENCY ALERT</div>
      <div><span style="color:var(--muted)">Name:     </span>${state.user?.name}</div>
      <div><span style="color:var(--muted)">Location: </span>${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}</div>
      <div><span style="color:var(--muted)">Time:     </span>${new Date().toLocaleTimeString()}</div>
      <div><span style="color:var(--muted)">Phone:    </span>${state.user?.phone}</div>
      <div><span style="color:var(--muted)">Status:   </span><span style="color:${T.rose}">EMERGENCY</span></div>`;
  } else if (emCard) {
    emCard.style.display = 'none';
  }

  // Recordings
  const recActiveEl = document.getElementById('rec-active');
  if (recActiveEl) recActiveEl.style.display = state.isRecording ? 'flex' : 'none';

  const recList = document.getElementById('recordings-list');
  if (recList) {
    if (state.recordings.length === 0) {
      recList.innerHTML = '<div style="text-align:center;padding:28px 0;color:var(--dim);font-size:13px">No recordings yet</div>';
    } else {
      recList.innerHTML = state.recordings.map(r => `
        <div class="rec-row">
          <div class="rec-icon">🎙️</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:var(--text)">${r.name}</div>
            <div style="font-size:11px;color:var(--muted)">${r.date} · ${r.dur} · ${r.sz}</div>
          </div>
          <button onclick="downloadRec('${r.name}')" style="background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;padding:7px 11px;color:var(--muted);cursor:pointer;font-size:13px">⬇</button>
        </div>`
      ).join('');
    }
  }
}

function downloadRec(name) {
  pushLog(`⬇️ Downloading ${name}…`);
}

/* ═══════════════════════════════════════════════════════════
   REPORT INCIDENT
═══════════════════════════════════════════════════════════ */

function renderReportCard() {
  const el = document.getElementById('report-form-view');
  if (!el) return;
  renderReportStepDots();

  switch(state.reportStep) {
    case 'form':      el.innerHTML = buildReportForm();    break;
    case 'confirm':   el.innerHTML = buildReportConfirm(); break;
    case 'submitting':el.innerHTML = buildReportSubmitting(); break;
    case 'success':   el.innerHTML = buildReportSuccess(); break;
  }
}

function renderReportStepDots() {
  const el = document.getElementById('report-steps-dots');
  if (!el) return;
  const steps  = ['form', 'confirm', 'success'];
  const curIdx = ['form','confirm','submitting','success'].indexOf(state.reportStep);
  el.innerHTML = steps.map((s, i) => `
    <div style="width:${state.reportStep===s?'20px':'7px'};height:7px;border-radius:4px;transition:all 0.3s;background:${i<=curIdx?'var(--pink)':'rgba(255,255,255,0.1)'}"></div>`
  ).join('');
}

function buildReportForm() {
  const types = [['🙅','Harassment'],['👤','Stalking'],['💼','Theft'],['⚠️','Assault'],['👀','Suspicious'],['🚧','Unsafe area'],['🚗','Road safety'],['❓','Other']];
  const typeChips = types.map(([ic, t]) => `
    <button class="type-chip ${state.report.type===t?'selected':''}" onclick="setRepType('${t}')">${ic} ${t}</button>`
  ).join('');

  const timeOpts = [['now','Just now'],['15min','~15 min ago'],['1hr','~1 hr ago'],['today','Earlier today'],['yesterday','Yesterday']];
  const whenChips = timeOpts.map(([v,l]) => `
    <button class="when-chip ${state.report.time===v?'selected':''}" onclick="setRepTime('${v}')">${l}</button>`
  ).join('');

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:8px;font-weight:700">INCIDENT TYPE *</div>
        <div class="report-type-chips">${typeChips}</div>
        ${!state.report.type ? '<div style="font-size:11px;color:var(--dim);font-style:italic;margin-top:4px">← tap an incident type above</div>' : ''}
      </div>
      <div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:5px;font-weight:700">DESCRIPTION</div>
        <textarea id="rep-desc" rows="3" placeholder="Describe what happened briefly…" oninput="state.report.desc=this.value"
          style="width:100%;box-sizing:border-box;resize:none;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-size:13px;outline:none;font-family:inherit;line-height:1.55">${state.report.desc}</textarea>
        <div style="font-size:10px;color:var(--dim);text-align:right;margin-top:3px">${state.report.desc.length}/300</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:7px;font-weight:700">SEVERITY</div>
        <div class="severity-btns">
          <button class="severity-btn low ${state.report.severity==='low'?'selected':''}" onclick="setRepSev('low')">🟢 Low</button>
          <button class="severity-btn medium ${state.report.severity==='medium'?'selected':''}" onclick="setRepSev('medium')">🟡 Medium</button>
          <button class="severity-btn high ${state.report.severity==='high'?'selected':''}" onclick="setRepSev('high')">🔴 High</button>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:5px;font-weight:700">WHEN DID THIS HAPPEN?</div>
        <div class="when-chips">${whenChips}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;padding:10px 13px;background:rgba(31,207,122,0.06);border:1px solid rgba(31,207,122,0.15);border-radius:10px">
        <div style="width:28px;height:28px;border-radius:50%;background:rgba(31,207,122,0.15);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">📍</div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--muted)">GPS location will be pinned to this report</div>
          <div style="font-size:12px;font-weight:700;color:var(--green);font-family:'DM Mono',monospace">${state.lat.toFixed(5)}, ${state.lng.toFixed(5)}</div>
        </div>
        ${state.isTracking ? '<div class="live-pill"><div class="live-dot"></div>LIVE</div>' : ''}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 13px;background:rgba(255,255,255,0.025);border-radius:10px;border:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text)">Submit anonymously</div>
          <div style="font-size:11px;color:var(--muted)">Your name won't appear in the report</div>
        </div>
        <div class="toggle-switch ${state.report.anonymous?'on':''}" onclick="toggleRepAnon()"><div class="toggle-knob"></div></div>
      </div>
      <button class="btn btn-danger btn-full" onclick="submitReportForm()" style="opacity:${state.report.type?1:0.45};cursor:${state.report.type?'pointer':'not-allowed'}">
        Review Report →
      </button>
    </div>`;
}

function buildReportConfirm() {
  const whenMap = { now:'Just now','15min':'~15 minutes ago','1hr':'~1 hour ago',today:'Earlier today',yesterday:'Yesterday' };
  const sevColor = state.report.severity==='high'?T.rose : state.report.severity==='medium'?T.amber : T.green;
  const rows = [
    ['Type',     state.report.type, T.text],
    ['Severity', state.report.severity.toUpperCase(), sevColor],
    ['When',     whenMap[state.report.time] || 'Just now', T.textSub],
    ['Location', `${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}`, T.green],
    ['Reporter', state.report.anonymous ? 'Anonymous' : state.user?.name, T.textSub],
  ].map(([label, val, col]) => `
    <div style="display:flex;align-items:flex-start;gap:10px">
      <span style="font-size:11px;color:var(--dim);width:68px;flex-shrink:0;padding-top:1px">${label}</span>
      <span style="font-size:13px;color:${col};font-weight:600">${val}</span>
    </div>`
  ).join('');

  const descRow = state.report.desc ? `
    <div style="display:flex;align-items:flex-start;gap:10px">
      <span style="font-size:11px;color:var(--dim);width:68px;flex-shrink:0;padding-top:1px">Details</span>
      <span style="font-size:12px;color:var(--text-sub);line-height:1.5">${state.report.desc}</span>
    </div>` : '';

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="font-size:13px;color:var(--text-sub)">Please review your report before submitting.</div>
      <div style="background:rgba(232,97,26,0.07);border:1px solid rgba(232,97,26,0.22);border-radius:12px;overflow:hidden">
        <div style="padding:10px 14px;background:rgba(232,97,26,0.12);border-bottom:1px solid rgba(232,97,26,0.15);font-size:11px;font-weight:700;letter-spacing:1px;color:var(--orange)">📋 INCIDENT REPORT PREVIEW</div>
        <div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">${rows}${descRow}</div>
      </div>
      <div style="font-size:12px;color:var(--muted);padding:8px 12px;background:rgba(255,255,255,0.025);border-radius:9px;border:1px solid var(--border)">
        ℹ️ This report will be shared with SafeZone's community safety network and may be forwarded to local authorities.
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="state.reportStep='form';renderReportCard()">← Edit</button>
        <button class="btn btn-danger btn-sm" style="flex:1" onclick="confirmReport()">✓ Confirm & Submit</button>
      </div>
    </div>`;
}

function buildReportSubmitting() {
  return `
    <div style="text-align:center;padding:28px 0">
      <div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">Submitting your report…</div>
      <div style="font-size:12px;color:var(--muted)">Encrypting and sending to the safety network</div>
    </div>`;
}

function buildReportSuccess() {
  const ref = 'RPT-' + Date.now().toString(36).toUpperCase().slice(-6);
  const sevColor = state.report.severity==='high'?T.rose : state.report.severity==='medium'?T.amber : T.green;
  const nextSteps = [
    ['🗺️','Pinned on the safety map','Your report is now visible to nearby users as a danger zone'],
    ['👮','Forwarded to authorities','Local police notified if severity is high'],
    ['📲','Community alerted','Nearby SafeZone users get a safety nudge'],
  ].map(([ic, title, sub], i, arr) => `
    <div style="display:flex;gap:12px;padding:11px 13px;border-bottom:${i<arr.length-1?'1px solid var(--border)':'none'};align-items:flex-start">
      <span style="font-size:16px;flex-shrink:0">${ic}</span>
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:1px">${title}</div>
        <div style="font-size:11px;color:var(--muted)">${sub}</div>
      </div>
    </div>`
  ).join('');

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="text-align:center;padding:16px 0 8px">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(31,207,122,0.12);border:2px solid rgba(31,207,122,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;box-shadow:0 0 24px rgba(31,207,122,0.2);animation:popIn 0.5s var(--ease-spring) both">✅</div>
        <div style="font-size:17px;font-weight:800;color:var(--green);margin-bottom:3px">Report Submitted!</div>
        <div style="font-size:12px;color:var(--muted)">Your incident has been recorded and shared safely.</div>
      </div>
      <div style="background:rgba(31,207,122,0.06);border:1px solid rgba(31,207,122,0.2);border-radius:12px;padding:12px 14px">
        <div style="font-size:10px;color:var(--muted);margin-bottom:6px;font-weight:700;letter-spacing:0.8px">REPORT REFERENCE</div>
        <div class="report-success-ref">${ref}</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <div style="display:flex;gap:10px"><span style="font-size:11px;color:var(--dim);width:64px">Type</span><span style="font-size:12px;font-weight:600;color:var(--text)">${state.report.type||'Incident'}</span></div>
          <div style="display:flex;gap:10px"><span style="font-size:11px;color:var(--dim);width:64px">Severity</span><span style="font-size:12px;font-weight:700;color:${sevColor};text-transform:capitalize">${state.report.severity}</span></div>
          <div style="display:flex;gap:10px"><span style="font-size:11px;color:var(--dim);width:64px">Time</span><span style="font-size:12px;color:var(--text-sub)">${new Date().toLocaleTimeString()}</span></div>
          <div style="display:flex;gap:10px"><span style="font-size:11px;color:var(--dim);width:64px">Location</span><span style="font-size:12px;color:var(--green);font-family:'DM Mono',monospace">${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}</span></div>
        </div>
      </div>
      <div style="border-radius:12px;border:1px solid var(--border);overflow:hidden">
        <div style="padding:9px 13px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:0.8px;color:var(--muted)">WHAT HAPPENS NEXT</div>
        ${nextSteps}
      </div>
      <button class="btn btn-soft btn-full" onclick="resetReport()">+ Report another incident</button>
    </div>`;
}

function setRepType(t)  { state.report.type = t; renderReportCard(); }
function setRepSev(s)   { state.report.severity = s; renderReportCard(); }
function setRepTime(t)  { state.report.time = t; renderReportCard(); }
function toggleRepAnon(){ state.report.anonymous = !state.report.anonymous; renderReportCard(); }

function submitReportForm() {
  if (!state.report.type) return;
  state.reportStep = 'confirm';
  renderReportCard();
}

function confirmReport() {
  state.reportStep = 'submitting';
  renderReportCard();
  setTimeout(() => {
    const sevMap = { low:'green', medium:'orange', high:'red' };
    state.zones.push({
      id: Date.now(),
      lat: state.lat + (Math.random()-.5)*.003,
      lng: state.lng + (Math.random()-.5)*.003,
      r:   state.report.severity==='high'?140 : state.report.severity==='medium'?100 : 70,
      lvl: sevMap[state.report.severity] || 'orange',
      label: state.report.type,
    });
    state.reportZoneCount++;
    pushLog(`📍 ${state.report.type} reported — zone pinned on map`);
    if (state.report.severity==='high') pushLog('👮 High severity — authorities notified automatically');
    state.reportStep = 'success';
    renderReportCard();
    updateProfileStats();
  }, 1800);
}

function resetReport() {
  state.reportStep = 'form';
  state.report = { type:'', desc:'', severity:'medium', time:'now', anonymous:false };
  renderReportCard();
}

/* ═══════════════════════════════════════════════════════════
   MAP CANVAS
═══════════════════════════════════════════════════════════ */

function initLandingMap() {
  const cv = document.getElementById('landing-map');
  if (!cv) return;
  cancelAnimationFrame(state.landingMapAnimFrame);
  const dpr = window.devicePixelRatio || 1;
  const setSize = () => {
    cv.width  = cv.offsetWidth  * dpr;
    cv.height = cv.offsetHeight * dpr;
  };
  setSize();
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  const drawMap = () => {
    state.landingPhi += 0.025;
    drawMapFrame(ctx, cv.offsetWidth, cv.offsetHeight, state.landingPhi, false, false,
      state.zones, MOCK_POLICE, 8.8922, 76.614);
    state.landingMapAnimFrame = requestAnimationFrame(drawMap);
  };
  drawMap();
}

function startAppMap() {
  if (state.tab !== 'map') return;
  const cv = document.getElementById('app-map');
  if (!cv) return;
  cancelAnimationFrame(state.mapAnimFrame);
  const dpr = window.devicePixelRatio || 1;
  const setSize = () => {
    cv.width  = cv.offsetWidth  * dpr;
    cv.height = cv.offsetHeight * dpr;
  };
  setSize();
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  const drawMap = () => {
    state.mapPhi += 0.03;
    drawMapFrame(ctx, cv.offsetWidth, cv.offsetHeight, state.mapPhi,
      state.isTracking, state.isEmergency,
      state.zones, MOCK_POLICE, state.lat, state.lng);
    state.mapAnimFrame = requestAnimationFrame(drawMap);
  };
  drawMap();
}

function drawMapFrame(ctx, w, h, phi, isTracking, emergency, zones, police, lat, lng) {
  const toXY = (la, lo) => {
    const bLat=8.892, bLng=76.614, sc=5800;
    return { x: w/2 + (lo-bLng)*sc, y: h/2 - (la-bLat)*sc };
  };

  // bg
  ctx.fillStyle = '#0c0810'; ctx.fillRect(0,0,w,h);

  // grid
  ctx.strokeStyle = '#15101e'; ctx.lineWidth = 1;
  for (let x=0; x<w; x+=36) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y=0; y<h; y+=36) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

  // roads
  const roads = [[.15,0,.15,1],[.4,0,.4,1],[.68,0,.68,1],[0,.35,1,.35],[0,.6,1,.6],[.15,.35,.4,.6],[.4,0,.68,.35]];
  roads.forEach(([x1r,y1r,x2r,y2r]) => {
    ctx.strokeStyle='#2a1535'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x1r*w,y1r*h); ctx.lineTo(x2r*w,y2r*h); ctx.stroke();
    ctx.strokeStyle='#1e0f28'; ctx.lineWidth=1.5; ctx.stroke();
  });

  // zones
  zones.forEach(z => {
    const pos = toXY(z.lat, z.lng);
    const rgb = ZONE_RGBA[z.lvl] || ZONE_RGBA.orange;
    const r   = z.r * (w/780);
    const g   = ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,r);
    g.addColorStop(0, `rgba(${rgb},0.28)`);
    g.addColorStop(.7,`rgba(${rgb},0.12)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pos.x,pos.y,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=`rgba(${rgb},0.55)`; ctx.lineWidth=1.2;
    ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
  });

  // safe route
  if (isTracking) {
    const pts = [toXY(lat,lng),toXY(8.891,76.615),toXY(8.890,76.617),toXY(8.889,76.619)];
    ctx.strokeStyle='rgba(31,207,122,0.5)'; ctx.lineWidth=3;
    ctx.setLineDash([8,5]); ctx.beginPath();
    pts.forEach((pt,i) => i===0 ? ctx.moveTo(pt.x,pt.y) : ctx.lineTo(pt.x,pt.y));
    ctx.stroke(); ctx.setLineDash([]);
  }

  // police
  police.forEach(ps => {
    const pos = toXY(ps.lat,ps.lng);
    ctx.fillStyle='#4080ff'; ctx.beginPath(); ctx.arc(pos.x,pos.y,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 8px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('P',pos.x,pos.y);
  });

  // user dot
  const up  = toXY(lat, lng);
  const pls = Math.sin(phi)*0.5+0.5;
  const dc  = emergency ? '245,49,127' : isTracking ? '31,207,122' : '180,130,200';

  if (emergency || isTracking) {
    ctx.strokeStyle=`rgba(${dc},${0.25+pls*0.4})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(up.x,up.y,18+pls*12,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle=`rgba(${dc},${0.1+pls*0.2})`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(up.x,up.y,30+pls*18,0,Math.PI*2); ctx.stroke();
  }
  ctx.fillStyle=`rgb(${dc})`;
  ctx.beginPath(); ctx.arc(up.x,up.y,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(up.x,up.y,3,0,Math.PI*2); ctx.fill();
}

function updateMapCoords() {
  const el = document.getElementById('map-coords');
  if (el) el.textContent = `📍 ${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}`;
}

function updateZoneCounts() {
  const el = document.getElementById('zone-counts');
  if (!el) return;
  const groups = [['red','🔴'],['orange','🟠'],['yellow','🟡']];
  el.innerHTML = groups.map(([k, e]) => {
    const n = state.zones.filter(z => z.lvl === k).length;
    return n > 0 ? `<div style="background:rgba(12,8,16,0.85);backdrop-filter:blur(6px);border-radius:8px;padding:3px 8px;font-size:10px;font-weight:700;color:var(--text);border:1px solid var(--border)">${e} ${n}</div>` : '';
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
═══════════════════════════════════════════════════════════ */

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeUp 0.6s var(--ease-out) both';
        entry.target.style.opacity   = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.why-row, .how-step, .cta-band, .map-frame').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

/* ═══════════════════════════════════════════════════════════
   CLEANUP
═══════════════════════════════════════════════════════════ */

function clearAll() {
  clearInterval(state.trackTimer);
  clearInterval(state.journeyTimer);
  clearInterval(state.sosTimer);
  clearInterval(state.callTimer);
  clearTimeout(state.callRingTimer);
  clearTimeout(state.gripResetTimer);
  clearInterval(state.gripActivateTimer);
  cancelAnimationFrame(state.mapAnimFrame);
  cancelAnimationFrame(state.landingMapAnimFrame);
  state.isTracking = false;
  state.isEmergency = false;
  state.sosStep = 0;
  state.isRecording = false;
}

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  renderSVGs();
  renderFeaturesGrid();
  renderHowSteps();
  initLandingMap();
  initScrollAnimations();

  // Animate stat numbers on landing
  animateStatNumbers();
});

function animateStatNumbers() {
  document.querySelectorAll('.stat-num').forEach(el => {
    el.style.animation = 'fadeUp 0.6s var(--ease-out) 0.6s both';
  });
}
async function loadDangerZones() {
    try {
        const response = await fetch("http://localhost:3000/dangerzones");
        const data = await response.json();

        state.zones = data;

        console.log("Loaded from Neo4j:", data);

    } catch (err) {
        console.error("Error loading danger zones:", err);
    }
}

loadDangerZones();