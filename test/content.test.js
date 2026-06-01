// test/content.test.js
// Guards the richness of every technique guide so it can't silently regress.
import assert from 'node:assert';
import { TECHNIQUES } from '../js/content.js';

for (const t of TECHNIQUES) {
  const g = t.guide;
  assert.ok(g.intro && g.intro.length > 30, `${t.id}: intro too short`);
  assert.ok(Array.isArray(g.steps) && g.steps.length >= 2, `${t.id}: needs steps`);
  assert.ok(Array.isArray(g.walkthroughs) && g.walkthroughs.length >= 3, `${t.id}: needs >= 3 detailed walkthroughs`);
  g.walkthroughs.forEach((w, i) => {
    assert.ok(w.q, `${t.id}: walkthrough ${i} missing question`);
    assert.ok(Array.isArray(w.steps) && w.steps.length >= 2, `${t.id}: walkthrough ${i} needs >= 2 steps`);
  });
  assert.ok(g.hook && g.hook.length > 15, `${t.id}: needs a real-life hook`);
  assert.ok(g.whyItWorks && g.whyItWorks.length > 20, `${t.id}: needs a "why it works"`);
  assert.ok(g.mistakes && g.mistakes.length > 15, `${t.id}: needs a "watch out" note`);
  assert.ok(g.diagram && g.diagram.includes('<svg'), `${t.id}: needs an SVG diagram`);
}

console.log(`✅ All ${TECHNIQUES.length} guides are rich (3 step-by-step walkthroughs + why + watch-out + diagram).`);
