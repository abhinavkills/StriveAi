// ==========================================
// Page Renderers - All page UI generation
// ==========================================
import { subjectConfig, quizData, ranks, defaultSyllabi } from './data.js';
import { supabase } from './supabase.js';
import { generateGamifiedSyllabus, generateStudyNotes, generateStudyPlan } from './gemini.js';

// Game state
export const gameState = {
  playerName: '',
  guideName: '',
  xp: 0,
  completedTiles: {},
  currentSubject: null,
  currentSyllabus: null,
  currentLevelIndex: 0,
  tasks: [],
  notes: [],
  lastActiveSubject: null
};

// --- Supabase Sync Functions ---
export async function loadUserStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile) {
    gameState.xp = profile.xp || 0;
    gameState.guideName = profile.guide_name || '';
    gameState.lastActiveSubject = profile.last_active_subject || null;
  }

  const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id);
  if (tasks) gameState.tasks = tasks;

  const { data: notes } = await supabase.from('notes').select('*').eq('user_id', user.id);
  if (notes) gameState.notes = notes;

  const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
  if (progress) {
    gameState.completedTiles = {};
    progress.forEach(p => {
      if (!gameState.completedTiles[p.subject_id]) gameState.completedTiles[p.subject_id] = [];
      gameState.completedTiles[p.subject_id].push(p.tile_index);
    });
  }
}

export async function saveProfileUpdate() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({ 
    xp: gameState.xp, 
    guide_name: gameState.guideName,
    last_active_subject: gameState.lastActiveSubject
  }).eq('id', user.id);
}

export async function addTaskDB(title) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase.from('tasks').insert([{ user_id: user.id, title }]).select().single();
  if (data) gameState.tasks.push(data);
  return data;
}

export async function toggleTaskDB(taskId, isCompleted) {
  await supabase.from('tasks').update({ is_completed: isCompleted }).eq('id', taskId);
}

export async function deleteTaskDB(taskId) {
  await supabase.from('tasks').delete().eq('id', taskId);
  gameState.tasks = gameState.tasks.filter(t => t.id !== taskId);
}

export async function addNoteDB(topic, content) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase.from('notes').insert([{ user_id: user.id, topic, content }]).select().single();
  if (data) gameState.notes.push(data);
  return data;
}

export async function saveProgressDB(subjectId, tileIndex) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_progress').upsert({ 
    user_id: user.id, 
    subject_id: subjectId, 
    tile_index: tileIndex 
  });
}

export async function saveSyllabusDB(subjectId, syllabusJson) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('syllabi').upsert({
    user_id: user.id,
    subject_id: subjectId,
    content: syllabusJson
  });
}

export async function loadSyllabusDB(subjectId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('syllabi').select('content').eq('user_id', user.id).eq('subject_id', subjectId).single();
  return data ? data.content : null;
}
// --- End Sync Functions ---

function getRank(xp) {
  let rank = ranks[0];
  for (const r of ranks) { if (xp >= r.xpRequired) rank = r; }
  return rank;
}

// Expression image mapping - each file has 3 expressions side-by-side
// We use CSS object-position to crop to a specific expression
const expressions = {
  neutral:      { src: '/assets/expr_neutral_happy.jpeg', pos: '0% 0%' },
  neutralSad:   { src: '/assets/expr_neutral_happy.jpeg', pos: '50% 0%' },
  thinking:     { src: '/assets/expr_neutral_happy.jpeg', pos: '50% 0%' },
  happy:        { src: '/assets/expr_neutral_happy.jpeg', pos: '100% 0%' },
  smug:         { src: '/assets/expr_neutral_happy.jpeg', pos: '100% 0%' },
  curious:      { src: '/assets/expr_concerned.jpeg', pos: '0% 0%' },
  surprised:    { src: '/assets/expr_concerned.jpeg', pos: '50% 0%' },
  awkward:      { src: '/assets/expr_concerned.jpeg', pos: '100% 0%' },
  angry:        { src: '/assets/expr_angry.jpeg', pos: '0% 0%' },
  annoyed:      { src: '/assets/expr_angry.jpeg', pos: '50% 0%' },
  tsundere:     { src: '/assets/expr_angry.jpeg', pos: '100% 0%' },
  determined:   { src: '/assets/expr_angry.jpeg', pos: '0% 0%' },
  crying:       { src: '/assets/expr_concerned.jpeg', pos: '100% 0%' }, 
  embarrassed:  { src: '/assets/expr_concerned.jpeg', pos: '100% 0%' },
};

// Dialogue pools
const thinkingDialogues = ["Take your time~", "Think carefully now...", "Don't be hasty!", "Hmm, what do you think?", "No rush, consider each option!"];
const incorrectDialogues = ["That's not quite right...", "It's not the end of the world!", "Let's try again next time!", "Almost! Don't give up~", "Oops! But you're learning!"];
const correctDialogues = ["Well done! ✨", "Excellent thinking!", "You're improving!", "Brilliant answer! 🌟", "I knew you could do it~ 💖"];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Visual novel typewriter system
function typewriterVN(element, text, speed = 30, onComplete) {
  let i = 0;
  let typing = true;
  const raw = text;

  function tick() {
    if (!typing) return;
    if (i < raw.length) {
      element.innerHTML = raw.substring(0, i + 1) + '<span class="typing-cursor"></span>';
      i++;
      setTimeout(tick, speed + Math.random() * 15);
    } else {
      element.innerHTML = raw;
      if (onComplete) onComplete();
    }
  }

  // Click to skip
  const skipHandler = () => {
    if (i < raw.length) {
      typing = false;
      element.innerHTML = raw;
      i = raw.length;
      if (onComplete) onComplete();
    }
  };
  element.closest('.dialogue-box, .quiz-guide-dialogue, .intro-page, .subject-intro-overlay')
    ?.addEventListener('click', skipHandler, { once: true });
  document.addEventListener('click', skipHandler, { once: true });

  tick();
}

// Floating widgets from widgets.jpeg (spritesheet approach)
function createFloatingWidgets(count = 6) {
  // The widgets.jpeg has a 7x3 grid of icons. We'll use random crop positions.
  const positions = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      positions.push({ x: (col / 6) * 100, y: (row / 2) * 100 });
    }
  }
  return Array.from({ length: count }, () => {
    const p = positions[Math.floor(Math.random() * positions.length)];
    const left = 2 + Math.random() * 90;
    const top = 5 + Math.random() * 85;
    const delay = Math.random() * 5;
    const size = 50 + Math.random() * 40;
    const dur = 5 + Math.random() * 4;
    return `<div class="floating-widget" style="left:${left}%;top:${top}%;animation-delay:${delay}s;animation-duration:${dur}s;width:${size}px;height:${size}px">
      <div class="widget-sprite" style="background-position:${p.x}% ${p.y}%"></div>
    </div>`;
  }).join('');
}

