// ==========================================
// Page Renderers - All page UI generation
// ==========================================
import { subjectConfig, quizData, ranks } from './data.js';

// Game state
const gameState = {
  playerName: '',
  guideName: '',
  xp: 0,
  completedTiles: {},
  currentSubject: null
};

function getRank(xp) {
  let rank = ranks[0];
  for (const r of ranks) { if (xp >= r.xpRequired) rank = r; }
  return rank;
}

// Expression image mapping - each file has 3 expressions side-by-side
// We use CSS object-position to crop to a specific expression
const expressions = {
  neutral:    { src: '/assets/expr_neutral_happy.jpeg', pos: '0% center' },
  neutralSad: { src: '/assets/expr_neutral_happy.jpeg', pos: '50% center' },
  happy:      { src: '/assets/expr_neutral_happy.jpeg', pos: '100% center' },
  angry:      { src: '/assets/expr_angry.jpeg', pos: '0% center' },
  annoyed:    { src: '/assets/expr_angry.jpeg', pos: '50% center' },
  pouty:      { src: '/assets/expr_angry.jpeg', pos: '100% center' },
  concerned:  { src: '/assets/expr_concerned.jpeg', pos: '0% center' },
  surprised:  { src: '/assets/expr_concerned.jpeg', pos: '50% center' },
  agitated:   { src: '/assets/expr_concerned.jpeg', pos: '100% center' },
  crying:     { src: '/assets/expr_crying.jpeg', pos: '0% center' },
  glare:      { src: '/assets/expr_crying.jpeg', pos: '50% center' },
  fakeSmile:  { src: '/assets/expr_crying.jpeg', pos: '100% center' },
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
      <div class="login-container">
        <div class="login-card-flipper" id="cardFlipper">
          <div class="login-card login-card-front">
            <div class="login-emblem">
              <canvas id="logoCanvasFront" class="login-logo-canvas"></canvas>
            </div>
            <form class="login-form" id="loginForm">
              <div class="form-group">
                <label>Adventurer Name</label>
                <input type="text" id="loginName" placeholder="Enter your name, brave soul..." required autocomplete="off" />
              </div>
              <div class="form-group">
                <label>Secret Incantation</label>
                <input type="password" id="loginPass" placeholder="Whisper your password..." required />
              </div>
              <button type="submit" class="login-btn" id="loginBtn">⚔️ Begin Your Quest ⚔️</button>
            </form>
            <div class="login-switch">
              <span>New adventurer?</span>
              <button class="switch-btn" id="showSignup">Create Account ✦</button>
            </div>
          </div>
          <div class="login-card login-card-back">
            <div class="login-emblem">
              <canvas id="logoCanvasBack" class="login-logo-canvas"></canvas>
            </div>
            <form class="login-form" id="signupForm">
              <div class="form-group">
                <label>Choose Your Name</label>
                <input type="text" id="signupName" placeholder="Your adventurer name..." required autocomplete="off" />
              </div>
              <div class="form-group">
                <label>Create Incantation</label>
                <input type="password" id="signupPass" placeholder="Create your password..." required />
              </div>
              <div class="form-group">
                <label>Confirm Incantation</label>
                <input type="password" id="signupConfirm" placeholder="Repeat your password..." required />
              </div>
              <button type="submit" class="login-btn">✦ Join the Academy ✦</button>
            </form>
            <div class="login-switch">
              <span>Already enrolled?</span>
              <button class="switch-btn" id="showLogin">Sign In ⚔️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove white background from logo canvases
  removeWhiteBG('/assets/strive_logo.jpeg', 'logoCanvasFront', 600);
  removeWhiteBG('/assets/strive_logo.jpeg', 'logoCanvasBack', 600);

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

  // Login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    if (name) {
      gameState.playerName = name;
      const btn = document.getElementById('loginBtn');
      btn.style.transform = 'scale(0.95)';
      btn.textContent = '✨ Portal Opening... ✨';
      setTimeout(() => {
        if (data.router) data.router.navigate('intro', { router: data.router, particles: data.particles });
      }, 600);
    }
  });

  // Signup
  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    if (name) {
      gameState.playerName = name;
      flipper.classList.remove('flipped');
      setTimeout(() => {
        document.getElementById('loginName').value = name;
        // Auto-trigger login transition
        const btn = document.getElementById('loginBtn');
        btn.textContent = '✨ Portal Opening... ✨';
        setTimeout(() => {
          if (data.router) data.router.navigate('intro', { router: data.router, particles: data.particles });
        }, 600);
      }, 800);
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
      <div class="intro-content">
        <div class="guide-character-wrapper">
          <div class="guide-character-container" id="guideContainer">
            <img src="/assets/expr_neutral_happy.jpeg" class="guide-character-img" id="guideImg" alt="Your Guide"
              style="object-position: 0% center" />
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

  const guideImg = document.getElementById('guideImg');
  const textEl = document.getElementById('introText');

  function setExpression(expr) {
    const e = expressions[expr] || expressions.neutral;
    guideImg.src = e.src;
    guideImg.style.objectPosition = e.pos;
  }

  const introSteps = [
    { expr: 'happy', text: `Oh! A new adventurer approaches! Welcome, ${gameState.playerName || 'brave soul'}! 💫` },
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

  document.getElementById('confirmNameBtn').addEventListener('click', () => {
    const name = document.getElementById('guideNameInput').value.trim() || 'Luna';
    gameState.guideName = name;
    setExpression('happy');
    typewriterVN(textEl, `${name}... I love it! 💖 From now on, I'm ${name}, your loyal companion on this adventure!`, 25, () => {
      document.getElementById('nameSection').style.display = 'none';
      document.getElementById('continueBtn').classList.add('visible');
    });
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
  const subjects = Object.entries(subjectConfig).filter(([key]) => key !== 'essentials');
  const essentials = subjectConfig.essentials;

  const artifactsHtml = subjects.map(([key, sub], i) => `
    <div class="artifact-slot" data-subject="${key}" style="animation-delay:${i * 0.15}s">
      <div class="artifact-wrapper">
        <div class="artifact-img artifact-${key}"></div>
        <div class="artifact-glow"></div>
        <div class="artifact-particles"></div>
        <div class="artifact-pedestal"></div>
      </div>
      <div class="artifact-label">
        <span class="artifact-name">${sub.name}</span>
        <span class="artifact-role">${sub.role}</span>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="subjects-page artifact-select-page">
      <div class="subjects-header">
        <h1>Invoke Your Path</h1>
        <p class="subtitle">Select a magical artifact to begin your mastery of a domain</p>
      </div>
      <div class="artifacts-row" id="artifactsRow">${artifactsHtml}</div>
      <div class="essentials-shortcut" id="essShortcut">
        <span>📜</span>
        <span>${essentials.name} — ${essentials.role}</span>
      </div>
      <div class="guide-mini" id="guideMini">
        <div class="guide-mini-bubble">${randomFrom([
          `Select your discipline, ${gameState.playerName || 'adventurer'}! Each artifact holds ancient power~ ✨`,
          `Which path calls to you? 🔮`,
          `Commune with an artifact to begin!`,
        ])}</div>
        <img src="/assets/expr_neutral_happy.jpeg" class="guide-mini-img" style="object-position:0% center" alt="Guide" />
      </div>
      <div class="subject-intro-overlay" id="subjectIntro" style="display:none">
        <div class="subject-intro-panel">
          <div class="guide-intro-char">
            <img src="/assets/expr_neutral_happy.jpeg" class="guide-intro-img" id="introGuideImg" style="object-position:0% center" alt="Guide" />
          </div>
          <div class="subject-intro-text">
            <h2 id="introSubjectTitle"></h2>
            <p id="introSubjectDesc"></p>
          </div>
        </div>
      </div>
      <div class="sword-tear-overlay" id="swordTear" style="display:none">
        <div class="tear-left"></div>
        <div class="tear-right"></div>
        <div class="tear-reveal" id="tearReveal">
          <h1 id="tearSubjectName"></h1>
        </div>
      </div>
    </div>
  `;

  // Essentials shortcut
  document.getElementById('essShortcut').addEventListener('click', () => {
    if (data.router) data.router.navigate('essentials', { router: data.router, particles: data.particles });
  });

  // Artifact interactions
  container.querySelectorAll('.artifact-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const subject = slot.dataset.subject;
      const sub = subjectConfig[subject];
      gameState.currentSubject = subject;

      // Fade other cards
      container.querySelectorAll('.artifact-slot').forEach(s => {
        if (s !== slot) s.classList.add('fading');
      });
      slot.classList.add('invoking');

      // Artifact invokes - show tear effect
      setTimeout(() => {
        const tear = document.getElementById('swordTear');
        document.getElementById('tearSubjectName').textContent = sub.name.toUpperCase();
        tear.style.display = 'flex';

        setTimeout(() => { tear.classList.add('active'); }, 50);

        // After tear reveal - show subject intro
        setTimeout(() => {
          tear.style.display = 'none';
          tear.classList.remove('active');
          showSubjectIntro(subject, sub, data);
        }, 1800);
      }, 1000);
    });
  });

  if (data.particles) {
    data.particles.start(25, { color: 'rgba(212, 168, 71, 0.35)', maxSize: 2.5, speed: 0.3 });
  }
}

function showSubjectIntro(subject, sub, data) {
  const overlay = document.getElementById('subjectIntro');
  const guideImg = document.getElementById('introGuideImg');
  const title = document.getElementById('introSubjectTitle');
  const desc = document.getElementById('introSubjectDesc');

  overlay.style.display = 'flex';

  const introTexts = {
    math: "Mathematics is the art of strategic problem solving. Numbers and formulas are your weapons here!",
    chemistry: "Welcome to the realm of alchemy! Understanding matter and reactions is the key to power~",
    physics: "The laws of the universe await you! Master force, energy, and motion to become an Arcane Engineer!",
    programming: "Logic and creation through code... The Cyber Mage's path is both challenging and rewarding!",
    biology: "Life and natural systems are filled with wonder. A Druid must understand all living things~",
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
// 4. ADVENTURE MAP PAGE
// ==========================================
export function renderAdventurePage(container, data) {
  const subject = data.subject || gameState.currentSubject || 'math';
  const sub = subjectConfig[subject];
  const rank = getRank(gameState.xp);
  const xpPercent = Math.min(100, (gameState.xp % 100));
  const completedSet = gameState.completedTiles[subject] || new Set();

  const tileCount = 5;
  const tilesHtml = [];
  for (let i = 1; i <= tileCount; i++) {
    const isCompleted = completedSet.has && completedSet.has(i);
    const isLocked = i > 1 && !(completedSet.has && completedSet.has(i - 1)) && i > (completedSet.size || 0) + 1;
    const cls = isCompleted ? 'completed' : (isLocked ? 'locked' : '');
    const labels = ['Basics', 'Challenge', 'Advanced', 'Expert', 'Final Boss'];
    tilesHtml.push(`
      <div class="map-tile ${cls}" data-tile="${i}" style="animation-delay:${i * 0.15}s">
        <span class="tile-num">${i}</span>
        <span class="tile-label">${labels[i - 1]}</span>
      </div>
    `);
    if (i < tileCount) tilesHtml.push('<div class="map-path"></div>');
  }

  container.innerHTML = `
    <div class="adventure-page">
      <div class="adventure-bg"></div>
      <div class="adventure-overlay"></div>
      <div class="adventure-header">
        <button class="adventure-back-btn" id="adventureBack">◄ RETREAT</button>
        <h1 class="adventure-title">${sub.icon} ${sub.name} Realm</h1>
        <div class="player-stats">
          <div class="stat-item">
            <span class="stat-icon">⚡</span>
            <span>${gameState.xp} XP</span>
            <div class="xp-bar-container"><div class="xp-bar-fill" style="width:${xpPercent}%"></div></div>
          </div>
          <div class="rank-badge">${rank.icon} ${rank.name}</div>
        </div>
      </div>
      <div class="map-container"><div class="map-row">${tilesHtml.join('')}</div></div>
      <div class="guide-mini" id="guideMini">
        <div class="guide-mini-bubble">Tap a quest tile to start a challenge! 🗡️</div>
        <img src="/assets/expr_neutral_happy.jpeg" class="guide-mini-img" style="object-position:0% center" alt="${gameState.guideName || 'Guide'}" />
      </div>
    </div>
  `;

  document.getElementById('adventureBack').addEventListener('click', () => {
    if (data.router) data.router.navigate('subjects', { router: data.router, particles: data.particles });
  });

  container.querySelectorAll('.map-tile:not(.locked)').forEach(tile => {
    tile.addEventListener('click', () => {
      const tileNum = parseInt(tile.dataset.tile);
      tile.style.transform = 'scale(0.9)';
      setTimeout(() => { tile.style.transform = ''; }, 150);
      setTimeout(() => { openQuiz(subject, tileNum, data); }, 300);
    });
  });

  if (data.particles) {
    data.particles.start(20, { color: 'rgba(212, 168, 71, 0.4)', maxSize: 2.5, speed: 0.3 });
  }
}

// ==========================================
// QUIZ SYSTEM - with guide expressions
// ==========================================
function openQuiz(subject, tileNum, data) {
  const questions = quizData[subject] || quizData.math;
  const question = questions[(tileNum - 1) % questions.length];
  let answered = false;
  let thinkingTimer = null;

  const overlay = document.createElement('div');
  overlay.className = 'quiz-overlay';
  overlay.innerHTML = `
    <div class="quiz-panel-with-guide">
      <div class="quiz-guide-section">
        <div class="quiz-guide-char">
          <img src="${expressions.neutral.src}" class="quiz-guide-img" id="quizGuideImg"
            style="object-position:${expressions.neutral.pos}" alt="Guide" />
        </div>
        <div class="quiz-guide-dialogue" id="quizDialogue">
          <p id="quizGuideText">Let me see... Here's your challenge!</p>
        </div>
      </div>
      <div class="quiz-panel">
        <div class="quiz-header">
          <h2>⚔️ QUEST ${tileNum} — ${subjectConfig[subject]?.name || 'Challenge'}</h2>
          <button class="quiz-close-btn" id="quizClose">✕</button>
        </div>
        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width:${(tileNum / 5) * 100}%"></div>
          </div>
          <span class="quiz-progress-text">${tileNum} / 5</span>
        </div>
        <div class="quiz-content">
          <div class="quiz-question">${question.q}</div>
          <div class="quiz-options">
            ${question.options.map((opt, i) => `
              <div class="quiz-option" data-index="${i}">
                <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                <span>${opt}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const guideImg = overlay.querySelector('#quizGuideImg');
  const guideText = overlay.querySelector('#quizGuideText');

  function setQuizExpression(expr) {
    const e = expressions[expr] || expressions.neutral;
    guideImg.src = e.src;
    guideImg.style.objectPosition = e.pos;
  }

  // Thinking timer - rotate dialogues
  let thinkCount = 0;
  thinkingTimer = setInterval(() => {
    if (answered) { clearInterval(thinkingTimer); return; }
    thinkCount++;
    if (thinkCount >= 2) {
      const msgs = thinkingDialogues;
      const exprs = ['concerned', 'neutralSad', 'pouty'];
      setQuizExpression(randomFrom(exprs));
      guideText.textContent = randomFrom(msgs);
    }
  }, 8000);

  // Close
  overlay.querySelector('#quizClose').addEventListener('click', () => {
    clearInterval(thinkingTimer);
    overlay.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => overlay.remove(), 300);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      clearInterval(thinkingTimer);
      overlay.style.animation = 'fadeIn 0.3s reverse forwards';
      setTimeout(() => overlay.remove(), 300);
    }
  });

  // Options
  overlay.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      clearInterval(thinkingTimer);
      const idx = parseInt(opt.dataset.index);

      if (idx === question.correct) {
        opt.classList.add('correct');
        setQuizExpression('happy');
        guideText.textContent = randomFrom(correctDialogues);
        gameState.xp += 25;

        if (!gameState.completedTiles[subject]) gameState.completedTiles[subject] = new Set();
        gameState.completedTiles[subject].add(tileNum);
        showXPReward(25);

        setTimeout(() => {
          overlay.remove();
          if (data.router) data.router.navigate('adventure', { router: data.router, particles: data.particles, subject, force: true });
        }, 2000);
      } else {
        opt.classList.add('incorrect');
        overlay.querySelectorAll('.quiz-option')[question.correct].classList.add('correct');
        setQuizExpression('concerned');
        guideText.textContent = randomFrom(incorrectDialogues);

        setTimeout(() => overlay.remove(), 2500);
      }
    });
  });
}

