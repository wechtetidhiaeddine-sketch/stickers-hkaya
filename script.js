'use strict';
// Question bank: [level, question, correct answer, wrong1, wrong2, wrong3] (options are shuffled at runtime)
const BANK = [
['easy','Which file format supports transparent backgrounds?','PNG','JPG','MP4','TXT'],
['easy','What is a sticker in graphic design?','A small decorative image, often with a cut outline','A type of font','A color mode','A video codec'],
['easy','Which tool is popular for easy online graphic design?','Canva','Excel','Notepad','Calculator'],
['easy','What does "remove background" do?','Isolates the subject from its surroundings','Makes the image blurry','Changes the file format','Adds a border'],
['easy','What does RGB stand for?','Red, Green, Blue','Rapid Graphic Border','Real Gray Black','Round Glossy Blend'],
['easy','Which two colors mix to make purple?','Red and blue','Yellow and green','Black and white','Orange and green'],
['easy','What is a font?','A style of lettering','A photo filter','A file compressor','A brush size'],
['easy','Which format is most common for compressed photos?','JPG','SVG','PSD','AI'],
['medium','What does SVG stand for?','Scalable Vector Graphics','Simple Visual Gallery','Standard Video Graphic','Static Vector Group'],
['medium','What are layers used for in photo editing?','Editing elements separately without affecting others','Compressing the file','Printing faster','Changing the file name'],
['medium','Which format stays sharp at any size?','SVG','JPG','PNG','BMP'],
['medium','Which color is opposite blue on the color wheel?','Orange','Green','Purple','Pink'],
['medium','What is a die-cut sticker?','A sticker cut along the shape of its design','A square sticker','A sticker with no adhesive','A glossy-only sticker'],
['medium','What is kerning?','The spacing between pairs of letters','The thickness of a font','The space between lines','The color of text'],
['medium','What resolution is standard for print quality?','300 DPI','72 DPI','10 DPI','30 DPI'],
['medium','What does 0% opacity mean?','Fully transparent','Fully solid','Half blurred','Black and white'],
['hard','What does a layer mask do?','Hides or reveals parts of a layer non-destructively','Permanently erases pixels','Flattens all layers','Converts to CMYK'],
['hard','Which color mode is best for professional printing?','CMYK','RGB','Hex','Indexed'],
['hard','Which blend mode darkens an image by multiplying colors?','Multiply','Screen','Dodge','Lighten'],
['hard','What does anti-aliasing do?','Smooths jagged edges','Adds noise','Shrinks file size','Rotates the image'],
['hard','What is the rule of thirds?','Placing subjects along a 3x3 grid','Using three fonts only','Using three layers','Limiting a design to three colors'],
['hard','What is "bleed" in print design?','Extra artwork beyond the cut line','Ink smudging','The inner margin','A faded color'],
['hard','What makes a photo montage look realistic?','Matching light direction, color temperature and shadows','Using the brightest filter','Adding more layers','Using only PNG files'],
['hard','What is a raster image made of?','Pixels','Vector paths','Anchor points','Bezier curves'],
['hard','What does a clipping mask do?','Limits a layer to the shape of the layer below','Deletes the lower layer','Blurs the edges','Merges all layers'],
['hard','What does feathering a selection do?','Softens the selection edge','Inverts the selection','Doubles its size','Locks the layer'],
['hard','What does the 60-30-10 color rule describe?','Proportions of dominant, secondary and accent colors','Image compression levels','Font size ratios','Layer opacity steps'],
['hard','What does typographic hierarchy achieve?','Guides the eye using size, weight and contrast','Makes all text equal','Reduces file size','Removes the need for color']
];
const MSG = {
  right:['Excellent! Correct answer!',['😍','😄']],
  wrong:['Oops! Wrong answer!',['😡','😞']],
  time:["Time's up! No point this time.",['⏰','😞']]
};
const $ = id => document.getElementById(id);
const S = {name:'',level:'',n:0,qs:[],i:0,score:0,wrong:0,locked:true,iv:null,nt:null,muted:false};
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.random() * a.length | 0];
const LET = ['A','B','C','D'];

