// test/content.test.js
// Guards the richness of every technique guide so it can't silently regress.
import assert from 'node:assert';
import { TECHNIQUES } from '../js/content.js';

for (const t of TECHNIQUES) {
  const g = t.guide;
  assert.ok(g.intro && g.intro.length > 30, `${t.id}: intro too short`);
  assert.ok(Array.isArray(g.steps) && g.steps.length >= 2, `${t.id}: needs steps`);
  assert.ok(Array.isArray(g.examples) && g.examples.length >= 5, `${t.id}: needs >= 5 worked examples`);
  g.examples.forEach((e, i) => {
    assert.ok(e.q && e.work, `${t.id}: example ${i} missing q/work`);
  });
  assert.ok(g.whyItWorks && g.whyItWorks.length > 20, `${t.id}: needs a "why it works"`);
  assert.ok(g.mistakes && g.mistakes.length > 15, `${t.id}: needs a "watch out" note`);
  assert.ok(g.diagram && g.diagram.includes('<svg'), `${t.id}: needs an SVG diagram`);
}

console.log(`✅ All ${TECHNIQUES.length} guides are rich (>=5 examples + why + watch-out + diagram).`);