// Remove white background from JPEG logos using canvas
function removeWhiteBG(imgSrc, canvasId, width = 600) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ratio = img.height / img.width;
    canvas.width = width;
    canvas.height = width * ratio;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      const brightness = (r + g + b) / 3;
      // Fully transparent for very bright pixels
      if (brightness > 220) {
        d[i+3] = 0;
      }
      // Gradient transparency for slightly less bright pixels
      else if (brightness > 170) {
        const alpha = Math.floor(((220 - brightness) / 50) * 255);
        d[i+3] = Math.min(d[i+3], alpha);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };
  img.src = imgSrc;
}

// ==========================================
// 1. LOGIN PAGE
// ==========================================
export function renderLoginPage(container, data) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-bg-particles"></div>
      <div class="login-floating-runes">
        <span class="float-rune fr1">ᚠ</span>
        <span class="float-rune fr2">ᚷ</span>
        <span class="float-rune fr3">ᛗ</span>
        <span class="float-rune fr4">ᛈ</span>
        <span class="float-rune fr5">ᛞ</span>
        <span class="float-rune fr6">ᛟ</span>
      </div>
      <div class="login-container">
        <div class="login-card-flipper" id="cardFlipper">
          <!-- ===== LOGIN FRONT ===== -->
          <div class="login-card login-card-front">
            <div class="login-ornate-border"></div>
            <div class="login-crest">
              <canvas id="loginLogoFront" class="login-logo-canvas"></canvas>
            </div>
            <div class="login-title-block">
              <p class="login-tagline">FORGE YOUR LEGACY</p>
            </div>
            <form class="login-form" id="loginForm">
              <div class="form-group">
                <label>Arcane Address (Email)</label>
                <div class="input-wrapper">
                  <span class="input-icon">📧</span>
                  <input type="email" id="loginEmail" placeholder="Enter your email..." required autocomplete="on" />
                </div>
              </div>
              <div class="form-group">
                <label>Secret Incantation</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input type="password" id="loginPass" placeholder="Whisper your password..." required />
                </div>
              </div>
              <button type="submit" class="login-btn" id="loginBtn">
                <span class="btn-icon">⚔️</span> LOGIN
              </button>
              <p class="login-or-text">or create a new account</p>
              <button type="button" class="guest-btn" id="guestBtn">🌟 Continue as Guest</button>
            </form>
            <div class="login-bottom-bar">
              <button class="bottom-action-btn" id="showSignup">CREATE ACCOUNT</button>
              <div class="bottom-divider"></div>
              <button class="bottom-action-btn" id="supportBtn">SUPPORT</button>
            </div>
          </div>
          <!-- ===== SIGNUP BACK ===== -->
          <div class="login-card login-card-back">
            <div class="login-ornate-border"></div>
            <div class="login-crest">
              <canvas id="loginLogoBack" class="login-logo-canvas"></canvas>
            </div>
            <div class="login-title-block">
              <p class="login-tagline">BEGIN YOUR ADVENTURE</p>
            </div>
            <form class="login-form" id="signupForm">
              <div class="form-group">
                <label>Adventurer Name</label>
                <div class="input-wrapper">
                  <span class="input-icon">👤</span>
                  <input type="text" id="signupName" placeholder="Choose your name..." required autocomplete="off" />
                </div>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <div class="input-wrapper">
                  <span class="input-icon">📧</span>
                  <input type="email" id="signupEmail" placeholder="Your arcane address..." required autocomplete="on" />
                </div>
              </div>
              <div class="form-group">
                <label>Create Incantation</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input type="password" id="signupPass" placeholder="Create your password..." required />
                </div>
              </div>
              <button type="submit" class="login-btn" id="signupBtn">
                <span class="btn-icon">✦</span> JOIN THE ACADEMY
              </button>
            </form>
            <div class="login-bottom-bar">
              <button class="bottom-action-btn" id="showLogin">SIGN IN</button>
              <div class="bottom-divider"></div>
              <button class="bottom-action-btn">SUPPORT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render logo with background removed
  removeWhiteBG('/assets/strive_logo.jpeg', 'loginLogoFront', 500);
  removeWhiteBG('/assets/strive_logo.jpeg', 'loginLogoBack', 500);

  // Flip card
  const flipper = document.getElementById('cardFlipper');
  document.getElementById('showSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    flipper.classList.add('flipped');
  });
  document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    flipper.classList.remove('flipped');
  });

  // Guest Login - skip auth entirely
  document.getElementById('guestBtn')?.addEventListener('click', () => {
    gameState.playerName = 'Guest Adventurer';
    const btn = document.getElementById('guestBtn');
    btn.textContent = '✨ Portal Opening...';
    setTimeout(() => {
      if (data.router) data.router.navigate('intro', { router: data.router, particles: data.particles });
    }, 500);
  });

  // Login Handler
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;
    const btn = document.getElementById('loginBtn');

    btn.textContent = '✨ Opening Portal...';
    btn.disabled = true;

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert(`Portal Error: ${error.message}`);
        btn.innerHTML = '<span class="btn-icon">⚔️</span> LOGIN';
        btn.disabled = false;
        return;
      }

      gameState.playerName = authData.user.user_metadata?.full_name || 'Brave Soul';
      await loadUserStats();
      if (data.router) data.router.navigate('intro', { router: data.router, particles: data.particles });
    } catch (err) {
      alert(`Connection Error: ${err.message}`);
      btn.innerHTML = '<span class="btn-icon">⚔️</span> LOGIN';
      btn.disabled = false;
    }
  });

  // Signup Handler
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPass').value;

    if (password.length < 6) {
      alert('Your password must be at least 6 characters long!');
      return;
    }

    const btn = document.getElementById('signupBtn');
    btn.textContent = '✨ Casting Spell...';
    btn.disabled = true;

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) {
        alert(`Spell Mishap: ${error.message}`);
        btn.innerHTML = '<span class="btn-icon">✦</span> JOIN THE ACADEMY';
        btn.disabled = false;
        return;
      }

      // If auto-confirmed (no email verification), log in directly
      if (authData.session) {
        gameState.playerName = name;
        await loadUserStats();
        if (data.router) data.router.navigate('intro', { router: data.router, particles: data.particles });
      } else {
        alert('✉️ Check your email to confirm your enrollment, then sign in!');
        flipper.classList.remove('flipped');
        btn.innerHTML = '<span class="btn-icon">✦</span> JOIN THE ACADEMY';
        btn.disabled = false;
      }
    } catch (err) {
      alert(`Connection Error: ${err.message}`);
      btn.innerHTML = '<span class="btn-icon">✦</span> JOIN THE ACADEMY';
      btn.disabled = false;
    }
  });

  if (data.particles) {
    data.particles.start(30, { color: 'rgba(212, 168, 71, 0.5)', maxSize: 2.5, speed: 0.4 });
  }
}