// Floating background stickers
['🎨','⭐','🖌️','📷','✂️','💜','🌈','🖼️','✨'].forEach((e, i) => {
  const s = document.createElement('div');
  s.className = 'stk'; s.textContent = e;
  s.style.cssText = `left:${(i * 11 + 3) % 92}%;top:${(i * 23 + 6) % 85}%;--r:${(i % 2 ? 1 : -1) * (6 + i * 2)}deg;--d:${4 + i % 4}s`;
  $('stickers').appendChild(s);
});

// Sound (WebAudio, no files needed)
let ac;
function tone(freqs) {
  if (S.muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, k) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + k * .12;
      o.frequency.value = f; o.type = 'triangle';
      g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.001, t + .25);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .26);
    });
  } catch (e) {}
}
$('mute').onclick = () => { S.muted = !S.muted; $('mute').textContent = S.muted ? '🔇' : '🔊'; };

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}
function transition(fn) {
  $('loader').classList.remove('hidden');
  setTimeout(() => { fn(); $('loader').classList.add('hidden'); }, 800);
}
function stopTimers() { clearInterval(S.iv); clearTimeout(S.nt); S.iv = S.nt = null; }

// Home
document.querySelectorAll('.level').forEach(b => b.onclick = () => {
  document.querySelectorAll('.level').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); });
  b.classList.add('sel'); b.setAttribute('aria-checked', 'true');
  S.level = b.dataset.level; S.n = +b.dataset.n;
  document.body.dataset.theme = S.level; $('err').textContent = '';
});
$('name').oninput = e => {
  const v = e.target.value.trim();
  $('welcome').textContent = v ? `Welcome, ${v}! Pick your level.` : 'Hi, creator! Tell us your name to begin.';
  $('err').textContent = '';
};
$('name').onkeydown = e => { if (e.key === 'Enter') $('start').click(); };
$('start').onclick = () => {
  const name = $('name').value.trim();
  if (!name) { $('err').textContent = 'Please enter your name first.'; $('name').focus(); return; }
  if (!S.level) { $('err').textContent = 'Please choose a difficulty level.'; return; }
  S.name = name;
  tone([523, 659]);
  transition(startQuiz);
};

function startQuiz() {
  stopTimers();
  const same = shuffle(BANK.filter(q => q[0] === S.level));
  const rest = shuffle(BANK.filter(q => q[0] !== S.level));
  S.qs = shuffle(same.concat(rest).slice(0, S.n)); // always S.n unique questions
  Object.assign(S, {i: 0, score: 0, wrong: 0, locked: true});
  $('qname').textContent = `👤 ${S.name}`;
  $('qlevel').textContent = S.level[0].toUpperCase() + S.level.slice(1);
  $('live').textContent = '0'; $('bar').style.width = '0%';
  show('quiz');
  showQ();
}