function showXPReward(amount) {
  const reward = document.createElement('div');
  reward.className = 'xp-reward';
  reward.innerHTML = `<div class="xp-amount">+${amount}</div><div class="xp-label">EXPERIENCE</div>`;
  document.body.appendChild(reward);
  setTimeout(() => reward.remove(), 1600);
}

// ==========================================
// 5. ESSENTIALS PAGE
// ==========================================
export function renderEssentialsPage(container, data) {
  const tools = [
    { icon: '📋', name: 'AI Study Planner', desc: 'Organize your study schedule with intelligent planning tools and milestone tracking.' },
    { icon: '❓', name: 'Practice Questions', desc: 'Access a vast library of practice problems across all subjects sorted by difficulty.' },
    { icon: '📝', name: 'Notes Generator', desc: 'Create comprehensive study notes powered by AI, organized by topic and chapter.' },
    { icon: '📊', name: 'Progress Dashboard', desc: 'Track your overall progress, XP history, completed quests, and rank advancement.' },
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
          <div class="essential-card">
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
      card.style.transform = 'scale(0.97)';
      setTimeout(() => { card.style.transform = ''; }, 200);
    });
  });

  if (data.particles) {
    data.particles.start(20, { color: 'rgba(212, 168, 71, 0.35)', maxSize: 2, speed: 0.25 });
  }
}