// ==========================================
// 2. CHARACTER INTRO PAGE
// ==========================================
export function renderIntroPage(container, data) {
  container.innerHTML = `
    <div class="intro-page">
      <button class="sign-out-btn" id="logoutBtn">✦ LOGOUT</button>
      <div class="intro-content">
        <div class="guide-character-wrapper">
          <div class="guide-character-container" id="guideContainer">
            <div class="guide-character-sprite" id="guideSprite" 
                 style="background-image: url('/assets/expr_neutral_happy.jpeg'); background-position: 0% 0%"></div>
          </div>
          <div class="guide-glow"></div>
        </div>
        <div class="intro-dialogue">
          <div class="dialogue-box" id="dialogueBox">
            <p id="introText"></p>
          </div>
          <div class="name-input-section" id="nameSection" style="display:none">
            <p>✨ What shall you call me? ✨</p>
            <div class="name-input-row">
              <input type="text" id="guideNameInput" placeholder="Give me a name..." maxlength="20" />
              <button class="confirm-btn" id="confirmNameBtn">✦ Bestow</button>
            </div>
          </div>
          <button class="continue-btn" id="continueBtn">⚔️ BEGIN ADVENTURE ⚔️</button>
        </div>
      </div>
    </div>
  `;

  const guideSprite = document.getElementById('guideSprite');
  const textEl = document.getElementById('introText');

  // Preload expressions to avoid glitching
  Object.values(expressions).forEach(e => {
    const img = new Image();
    img.src = e.src;
  });

  function setExpression(expr) {
    const e = expressions[expr] || expressions.neutral;
    guideSprite.style.backgroundImage = `url('${e.src}')`;
    guideSprite.style.backgroundPosition = e.pos;
  }

  const username = gameState.playerName || 'adventurer';
  
  // CHECK FOR RETURNING USER
  if (gameState.guideName) {
    setExpression('happy');
    typewriterVN(textEl, `Welcome back, Master ${username}! ✨ I, ${gameState.guideName}, have been keeping your study scrolls safe. Ready to continue our quest?`, 30, () => {
      const contBtn = document.getElementById('continueBtn');
      contBtn.textContent = '⚔️ CONTINUE QUEST ⚔️';
      contBtn.classList.add('visible');
    });
  } else {
    const introSteps = [
      { expr: 'happy', text: `Oh! A new adventurer approaches! Welcome, ${username}! 💫` },
      { expr: 'neutral', text: `I've been waiting for someone curious and bold like you to find their way here~ ✨` },
      { expr: 'happy', text: `I'll be your guide through this magical realm of learning. Together, we'll conquer knowledge quests! 🌟` },
      { expr: 'neutralSad', text: `But first... every guide needs a name, don't you think? Something cute, perhaps? 😊` },
    ];

    let stepIdx = 0;

    function playStep() {
      if (stepIdx >= introSteps.length) {
        document.getElementById('nameSection').style.display = 'block';
        document.getElementById('nameSection').style.animation = 'fadeSlideUp 0.6s var(--ease-bounce)';
        return;
      }
      const step = introSteps[stepIdx];
      setExpression(step.expr);
      typewriterVN(textEl, step.text, 30, () => {
        stepIdx++;
        setTimeout(playStep, 1000);
      });
    }

    setTimeout(playStep, 800);
  }

  document.getElementById('confirmNameBtn').addEventListener('click', async () => {
    const name = document.getElementById('guideNameInput').value.trim() || 'Luna';
    gameState.guideName = name;
    await saveProfileUpdate();
    setExpression('happy');
    typewriterVN(textEl, `${name}... I love it! 💖 From now on, I'm ${name}, your loyal companion on this adventure!`, 25, () => {
      document.getElementById('nameSection').style.display = 'none';
      document.getElementById('continueBtn').classList.add('visible');
    });
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
  });

  document.getElementById('continueBtn').addEventListener('click', () => {
    if (data.router) data.router.navigate('subjects', { router: data.router, particles: data.particles });
  });

  if (data.particles) {
    data.particles.start(25, { color: 'rgba(0, 212, 255, 0.4)', maxSize: 2, speed: 0.3 });
  }
}

