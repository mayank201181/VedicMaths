// js/app.js
// Screens + ONE shared quiz engine that drives every technique.

import { APP, TECHNIQUES, TECHNIQUE_INDEX, BANDS, TIERS, DIFFICULTIES } from './content.js';
import { generate } from './vedic.js';
import { commafy, checkTyped, pickDistinct } from './generators.js';
import { newPlayer, ensureShape, bandStartDifficulty } from './state.js';
import { loadPlayer, savePlayer } from './api.js';
import { loadLocal, lastPlayerName, listLocalPlayers } from './storage.js';

const root = document.getElementById('app');
let player = null;
let session = null; // { techId, difficulty, level, total, done, score, streak, crownAwarded, q }

const BATCH = 25;

// ---------------------------------------------------------------------------
// Sound + speech (gentle, all optional)
// ---------------------------------------------------------------------------
let audioCtx = null;
function beep(freq, dur = 0.12, type = 'sine', vol = 0.15) {
  if (!player || !player.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur);
  } catch (_) {
    /* ignore */
  }
}
const goodSound = () => { beep(660, 0.1); setTimeout(() => beep(880, 0.14), 90); };
const badSound = () => beep(180, 0.25, 'triangle', 0.12);

function speak(text) {
  if (!player || !player.settings.voice) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.95;
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch (_) {
    /* ignore */
  }
}

function confetti() {
  const colors = ['#ff8fab', '#ffd43b', '#69db7c', '#74c0fc', '#b197fc', '#ffa94d'];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.animationDelay = Math.random() * 0.4 + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2200);
  }
}

// ---------------------------------------------------------------------------
// Small DOM helpers
// ---------------------------------------------------------------------------
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function clear() {
  root.innerHTML = '';
}
function show(node) {
  clear();
  root.appendChild(node);
  window.scrollTo(0, 0);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function persist() {
  if (player) await savePlayer(player);
}

// ---------------------------------------------------------------------------
// WELCOME — name + age band
// ---------------------------------------------------------------------------
function screenWelcome() {
  const node = el(`
    <div class="screen welcome">
      <div class="logo">✨🧮</div>
      <h1 class="app-title">${APP.name}</h1>
      <p class="app-tag">${APP.tagline}</p>
      <div class="card">
        <label class="field-label">What's your name?</label>
        <input id="nameInput" class="text-input big" placeholder="Type your name" autocomplete="off" maxlength="20" />
        <label class="field-label">How old are you?</label>
        <div class="band-grid">
          ${BANDS.map(
            (b) => `<button class="band-btn" data-band="${b.id}">${b.emoji}<span>${b.label}</span></button>`
          ).join('')}
        </div>
        <button id="startBtn" class="primary-btn big" disabled>Let's go! 🚀</button>
      </div>
      <div id="returning"></div>
    </div>
  `);

  let chosenBand = null;
  const nameInput = node.querySelector('#nameInput');
  const startBtn = node.querySelector('#startBtn');

  const refresh = () => {
    startBtn.disabled = !(nameInput.value.trim() && chosenBand);
  };
  nameInput.addEventListener('input', refresh);
  node.querySelectorAll('.band-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      chosenBand = btn.dataset.band;
      node.querySelectorAll('.band-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      refresh();
    })
  );

  startBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const existing = await loadPlayer(name);
    player = existing || newPlayer(name, chosenBand);
    if (existing) player.band = chosenBand; // let them update band
    player = ensureShape(player);
    await persist();
    screenDashboard();
  });

  // Returning players on this device
  const known = listLocalPlayers();
  if (known.length) {
    const box = node.querySelector('#returning');
    box.appendChild(el(`<p class="muted">Or carry on as…</p>`));
    const row = el('<div class="chip-row"></div>');
    known.slice(0, 8).forEach((p) => {
      const chip = el(`<button class="chip">${esc(p.name)}</button>`);
      chip.addEventListener('click', async () => {
        player = ensureShape((await loadPlayer(p.name)) || p);
        await persist();
        screenDashboard();
      });
      row.appendChild(chip);
    });
    box.appendChild(row);
  }

  show(node);
  setTimeout(() => nameInput.focus(), 50);
}