function showQ() {
  stopTimers();
  const q = S.qs[S.i];
  const opts = shuffle(q.slice(2).map((t, k) => ({t, ok: k === 0})));
  S.cur = opts;
  $('qcount').textContent = `Question ${S.i + 1}/${S.qs.length}`;
  $('qtext').textContent = q[1];
  const box = $('answers'); box.innerHTML = '';
  opts.forEach((o, k) => {
    const b = document.createElement('button');
    b.className = 'ans'; b.innerHTML = `<span>${LET[k]}</span>`;
    b.append(o.t);
    b.onclick = () => answer(k);
    box.appendChild(b);
  });
  const card = $('qcard'); card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  S.locked = false;
  const end = Date.now() + 10000;
  setRing(10);
  S.iv = setInterval(() => {
    const left = Math.max(0, (end - Date.now()) / 1000);
    setRing(left);
    if (left <= 0) timeout();
  }, 100);
}
function setRing(left) {
  $('tnum').textContent = Math.ceil(left);
  $('ringfg').style.strokeDashoffset = 163.4 * (1 - left / 10);
  document.querySelector('.ring').classList.toggle('low', left <= 3);
}
function reveal(pick) {
  [...$('answers').children].forEach((b, k) => {
    b.disabled = true;
    if (S.cur[k].ok) b.classList.add('right');
    else if (k === pick) b.classList.add('wrong');
  });
}
function feedback(type) {
  const [msg, ems] = MSG[type];
  $('fbem').textContent = rnd(ems); $('fbmsg').textContent = msg;
  const f = $('fb'); f.classList.toggle('bad', type !== 'right');
  f.classList.remove('show'); void f.offsetWidth; f.classList.add('show');
}
function answer(k) {
  if (S.locked) return;           // blocks double answers and answers after timeout
  S.locked = true; stopTimers();
  const ok = S.cur[k].ok;
  reveal(k);
  if (ok) { S.score++; $('live').textContent = S.score; tone([660, 880, 1100]); }
  else { S.wrong++; tone([220, 160]); }
  feedback(ok ? 'right' : 'wrong');
  S.nt = setTimeout(next, 1000);
}
function timeout() {
  if (S.locked) return;
  S.locked = true; stopTimers();
  S.wrong++; reveal(-1); tone([200, 150]); feedback('time');
  S.nt = setTimeout(next, 1000);   // no points awarded
}
function next() {
  S.i++;
  $('bar').style.width = (S.i / S.qs.length * 100) + '%';
  if (S.i >= S.qs.length) return results();
  showQ();
}

function results() {
  stopTimers();
  const total = S.qs.length, pct = Math.round(S.score / total * 100);
  $('rtitle').textContent = `Congratulations, ${S.name}! 🎉`;
  $('rscore').textContent = S.score; $('rtotal').textContent = total;
  $('rright').textContent = S.score; $('rwrong').textContent = total - S.score;
  $('rmsg').textContent = pct >= 90 ? "Outstanding! You're a Design Master! 🏆"
    : pct >= 70 ? 'Great Job! You have excellent design knowledge! 🌟'
    : pct >= 50 ? 'Good Effort! Keep Improving! 🎨'
    : "Don't Give Up! Practice Makes Perfect! 💪";
  const d = $('donut'); d.style.transition = 'none'; d.style.strokeDashoffset = 326.7;
  $('pct').textContent = '0%';
  show('results');
  void d.getBoundingClientRect(); d.style.transition = '';
  requestAnimationFrame(() => { d.style.strokeDashoffset = 326.7 * (1 - pct / 100); });
  let c = 0; const step = setInterval(() => { c = Math.min(pct, c + Math.max(1, pct / 40)); $('pct').textContent = Math.round(c) + '%'; if (c >= pct) clearInterval(step); }, 40);
  tone(pct >= 50 ? [523, 659, 784, 1047] : [330, 262]);
  if (pct >= 50) celebrate();
}
function celebrate() {
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'conf'; p.textContent = rnd(['🎉','✨','⭐','🎨','💜','🌟']);
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = 2 + Math.random() * 2.5 + 's';
    p.style.animationDelay = Math.random() * .8 + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5500);
  }
}

function resetAll() {
  stopTimers();
  Object.assign(S, {level: '', n: 0, qs: [], i: 0, score: 0, wrong: 0, locked: true});
  document.querySelectorAll('.level').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); });
  document.body.dataset.theme = 'medium'; $('bar').style.width = '0%'; $('live').textContent = '0';
  $('err').textContent = '';
}
$('again').onclick = () => transition(() => { resetAll(); $('name').value = S.name; show('home'); $('welcome').textContent = `Welcome back, ${S.name}! Pick a level.`; });
$('homeBtn').onclick = () => transition(() => { resetAll(); S.name = ''; $('name').value = ''; $('welcome').textContent = 'Hi, creator! Tell us your name to begin.'; show('home'); });