// ==========================================
// 3. SUBJECT SELECTION PAGE - ARTIFACT INVOKING
// ==========================================
export function renderSubjectsPage(container, data) {
  // Get all subjects including essentials for a unified choice page
  const subjects = Object.entries(subjectConfig);

  const cardsHtml = subjects.map(([key, sub], i) => `
    <div class="academy-card discipline-card" data-subject="${key}" style="animation-delay:${i * 0.1}s; --card-accent:${sub.color}">
      <div class="academy-card-frame">
        <div class="academy-card-art" style="background-image: url('${sub.cardArt}')">
          <div class="card-overlay-glow"></div>
        </div>
      </div>
      <div class="academy-card-content">
        <h3 class="academy-card-title medieval-bold">${sub.name.toUpperCase()}</h3>
        <p class="academy-card-role medieval-text">${sub.role}</p>
        <button class="begin-path-btn medieval-bold">INVOKE POWER</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="subjects-page mastery-hall-layout">
      <!-- TOP BANNER GRAND SCROLL -->
      <div class="mastery-banner">
        <button class="sign-out-btn" id="logoutBtn">✦ LOGOUT</button>
        <div class="banner-gold-rim"></div>
        <h1 class="medieval-bold">HALL OF ARCANE DISCIPLINES</h1>
        <p class="subtitle medieval-text">CHOOSE YOUR PATH TO ELDRITCH MASTERY</p>
      </div>

      <!-- ACTIVE QUEST STATUS -->
      <div class="active-quest-panel">
        <div class="active-quest-card">
          <div class="quest-status-badge">CURRENT OBJECTIVE</div>
          <div id="activeQuestContainer">
             <p class="medieval-text" style="color:var(--text-secondary); opacity:0.7;">No active quest found in your logs.</p>
          </div>
        </div>
      </div>

      <!-- CENTRALIZED CARDS AREA -->
      <div class="mastery-container">
        <div class="mastery-cards-grid">
          ${cardsHtml}
        </div>
      </div>

      <!-- COMPANION WIDGET (Minimalized) -->
      <div class="mastery-companion">
        <div class="comp-bubble">
          <p class="medieval-text">The stars align, seeker. Which path calls to your spirit?</p>
        </div>
        <div class="comp-avatar">
          <img src="/assets/expr_neutral_happy.jpeg" alt="Guide">
        </div>
      </div>

      <!-- TRANSITION OVERLAY -->
      <div class="sword-tear-overlay" id="swordTear" style="display:none">
        <div class="tear-left"></div>
        <div class="tear-right"></div>
        <div class="tear-reveal" id="tearReveal">
          <div class="tear-icon" id="tearIcon"></div>
          <h1 id="tearSubjectName" class="medieval-bold"></h1>
          <p class="tear-role medieval-text" id="tearRole"></p>
          <div class="tear-brief-bubble medieval-text" id="tearBrief"></div>
        </div>
      </div>
    </div>
  `;

  // Render Active Quest if it exists
  const activeQuestContainer = document.getElementById('activeQuestContainer');
  const lastTask = gameState.tasks.filter(t => !t.is_completed).pop();
  const activeSub = gameState.currentSubject || gameState.lastActiveSubject;
  
  if (activeSub && activeSub !== 'essentials') {
    activeQuestContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:15px; padding: 5px;">
        <span style="font-size:2rem;">${subjectConfig[activeSub].icon}</span>
        <div>
          <h4 class="medieval-bold" style="color:var(--gold); margin:0;">ACTIVE SUBJECT: ${subjectConfig[activeSub].name}</h4>
          <p class="medieval-text" style="font-size:0.8rem; margin:2px 0 0;">Continue your quest to master this domain.</p>
        </div>
      </div>
    `;
  } else if (lastTask) {
    activeQuestContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:15px; padding: 5px;">
        <span style="font-size:2rem;">📜</span>
        <div>
          <h4 class="medieval-bold" style="color:var(--gold); margin:0;">PLANNER GOAL: ${lastTask.title}</h4>
          <p class="medieval-text" style="font-size:0.8rem; margin:2px 0 0;">Consult your Scholar's Planner to complete this quest.</p>
        </div>
      </div>
    `;
  }

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Signout Error:", error);
    location.reload();
  });

  // Path card interactions
  container.querySelectorAll('.discipline-card').forEach(card => {
    card.addEventListener('click', () => {
      const subject = card.dataset.subject;
      const sub = subjectConfig[subject];
      gameState.currentSubject = subject;
      gameState.lastActiveSubject = subject;
      await saveProfileUpdate();

      // Visual feedback
      container.querySelectorAll('.discipline-card').forEach(s => {
        if (s !== card) s.classList.add('fading');
      });
      card.classList.add('invoking-mastery');

      // Special case for essentials
      const nextPath = (subject === 'essentials') ? 'essentials' : 'syllabus-selection';

      setTimeout(() => {
        const tear = document.getElementById('swordTear');
        document.getElementById('tearIcon').textContent = sub.icon;
        document.getElementById('tearSubjectName').textContent = sub.name.toUpperCase();
        document.getElementById('tearRole').textContent = sub.role;
        tear.style.display = 'flex';

        setTimeout(() => { tear.classList.add('active'); }, 50);

        // Show guide briefing
        const briefs = {
          math: "Sacred Mathematics… the language of the cosmos itself. Ready to solve the runes of logic?",
          chemistry: "Alchemical Chemistry! A path of transformation and essence. Don't blow anything up!",
          physics: "Celestial Physics. You'll be charting the stars and the fundamental forces of reality.",
          coding: "Arcane Coding—mastering the silicon spells and binary enchantments of the modern era.",
          biology: "Natural Biology. The study of life's intricate patterns and the organic pulse of the world.",
          essentials: "The Scholar Guild. Your journey starts with the foundations of wisdom and ancient tools."
        };

        const briefEl = document.getElementById('tearBrief');
        typewriterVN(briefEl, briefs[subject] || "A fine choice, adventurer. Your path awaits!", 35, async () => {
          // Check if we already have a generated syllabus for this subject
          const existing = await loadSyllabusDB(subject);
          if (existing) {
            gameState.generatedModules = existing;
            setTimeout(() => {
                if (data.router) data.router.navigate('level-map', { router: data.router, particles: data.particles });
            }, 1000);
          } else {
            setTimeout(() => {
                if (data.router) data.router.navigate(nextPath, { router: data.router, particles: data.particles });
            }, 1500);
          }
        });
      }, 600);
    });
  });

  if (data.particles) {
    data.particles.start(35, { color: 'rgba(212, 168, 71, 0.4)', maxSize: 3, speed: 0.2 });
  }
}

// ==========================================
// 3.5 SYLLABUS SELECTION PAGE
// ==========================================
export function renderSyllabusSelectionPage(container, data) {
  const sub = subjectConfig[gameState.currentSubject];
  
  container.innerHTML = `
    <div class="syllabus-page mastery-hall-layout">
      <!-- TOP BANNER -->
      <div class="mastery-banner">
        <div class="banner-gold-rim"></div>
        <h1 class="medieval-bold">CHOOSE YOUR SYLLABUS</h1>
        <p class="subtitle medieval-text">HOW SHALL YOU MASTER ${sub.name.toUpperCase()}?</p>
      </div>

      <div class="syllabus-options-container">
        <!-- DEFAULT OPTION -->
        <div class="syllabus-card quest-card" id="defaultSyllabusBtn">
          <div class="syllabus-card-icon">📜</div>
          <h2 class="medieval-bold">Default Syllabus</h2>
          <p class="medieval-text">Master the academy's traditional curriculum for ${sub.name}.</p>
          <div class="syllabus-card-btn">SELECT PATH</div>
        </div>

        <!-- RECOMMENDED OPTION -->
        <div class="syllabus-card quest-card" id="recommendedSyllabusBtn">
          <div class="syllabus-card-icon">📖</div>
          <h2 class="medieval-bold">Recommended Quests</h2>
          <p class="medieval-text">Face the master's handpicked challenges for a stable path.</p>
          <div class="syllabus-card-btn">FACE TRIALS</div>
        </div>

        <!-- CUSTOM OPTION -->
        <div class="syllabus-card quest-card" id="customSyllabusBtn">
          <div class="syllabus-card-icon">🖋️</div>
          <h2 class="medieval-bold">Custom Syllabus</h2>
          <p class="medieval-text">Upload or paste your own scrolls to forge a unique path.</p>
          <div class="syllabus-card-btn">FORGE PATH</div>
        </div>
      </div>

      <!-- CUSTOM INPUT OVERLAY (Hidden by default) -->
      <div class="custom-syllabus-overlay" id="customOverlay" style="display:none">
        <div class="custom-overlay-content">
          <h2 class="medieval-bold">UNFOLD YOUR SCROLLS</h2>
          <textarea id="syllabusInput" placeholder="Paste your syllabus text here..."></textarea>
          <div class="custom-overlay-actions">
             <button class="cancel-btn medieval-bold" id="cancelCustom">CANCEL</button>
             <button class="invoke-btn medieval-bold" id="invokeCustom">INVOKE</button>
          </div>
        </div>
      </div>

      <!-- LOADING OVERLAY -->
      <div class="ai-loading-overlay" id="aiLoading" style="display:none">
        <div class="loading-content">
          <div class="loading-gem"></div>
          <h2 class="medieval-bold">GEMINI IS FORGING YOUR JOURNEY...</h2>
          <p class="medieval-text" id="loadingTip">Dividing the arcane knowledge into progressive levels...</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('defaultSyllabusBtn').addEventListener('click', () => {
    processSyllabus(defaultSyllabi[gameState.currentSubject] || "General introduction to " + sub.name);
  });

  document.getElementById('customSyllabusBtn').addEventListener('click', () => {
    document.getElementById('customOverlay').style.display = 'flex';
  });

  document.getElementById('recommendedSyllabusBtn')?.addEventListener('click', async () => {
    const questions = quizData[gameState.currentSubject] || [];
    if (questions.length === 0) {
      alert("No recommended quests found for this discipline!");
      return;
    }

    // Build 5 levels from the hardcoded questions
    const levels = questions.slice(0, 5).map((q, i) => ({
      title: `Divine Trial: ${sub.name} #${i + 1}`,
      explanation: `Welcome to the level ${i + 1} of the ${sub.name} discipline. This quest utilizes the Academy's traditional knowledge bank to test your foundational skills. Master these runes before attempting more complex enchantments.`,
      summary: `You have successfully completed the ${i + 1}th challenge of ${sub.name}.`,
      examples: ["Consult the ancient scrolls", "Practice the fundamental runes"],
      questions: [
        { q: q.q, options: q.options, correct: q.correct },
        { q: "Is the path of knowledge endless?", options: ["Yes", "No", "Perhaps", "Only for some"], correct: 0 },
        { q: "Does the Scholar guide you well?", options: ["Absolutely", "Indeed", "Truly", "All of the above"], correct: 3 }
      ],
      challenge: "The more of them there are, the less you see. What are they? (Shadows)"
    }));

    gameState.generatedModules = levels;
    gameState.currentLevelIndex = 0;
    
    // Save to DB
    await saveSyllabusDB(gameState.currentSubject, levels);
    await saveProgressDB(gameState.currentSubject, 0); 

    if (data.router) data.router.navigate('level-map', { router: data.router, particles: data.particles });
  });

  document.getElementById('cancelCustom').addEventListener('click', () => {
    document.getElementById('customOverlay').style.display = 'none';
  });

  document.getElementById('invokeCustom').addEventListener('click', () => {
    const text = document.getElementById('syllabusInput').value.trim();
    if (!text) { alert("Please provide your syllabus text!"); return; }
    processSyllabus(text);
  });

  async function processSyllabus(text) {
    document.getElementById('aiLoading').style.display = 'flex';
    document.getElementById('customOverlay').style.display = 'none';
    
    gameState.currentSyllabus = text;
    
    // Generate gamified modules with Gemini
    const result = await generateGamifiedSyllabus(text, sub.name);
    
    if (result && result.success) {
      gameState.generatedModules = result.levels;
      gameState.currentLevelIndex = 0;
      
      // Save to DB
      await saveSyllabusDB(gameState.currentSubject, result.levels);
      
      // Save initial progress for this subject if not exists
      await saveProgressDB(gameState.currentSubject, 0); 
      
      setTimeout(() => {
        if (data.router) data.router.navigate('level-map', { router: data.router, particles: data.particles });
      }, 1000);
    } else {
      const errorMsg = result ? result.error : "Unknown error";
      console.error("Gemini failed to generate syllabus structure:", errorMsg);
      alert(`The arcane AI failed to forge your path. \n\nReason: ${errorMsg}\n\n(Ensure VITE_GEMINI_API_KEY is correctly set in your Vercel Dashboard)`);
      document.getElementById('aiLoading').style.display = 'none';
    }
  }

  if (data.particles) {
    data.particles.start(30, { color: 'rgba(212, 168, 71, 0.3)', maxSize: 2, speed: 0.3 });
  }
}