// ---------------------------------------------------------------------------
// DASHBOARD — greeting + all techniques shown right away
// ---------------------------------------------------------------------------
function techCard(t) {
  const st = player.techniques[t.id];
  const crowns = '👑'.repeat(Math.min(st.crowns, 5));
  const card = el(`
    <button class="tech-card" style="--card:${t.color}">
      <div class="tech-emoji">${t.emoji}</div>
      <div class="tech-name">${esc(t.name)}</div>
      <div class="tech-tag">${esc(t.tagline)}</div>
      <div class="tech-progress">
        <span class="stars">⭐ ${st.stars}</span>
        <span class="crowns">${crowns || ''}</span>
      </div>
    </button>
  `);
  card.addEventListener('click', () => screenGuide(t.id));
  return card;
}

function screenDashboard() {
  const totalStars = Object.values(player.techniques).reduce((a, b) => a + b.stars, 0);
  const totalCrowns = Object.values(player.techniques).reduce((a, b) => a + b.crowns, 0);
  const myTier = (BANDS.find((b) => b.id === player.band) || {}).tier || 'starter';
  const node = el(`
    <div class="screen dashboard">
      <div class="topbar">
        <div>
          <h1 class="hi">Hi, ${esc(player.name)}! 👋</h1>
          <p class="muted">Pick a magic trick to learn.</p>
        </div>
        <div class="topbar-actions">
          <button id="grownups" class="ghost-btn" title="Grown-ups">👨‍👩‍👧</button>
          <button id="switch" class="ghost-btn" title="Switch player">🔄</button>
        </div>
      </div>
      <div class="score-strip">⭐ ${totalStars} &nbsp;•&nbsp; 👑 ${totalCrowns}</div>
      <div class="tiers"></div>
    </div>
  `);

  const tiersBox = node.querySelector('.tiers');
  TIERS.forEach((tier) => {
    const items = TECHNIQUES.filter((t) => t.tier === tier.id);
    if (!items.length) return;
    const open = tier.id === myTier;
    const section = el(`
      <section class="tier-section ${open ? 'open' : ''}">
        <button class="tier-head">
          <span class="tier-title">${tier.emoji} ${tier.label}</span>
          <span class="tier-blurb">${tier.blurb} · ${items.length}</span>
          <span class="tier-chevron">${open ? '▾' : '▸'}</span>
        </button>
        <div class="tech-grid"></div>
      </section>
    `);
    const grid = section.querySelector('.tech-grid');
    items.forEach((t) => grid.appendChild(techCard(t)));
    section.querySelector('.tier-head').addEventListener('click', () => {
      const isOpen = section.classList.toggle('open');
      section.querySelector('.tier-chevron').textContent = isOpen ? '▾' : '▸';
    });
    tiersBox.appendChild(section);
  });

  node.querySelector('#switch').addEventListener('click', () => {
    window.speechSynthesis && window.speechSynthesis.cancel();
    screenWelcome();
  });
  node.querySelector('#grownups').addEventListener('click', screenGrownups);
  show(node);
}