function showSubjectIntro(subject, sub, data) {
  const overlay = document.getElementById('subjectIntro');
  const guideImg = document.getElementById('introGuideImg');
  const title = document.getElementById('introSubjectTitle');
  const desc = document.getElementById('introSubjectDesc');

  overlay.style.display = 'flex';

  const introTexts = {
    math: "Sacred Mathematics is the art of strategic problem solving. Numbers and runes are your weapons here!",
    chemistry: "Welcome to the realm of alchemy! Understanding matter and transformation is the key to elemental power~",
    physics: "The celestial laws of the cosmos await you! Master force, energy, and motion to become an Arcane Mage!",
    coding: "Logic and creation through arcane code... The path of the Allenturos is both challenging and rewarding!",
    biology: "Life and organic systems are filled with wonder. A scholar must understand the helix of life itself~",
  };

  const e = expressions.happy;
  guideImg.src = e.src;
  guideImg.style.objectPosition = e.pos;

  title.textContent = `⚔️ ${sub.name} — ${sub.role}`;
  typewriterVN(desc, introTexts[subject] || sub.desc, 25, () => {
    setTimeout(() => {
      overlay.style.display = 'none';
      if (data.router) data.router.navigate('adventure', { router: data.router, particles: data.particles, subject });
    }, 2000);
  });
}

// ==========================================
// 4. LEVEL MAP PAGE
// ==========================================
export function renderLevelMapPage(container, data) {
  const levels = gameState.generatedModules || [];
  const sub = subjectConfig[gameState.currentSubject];
  
  // Calculate character position based on progress
  const completedArr = gameState.completedTiles[gameState.currentSubject] || [];
  const completedCount = completedArr.length;
  
  const mapHtml = levels.map((lvl, i) => {
    const isLocked = i > completedCount;
    const isCompleted = completedArr.includes(i);
    const isCurrent = i === completedCount;
    
    return `
      <div class="map-tile-wrapper" style="--tile-idx:${i}">
        <div class="map-tile ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}" 
             data-index="${i}">
          <div class="tile-number medieval-bold">${i + 1}</div>
          <div class="tile-glow"></div>
          ${isCurrent ? '<div class="map-player-pointer">⚔️</div>' : ''}
        </div>
        <div class="tile-label-box">
          <span class="medieval-text">${lvl.title}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="map-page mastery-hall-layout">
       <div class="mastery-banner">
        <button class="sign-out-btn" id="logoutBtn">✦ LOGOUT</button>
        <div class="banner-gold-rim"></div>
        <h1 class="medieval-bold">${sub.name.toUpperCase()} REALM</h1>
        <p class="subtitle medieval-text">ASCEND THROUGH THE DIVINE STAGES OF MASTERY</p>
      </div>

      <div class="map-scroll-view">
        <div class="map-path-container">
          <div class="map-tiles-grid">
            ${mapHtml}
          </div>
        </div>
      </div>

      <div class="mastery-companion">
        <div class="comp-bubble">
           <p class="medieval-text" id="mapGuideText"></p>
        </div>
        <div class="comp-avatar">
          <img src="/assets/expr_neutral_happy.jpeg" id="mapGuideImg" alt="Guide">
        </div>
      </div>
      
      <button class="back-to-hall medieval-bold" id="backToHall">↩ RETREAT TO HALL</button>
    </div>
  `;

  const guideText = document.getElementById('mapGuideText');
  const introMsg = completedCount === 0 
    ? "Look at all this unexplored land! Don't just stand there, pick the first level already."
    : "You're making decent progress... for a mere apprentice. Onward!";
  
  typewriterVN(guideText, introMsg, 30);

  container.querySelectorAll('.map-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const idx = parseInt(tile.dataset.index);
      if (idx > completedCount) {
        typewriterVN(guideText, "Hey! You haven't unlocked that yet. Stick to the path!", 25);
        return;
      }
      gameState.currentLevelIndex = idx;
      if (data.router) data.router.navigate('level-content', { router: data.router, particles: data.particles });
    });
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
  });

  document.getElementById('backToHall').addEventListener('click', () => {
    if (data.router) data.router.navigate('subjects', { router: data.router, particles: data.particles });
  });

  if (data.particles) {
    data.particles.start(25, { color: sub.color, maxSize: 3, speed: 0.15 });
  }
}