// ---------------------------------------------------------------------------
// GUIDE — mini course for one technique
// ---------------------------------------------------------------------------
function screenGuide(techId) {
  const t = TECHNIQUE_INDEX[techId];
  const g = t.guide;
  const node = el(`
    <div class="screen guide" style="--card:${t.color}">
      <button class="back-btn">← Back</button>
      <div class="guide-head">
        <span class="guide-emoji">${t.emoji}</span>
        <div>
          <h1>${esc(t.name)}</h1>
          <p class="sutra">${esc(t.sutra)}</p>
        </div>
      </div>
      <div class="card">
        <div class="readaloud-row">
          <p class="intro">${esc(g.intro)}</p>
          <button class="speak-btn" title="Read aloud">🔊</button>
        </div>
        <div class="diagram">${g.diagram}</div>
        <h3>How to do it</h3>
        <ol class="steps">${g.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        <h3>Worked examples</h3>
        <div class="examples">
          ${g.examples
            .map((e) => `<div class="example"><span class="ex-q">${esc(e.q)}</span><span class="ex-w">${esc(e.work)}</span></div>`)
            .join('')}
        </div>
        <p class="tip">💡 ${esc(g.tip)}</p>
      </div>
      <h3 class="centre">Practise it!</h3>
      <div class="diff-grid">
        ${DIFFICULTIES.map(
          (d) => `<button class="diff-btn" data-diff="${d.id}">${d.emoji}<span>${d.label}</span><small>${d.note}</small></button>`
        ).join('')}
      </div>
    </div>
  `);

  node.querySelector('.back-btn').addEventListener('click', screenDashboard);
  const readText = `${t.name}. ${g.intro} ${g.steps.join(' ')} ${g.tip}`;
  node.querySelector('.speak-btn').addEventListener('click', () => speak(readText));

  // Highlight the difficulty recommended for this child's age band.
  const recommended = bandStartDifficulty(player);
  node.querySelectorAll('.diff-btn').forEach((btn) => {
    const d = Number(btn.dataset.diff);
    if (d === recommended) btn.classList.add('recommended');
    btn.addEventListener('click', () => startQuiz(techId, d));
  });

  show(node);
}

// ---------------------------------------------------------------------------
// QUIZ ENGINE
// ---------------------------------------------------------------------------
function startQuiz(techId, difficulty) {
  player.techniques[techId].lastDifficulty = difficulty;
  session = {
    techId,
    difficulty,
    level: 0,
    total: BATCH,
    done: 0,
    score: 0,
    streak: 0,
    crownAwarded: false,
    q: null,
    used: new Set(), // question texts already shown this exercise
    lastKey: null,
  };
  nextQuestion();
}

function nextQuestion() {
  // No repeats within the same exercise (cycles through all distinct questions
  // before repeating, and never the same one twice in a row).
  session.q = pickDistinct(
    () => generate(session.techId, { difficulty: session.difficulty, level: session.level }),
    session.used,
    session.lastKey
  );
  session.lastKey = session.q.text;
  renderQuestion();
}

function renderQuestion() {
  const t = TECHNIQUE_INDEX[session.techId];
  const d = DIFFICULTIES[session.difficulty];
  const q = session.q;
  const node = el(`
    <div class="screen quiz" style="--card:${t.color}">
      <div class="quiz-top">
        <button class="back-btn">← Quit</button>
        <div class="quiz-meta">
          <span>${t.emoji} ${esc(t.name)}</span>
          <span>${d.emoji} ${d.label}</span>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${(session.done / session.total) * 100}%"></div></div>
      <div class="quiz-stats"><span>Question ${session.done + 1} / ${session.total}</span><span>⭐ ${session.score}</span></div>
      <div class="card question-card">
        <div class="question-text">${esc(q.text)}</div>
        ${q.visual ? `<div class="q-visual">${q.visual}</div>` : ''}
        <div class="answer-area"></div>
        <div class="feedback" hidden></div>
      </div>
      <div class="quiz-actions">
        <button class="hint-btn">💡 Hint</button>
      </div>
    </div>
  `);

  node.querySelector('.back-btn').addEventListener('click', async () => {
    await persist();
    screenGuide(session.techId);
  });

  const answerArea = node.querySelector('.answer-area');
  const feedback = node.querySelector('.feedback');
  const actions = node.querySelector('.quiz-actions');
  const hintBtn = node.querySelector('.hint-btn');
  let answered = false;

  hintBtn.addEventListener('click', () => {
    hintBtn.classList.add('used');
    let h = node.querySelector('.hint-text');
    if (!h) {
      h = el(`<p class="hint-text">💡 ${esc(q.hint)}</p>`);
      actions.appendChild(h);
    }
  });

  const finish = (correct) => {
    if (answered) return;
    answered = true;
    const st = player.techniques[session.techId];
    st.attempts++;
    if (correct) {
      st.correct++;
      st.stars++;
      session.score++;
      session.streak++;
      st.bestStreak = Math.max(st.bestStreak, session.streak);
      goodSound();
    } else {
      session.streak = 0;
      badSound();
    }

    feedback.hidden = false;
    feedback.className = 'feedback ' + (correct ? 'right' : 'wrong');
    feedback.innerHTML = correct
      ? `<div class="fb-head">🎉 Correct!</div>`
      : `<div class="fb-head">Not quite — the answer is <b>${commafy(q.answer)}</b></div>`;
    feedback.appendChild(el(`<p class="explain">${esc(q.explanation)}</p>`));
    if (!correct) speak(`Not quite. ${q.explanation}`);

    // Crown when they reach the goal this session.
    if (!session.crownAwarded && session.score >= t.crownGoal) {
      session.crownAwarded = true;
      st.crowns++;
      confetti();
      feedback.appendChild(el(`<p class="crown-msg">👑 You earned a crown!</p>`));
    }

    hintBtn.disabled = true;
    const nextBtn = el(`<button class="primary-btn next-btn">${session.done + 1 >= session.total ? 'See results →' : 'Next →'}</button>`);
    nextBtn.addEventListener('click', async () => {
      session.done++;
      await persist();
      if (session.done >= session.total) screenResults();
      else nextQuestion();
    });
    actions.appendChild(nextBtn);
    nextBtn.focus();
  };

  if (d.mode === 'choice') {
    const grid = el('<div class="choice-grid"></div>');
    q.choices.forEach((c) => {
      const b = el(`<button class="choice-btn">${commafy(c)}</button>`);
      b._value = c; // keep the real value (number OR string) for exact comparison
      b.addEventListener('click', () => {
        if (answered) return;
        const correct = c === q.answer;
        node.querySelectorAll('.choice-btn').forEach((btn) => {
          btn.disabled = true;
          if (btn._value === q.answer) btn.classList.add('is-right');
        });
        if (!correct) b.classList.add('is-wrong');
        finish(correct);
      });
      grid.appendChild(b);
    });
    answerArea.appendChild(grid);
  } else {
    const row = el(`
      <div class="type-row">
        <input class="text-input answer-input" inputmode="numeric" autocomplete="off" placeholder="Your answer" />
        <button class="primary-btn check-btn">Check</button>
      </div>
    `);
    const input = row.querySelector('.answer-input');
    const submit = () => {
      if (answered) return;
      if (!input.value.trim()) return;
      const correct = checkTyped(input.value, q.accept, q.answer);
      input.disabled = true;
      input.classList.add(correct ? 'is-right' : 'is-wrong');
      finish(correct);
    };
    row.querySelector('.check-btn').addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    answerArea.appendChild(row);
    setTimeout(() => input.focus(), 50);
  }

  show(node);
}