// ==========================================
// QUIZ SYSTEM - with guide expressions
// ==========================================
// ==========================================
// 5. LEVEL CONTENT PAGE (Study + Quiz)
// ==========================================
export function renderLevelContentPage(container, data) {
  const level = gameState.generatedModules[gameState.currentLevelIndex];
  const sub = subjectConfig[gameState.currentSubject];
  
  container.innerHTML = `
    <div class="content-page mastery-hall-layout">
      <div class="content-split-view">
        <!-- LEFT: STUDY MATERIAL -->
        <div class="study-panel">
          <div class="study-header">
            <h1 class="medieval-bold">${level.title.toUpperCase()}</h1>
            <div class="study-badge medieval-text">LVL ${gameState.currentLevelIndex + 1}</div>
          </div>
          <div class="study-body scroll-beautify">
             <div class="study-section">
               <h3 class="medieval-bold">The Arcane Theory</h3>
               <p class="medieval-text">${level.explanation}</p>
             </div>
             <div class="study-section">
               <h3 class="medieval-bold">Practical Echoes</h3>
               <ul>
                 ${level.examples.map(ex => `<li class="medieval-text">${ex}</li>`).join('')}
               </ul>
             </div>
             <div class="study-summary">
                <p class="medieval-text"><em>Summary: ${level.summary}</em></p>
             </div>
          </div>
        </div>

        <!-- RIGHT: CHALLENGES & COMPANION -->
        <div class="challenge-panel">
           <div class="challenge-companion">
              <div class="comp-bubble">
                <p id="levelGuideText" class="medieval-text"></p>
              </div>
              <div class="comp-avatar">
                <img src="/assets/expr_neutral_happy.jpeg" id="levelGuideImg" alt="Guide">
              </div>
           </div>

           <div class="quiz-container" id="quizContainer">
              <h2 class="medieval-bold">ARE YOU PREPARED?</h2>
              <p class="medieval-text">Answer the runes to proceed.</p>
              <button class="begin-quiz-btn medieval-bold" id="startQuiz">BEGIN CHALLENGE</button>
           </div>
        </div>
      </div>
      
      <button class="back-to-map medieval-bold" id="backToMap">⏪ MAP</button>
    </div>
  `;

  const guideText = document.getElementById('levelGuideText');
  const levelIntro = `Level ${gameState.currentLevelIndex + 1}: ${level.title}. Read the theory on the left, then face my challenge!`;
  typewriterVN(guideText, levelIntro, 30);

  document.getElementById('startQuiz').addEventListener('click', () => {
    runQuiz(level.questions, guideText);
  });

  function runQuiz(questions, guideEl) {
    let qIdx = 0;
    const quizBox = document.getElementById('quizContainer');
    
    function showQuestion() {
      if (qIdx >= questions.length) {
        finishLevel();
        return;
      }
      const q = questions[qIdx];
      quizBox.innerHTML = `
        <div class="quiz-header">
          <span class="q-count medieval-bold">QUESTION ${qIdx + 1}/${questions.length}</span>
        </div>
        <div class="quiz-q medieval-text">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-opt-btn medieval-text" data-idx="${i}">${opt}</button>
          `).join('')}
        </div>
      `;
      
      quizBox.querySelectorAll('.quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const choice = parseInt(btn.dataset.idx);
          if (choice === q.correct) {
            btn.classList.add('correct');
            typewriterVN(guideEl, "Hmph. Not bad. You actually paid attention.", 20);
            setTimeout(() => { qIdx++; showQuestion(); }, 1500);
          } else {
            btn.classList.add('wrong');
            typewriterVN(guideEl, "Wrong! Did you even read the scrolls? Try again!", 20);
            setTimeout(() => { btn.classList.remove('wrong'); }, 1000);
          }
        });
      });
    }
    showQuestion();
  }

  async function finishLevel() {
    gameState.xp += 25;
    if (!gameState.completedTiles[gameState.currentSubject]) gameState.completedTiles[gameState.currentSubject] = [];
    if (!gameState.completedTiles[gameState.currentSubject].includes(gameState.currentLevelIndex)) {
       gameState.completedTiles[gameState.currentSubject].push(gameState.currentLevelIndex);
       await saveProgressDB(gameState.currentSubject, gameState.currentLevelIndex);
    }
    await saveProfileUpdate();

    const quizBox = document.getElementById('quizContainer');
    quizBox.innerHTML = `
      <div class="level-complete-reveal">
         <div class="complete-icon">🌟</div>
         <h2 class="medieval-bold">LEVEL COMPLETE</h2>
         <p class="medieval-text">+25 XP AWARDED</p>
         <button class="continue-path-btn medieval-bold" id="finishBackToMap">CONTINUE QUEST</button>
      </div>
    `;
    
    typewriterVN(guideText, "You finished it. I guess you're slightly less hopeless than I thought. Don't let it go to your head!", 25);
    
    document.getElementById('finishBackToMap').addEventListener('click', () => {
      if (data.router) data.router.navigate('level-map', { router: data.router, particles: data.particles });
    });
  }

  document.getElementById('backToMap').addEventListener('click', () => {
    if (data.router) data.router.navigate('level-map', { router: data.router, particles: data.particles });
  });

  if (data.particles) {
    data.particles.start(20, { color: 'rgba(255, 255, 255, 0.2)', maxSize: 2, speed: 0.1 });
  }
}

function showXPReward(amount) {
  const reward = document.createElement('div');
  reward.className = 'xp-reward';
  reward.innerHTML = `<div class="xp-amount">+${amount}</div><div class="xp-label">EXPERIENCE</div>`;
  document.body.appendChild(reward);
  setTimeout(() => reward.remove(), 1600);
}

// ==========================================
// SCHOLAR'S LIBRARY TOOLS
// ==========================================

function openToolModal(title, contentHtml, data) {
  const overlay = document.createElement('div');
  overlay.className = 'quiz-overlay tool-overlay';
  overlay.innerHTML = `
    <div class="quiz-panel tool-panel" style="max-width: 800px; width: 90vw;">
      <div class="quiz-header">
        <h2>📜 ${title}</h2>
        <button class="quiz-close-btn" id="toolClose">✕</button>
      </div>
      <div class="tool-content" style="padding: 24px;">
        ${contentHtml}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#toolClose').addEventListener('click', () => {
    overlay.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => overlay.remove(), 300);
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.animation = 'fadeIn 0.3s reverse forwards';
      setTimeout(() => overlay.remove(), 300);
    }
  });

  return overlay;
}

function openStudyPlanner(data) {
  const content = `
    <div class="planner-tool">
      <div class="tool-input-row" style="display:flex; gap:10px; margin-bottom:20px;">
        <input type="text" id="taskInput" placeholder="Enter a new quest objective..." style="flex:1; padding:12px; background:rgba(245,230,200,0.05); border:1px solid var(--gold-dark); border-radius:8px; color:var(--parchment); font-family:var(--font-body);">
        <button id="addTaskBtn" class="confirm-btn" style="padding:0 20px;">✦ Add</button>
        <button id="aiGenPlanBtn" class="confirm-btn" style="padding:0 20px; background:var(--arcane-cyan); border-color:var(--arcane-cyan);">🧙‍♂️ AI Forge</button>
      </div>
      <div id="taskList" class="task-list" style="max-height:350px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
      </div>
    </div>
  `;
  
  const modal = openToolModal('AI Study Planner', content, data);
  
  const refreshTasks = () => {
    const list = modal.querySelector('#taskList');
    list.innerHTML = gameState.tasks.length === 0 ? '<p style="text-align:center; color:var(--text-secondary); padding:20px; font-style:italic;">No active quests in your planner...</p>' : 
      gameState.tasks.map((t, i) => `
        <div class="task-item" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(212,168,71,0.08); border:1px solid rgba(212,168,71,0.2); border-radius:8px;">
          <span style="${t.is_completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.title}</span>
          <div style="display:flex; gap:8px;">
             <button class="task-check" data-id="${t.id}" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color:${t.is_completed ? '#4caf50' : '#888'}">✓</button>
             <button class="task-del" data-id="${t.id}" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color:#f44336">✕</button>
          </div>
        </div>
      `).join('');
    
    list.querySelectorAll('.task-check').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const task = gameState.tasks.find(t => t.id === id);
      if (task) {
        task.is_completed = !task.is_completed;
        await toggleTaskDB(id, task.is_completed);
        refreshTasks();
      }
    }));
    
    list.querySelectorAll('.task-del').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await deleteTaskDB(id);
      refreshTasks();
    }));
  };

  modal.querySelector('#addTaskBtn').addEventListener('click', async () => {
    const inp = modal.querySelector('#taskInput');
    const val = inp.value.trim();
    if (val) {
      inp.value = '';
      await addTaskDB(val);
      refreshTasks();
    }
  });

  modal.querySelector('#aiGenPlanBtn').addEventListener('click', async () => {
    const inp = modal.querySelector('#taskInput');
    const topic = inp.value.trim();
    if (!topic) {
      alert("Please enter a topic for the AI to forge a plan!");
      return;
    }
    
    const btn = modal.querySelector('#aiGenPlanBtn');
    const originalText = btn.textContent;
    btn.textContent = "Forging...";
    btn.disabled = true;
    
    const result = await generateStudyPlan(topic);
    btn.textContent = originalText;
    btn.disabled = false;
    
    if (result.success) {
      for (const tTitle of result.tasks) {
        await addTaskDB(tTitle);
      }
      inp.value = '';
      refreshTasks();
    } else {
      alert("The Scholar failed to forge a plan: " + result.error);
    }
  });

  refreshTasks();
}

function openPracticeQuestions(data) {
  const content = `
    <div class="practice-tool">
       <p style="margin-bottom:20px; color:var(--text-secondary);">Select a discipline to view sample scrolls of knowledge:</p>
       <div class="practice-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;">
         ${Object.keys(quizData).map(sub => `
           <button class="practice-subject-btn" data-sub="${sub}" style="padding:15px; background:rgba(212,168,71,0.08); border:1px solid rgba(212,168,71,0.3); border-radius:8px; color:var(--gold); font-family:var(--font-heading); cursor:pointer; transition:all 0.3s; text-transform:uppercase; letter-spacing:1px;">
             ${subjectConfig[sub].icon} ${subjectConfig[sub].name}
           </button>
         `).join('')}
       </div>
       <div id="practiceContent" style="margin-top:24px; max-height:300px; overflow-y:auto;"></div>
    </div>
  `;
  
  const modal = openToolModal('Practice Questions', content, data);
  
  modal.querySelectorAll('.practice-subject-btn').forEach(btn => btn.addEventListener('click', () => {
    const sub = btn.dataset.sub;
    const questions = quizData[sub];
    modal.querySelector('#practiceContent').innerHTML = `
      <h3 style="color:var(--gold); margin-bottom:15px; font-family:var(--font-heading); border-bottom:1px solid var(--gold-dark); padding-bottom:8px;">${subjectConfig[sub].name} Question Bank</h3>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${questions.map((q, i) => `
          <div style="background:rgba(245,230,200,0.03); padding:12px; border-radius:8px; border-left:3px solid var(--gold);">
            <p style="font-family:var(--font-medieval); margin-bottom:8px;">Q${i+1}: ${q.q}</p>
            <div style="font-size:0.85rem; color:var(--text-secondary);">Correct Answer: <span style="color:var(--gold)">${q.options[q.correct]}</span></div>
          </div>
        `).join('')}
      </div>
    `;
  }));
}

function openNotesGenerator(data) {
  const content = `
    <div class="notes-tool">
      <div class="tool-input-row" style="display:flex; gap:10px; margin-bottom:20px;">
        <input type="text" id="noteInput" placeholder="Topic to summarize (e.g. Calculus, Atomic Theory)..." style="flex:1; padding:12px; background:rgba(245,230,200,0.05); border:1px solid var(--gold-dark); border-radius:8px; color:var(--parchment); font-family:var(--font-body);">
        <button id="genNoteBtn" class="confirm-btn" style="padding:0 20px;">✦ Transcribe</button>
      </div>
      <div id="notesOutput" style="background:var(--bg-card); border:1px solid var(--gold-dark); border-radius:12px; min-height:200px; padding:24px; position:relative; overflow:hidden;">
        <p id="notePlaceholder" style="text-align:center; color:var(--text-secondary); margin-top:60px; font-style:italic;">Thy knowledge will appear here after transcription...</p>
        <div id="noteText" style="display:none; font-family:var(--font-medieval); line-height:1.7; color:var(--parchment);"></div>
        <div id="noteLoading" style="display:none; text-align:center; margin-top:60px;">
          <div class="writing-icon" style="font-size:3rem; animation:writing 1s infinite alternate">✍️</div>
          <p style="color:var(--gold); margin-top:10px;">The Scholar is busy transcribing...</p>
        </div>
      </div>
    </div>
  `;
  
  const modal = openToolModal('Notes Generator', content, data);
  
  modal.querySelector('#genNoteBtn').addEventListener('click', () => {
    const topic = modal.querySelector('#noteInput').value.trim();
    if (!topic) return;
    
    const placeholder = modal.querySelector('#notePlaceholder');
    const loading = modal.querySelector('#noteLoading');
    const output = modal.querySelector('#noteText');
    
    placeholder.style.display = 'none';
    output.style.display = 'none';
    loading.style.display = 'block';
    
    // Local Scholarly Transcription (No AI)
    setTimeout(async () => {
      const simulatedContent = `
        <h3 style="color:var(--gold); text-decoration:underline;">Scroll of ${topic}</h3>
        <p><strong>Section I: Foundations</strong><br>The study of ${topic} begins with the understanding of its core essence and the fundamental laws that govern it within the arcane realms. Every scholar must first grasp the internal logic before attempting to wield its power.</p>
        <p style="margin-top:10px;"><strong>Section II: Core Essences</strong></p>
        <ul style="margin-left:20px; list-style-type: '✧ ';">
          <li>The prime resonance of ${topic} allows for strategic mastery over related disciplines.</li>
          <li>Scholars have long debated the intricate patterns found within the layers of ${topic}.</li>
          <li>Application of this knowledge requires focused intent and steady practice in the field.</li>
        </ul>
        <p style="margin-top:10px;"><strong>Section III: Scholarly Conclusion</strong><br>In summary, mastering ${topic} is a vital step for any adventurer seeking to transcend the boundaries of the known world and achieve true enlightenment.</p>
        <p style="margin-top:15px; font-size:0.8rem; color:var(--gold-dark); text-align:right;">— Transcribed in the Arcane Academy Library</p>
      `;
      
      loading.style.display = 'none';
      output.style.display = 'block';
      typewriterVN(output, simulatedContent, 20);
      
      await addNoteDB(topic, simulatedContent); // Save to Supabase
    }, 1200);
  });
}