// ---------------------------------------------------------------------------
// RESULTS — endless practice controls
// ---------------------------------------------------------------------------
function screenResults() {
  const t = TECHNIQUE_INDEX[session.techId];
  const pct = Math.round((session.score / session.total) * 100);
  const stars = pct >= 90 ? '⭐⭐⭐' : pct >= 60 ? '⭐⭐' : '⭐';
  const canHarder = session.difficulty < 2 || true; // always allow "a bit harder" (level climbs)
  const node = el(`
    <div class="screen results" style="--card:${t.color}">
      <div class="logo">${pct >= 60 ? '🏆' : '💪'}</div>
      <h1>${pct >= 60 ? 'Great work!' : 'Good try!'}</h1>
      <p class="big-score">${session.score} / ${session.total}</p>
      <p class="stars-big">${stars}</p>
      <div class="result-actions">
        <button class="primary-btn" id="more">➕ Add ${BATCH} more</button>
        <button class="primary-btn alt" id="harder">⬆️ A bit harder</button>
        <button class="ghost-btn wide" id="guide">📖 Back to guide</button>
        <button class="ghost-btn wide" id="home">🏠 Home</button>
      </div>
    </div>
  `);
  if (!canHarder) node.querySelector('#harder').remove();

  const continueSession = (bump) => {
    session.total += BATCH;
    if (bump) {
      // Bump difficulty if not maxed, otherwise climb the level.
      if (session.difficulty < 2) session.difficulty++;
      else session.level++;
    }
    nextQuestion();
  };
  node.querySelector('#more').addEventListener('click', () => continueSession(false));
  node.querySelector('#harder').addEventListener('click', () => continueSession(true));
  node.querySelector('#guide').addEventListener('click', () => screenGuide(session.techId));
  node.querySelector('#home').addEventListener('click', screenDashboard);
  confetti();
  show(node);
}

// ---------------------------------------------------------------------------
// GROWN-UPS — lightweight progress overview
// ---------------------------------------------------------------------------
function screenGrownups() {
  const rows = TECHNIQUES.map((t) => {
    const st = player.techniques[t.id];
    const acc = st.attempts ? Math.round((st.correct / st.attempts) * 100) : 0;
    return `<tr>
      <td>${t.emoji} ${esc(t.name)}</td>
      <td>${'👑'.repeat(st.crowns) || '—'}</td>
      <td>${st.stars}</td>
      <td>${st.attempts ? acc + '%' : '—'}</td>
    </tr>`;
  }).join('');
  const band = BANDS.find((b) => b.id === player.band);
  const node = el(`
    <div class="screen grownups">
      <button class="back-btn">← Back</button>
      <h1>👨‍👩‍👧 Progress for ${esc(player.name)}</h1>
      <p class="muted">Age band: ${band ? band.emoji + ' ' + band.label : '—'}</p>
      <div class="card">
        <table class="progress-table">
          <thead><tr><th>Technique</th><th>Crowns</th><th>Stars</th><th>Accuracy</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="card">
        <h3>Settings</h3>
        <label class="toggle"><input type="checkbox" id="sound" ${player.settings.sound ? 'checked' : ''}/> Sound effects</label>
        <label class="toggle"><input type="checkbox" id="voice" ${player.settings.voice ? 'checked' : ''}/> Read aloud</label>
        <label class="field-label">Age band</label>
        <div class="band-grid small">
          ${BANDS.map(
            (b) => `<button class="band-btn ${b.id === player.band ? 'selected' : ''}" data-band="${b.id}">${b.emoji}<span>${b.label}</span></button>`
          ).join('')}
        </div>
      </div>
    </div>
  `);
  node.querySelector('.back-btn').addEventListener('click', screenDashboard);
  node.querySelector('#sound').addEventListener('change', (e) => {
    player.settings.sound = e.target.checked;
    persist();
  });
  node.querySelector('#voice').addEventListener('change', (e) => {
    player.settings.voice = e.target.checked;
    persist();
  });
  node.querySelectorAll('.band-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      player.band = btn.dataset.band;
      node.querySelectorAll('.band-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      persist();
    })
  );
  show(node);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function boot() {
  const last = lastPlayerName();
  if (last) {
    const local = loadLocal(last);
    if (local) {
      player = ensureShape(local);
      // refresh from server in the background
      loadPlayer(last).then((p) => {
        if (p) player = p;
      });
      screenDashboard();
      return;
    }
  }
  screenWelcome();
}

boot();