function openProgressDashboard(data) {
  const rank = getRank(gameState.xp);
  const nextRankIdx = ranks.findIndex(r => r.name === rank.name) + 1;
  const nextRank = ranks[nextRankIdx] || rank;
  const progressToNext = nextRank === rank ? 100 : Math.floor(((gameState.xp - rank.xpRequired) / (nextRank.xpRequired - rank.xpRequired)) * 100);

  const completedCount = Object.values(gameState.completedTiles).reduce((sum, set) => sum + (set?.length || 0), 0);
  
  const content = `
    <div class="dashboard-tool">
       <div style="display:flex; align-items:center; gap:20px; margin-bottom:30px; background:rgba(212,168,71,0.05); padding:20px; border-radius:16px; border:1px solid rgba(212,168,71,0.2);">
         <div style="font-size:4rem;">${rank.icon}</div>
         <div>
           <h3 style="font-family:var(--font-heading); font-size:1.8rem; color:var(--gold);">${rank.name}</h3>
           <p style="color:var(--text-secondary); margin-bottom:10px;">Adventurer: <span style="color:var(--parchment)">${gameState.playerName || 'Brave Soul'}</span></p>
           <div class="xp-bar-container" style="width:250px;"><div class="xp-bar-fill" style="width:${progressToNext}%"></div></div>
           <p style="font-size:0.75rem; color:var(--gold-dark); margin-top:5px;">Next Rank: ${nextRank.name} (${gameState.xp} / ${nextRank.xpRequired} XP)</p>
         </div>
       </div>
       <div class="stats-cards" style="display:grid; grid-template-columns: repeat(2, 1fr); gap:16px;">
         <div style="padding:20px; background:rgba(26,20,37,0.8); border:1px solid rgba(212,168,71,0.1); border-radius:12px; text-align:center;">
           <div style="font-size:0.8rem; color:var(--gold); letter-spacing:2px; margin-bottom:5px;">TOTAL EXPERIENCE</div>
           <div style="font-size:2.2rem; font-family:var(--font-heading); color:var(--parchment);">${gameState.xp} ⚡</div>
         </div>
         <div style="padding:20px; background:rgba(26,20,37,0.8); border:1px solid rgba(212,168,71,0.1); border-radius:12px; text-align:center;">
           <div style="font-size:0.8rem; color:var(--gold); letter-spacing:2px; margin-bottom:5px;">QUESTS CONQUERED</div>
           <div style="font-size:2.2rem; font-family:var(--font-heading); color:var(--parchment);">${completedCount} ⚔️</div>
         </div>
       </div>
       <div style="margin-top:24px;">
         <h4 style="font-family:var(--font-heading); color:var(--gold); margin-bottom:10px; font-size:0.9rem;">DOMAIN PROFICIENCY</h4>
         <div style="display:flex; flex-direction:column; gap:10px;">
           ${Object.entries(subjectConfig).filter(([k]) => k !== 'essentials').map(([key, sub]) => {
             const comp = gameState.completedTiles[key]?.length || 0;
             return `
               <div style="display:flex; align-items:center; gap:10px;">
                 <span style="width:100px; font-size:0.8rem;">${sub.name}</span>
                 <div class="xp-bar-container" style="flex:1;"><div class="xp-bar-fill" style="width:${(comp/5)*100}%; background:var(--arcane-cyan);"></div></div>
                 <span style="font-size:0.75rem; color:var(--text-secondary); width:30px;">${comp}/5</span>
               </div>
             `;
           }).join('')}
         </div>
       </div>
    </div>
  `;
  
  openToolModal('Progress Dashboard', content, data);
}

// ==========================================
// 5. ESSENTIALS PAGE
// ==========================================
export function renderEssentialsPage(container, data) {
  const tools = [
    { id: 'planner', icon: '📋', name: 'AI Study Planner', desc: 'Organize your study schedule with intelligent planning tools and milestone tracking.' },
    { id: 'practice', icon: '❓', name: 'Practice Questions', desc: 'Access a vast library of practice problems across all subjects sorted by difficulty.' },
    { id: 'notes', icon: '📝', name: 'Notes Generator', desc: 'Create comprehensive study notes powered by AI, organized by topic and chapter.' },
    { id: 'dashboard', icon: '📊', name: 'Progress Dashboard', desc: 'Track your overall progress, XP history, completed quests, and rank advancement.' },
  ];

  container.innerHTML = `
    <div class="essentials-page">
      <div class="essentials-header">
        <button class="essentials-back-btn" id="essBack">◄ RETURN</button>
        <h1>📜 Scholar's Library</h1>
        <p>Traditional study tools within a magical framework</p>
      </div>
      <div class="essentials-grid">
        ${tools.map(t => `
          <div class="essential-card" data-tool="${t.id}">
            <span class="card-icon">${t.icon}</span>
            <h3>${t.name}</h3>
            <p>${t.desc}</p>
          </div>
        `).join('')}
      </div>
      <div class="guide-mini" id="guideMini">
        <div class="guide-mini-bubble">The Scholar's Library has everything you need! 📚</div>
        <img src="/assets/expr_neutral_happy.jpeg" class="guide-mini-img" style="object-position:0% center" alt="${gameState.guideName || 'Guide'}" />
      </div>
    </div>
  `;

  document.getElementById('essBack').addEventListener('click', () => {
    if (data.router) data.router.navigate('subjects', { router: data.router, particles: data.particles });
  });

  container.querySelectorAll('.essential-card').forEach(card => {
    card.addEventListener('click', () => {
      const toolId = card.dataset.tool;
      card.style.transform = 'scale(0.97)';
      setTimeout(() => { card.style.transform = ''; }, 200);
      
      setTimeout(() => {
        if (toolId === 'planner') openStudyPlanner(data);
        else if (toolId === 'practice') openPracticeQuestions(data);
        else if (toolId === 'notes') openNotesGenerator(data);
        else if (toolId === 'dashboard') openProgressDashboard(data);
      }, 300);
    });
  });

  if (data.particles) {
    data.particles.start(20, { color: 'rgba(212, 168, 71, 0.35)', maxSize: 2, speed: 0.25 });
  }
}

