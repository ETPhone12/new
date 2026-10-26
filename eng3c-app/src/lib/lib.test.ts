import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kicaOverall, levelCode, levelFromPercent, summarize, termMark } from './grading.ts';
import { applyReplacement, findPassive, lintText, precisionScore, splitSentences, textStats } from './textAnalysis.ts';
import { analyzeMemo, analyzeProcedure, checkCaption, checkExplanation, checkPoint, checkProof, checkStep } from './writingChecks.ts';
import { analyzePauses, countFillers, wpm } from './speech.ts';

const W = { K: 20, T: 30, C: 30, A: 20 };

test('levels follow the Ontario bands', () => {
  assert.equal(levelFromPercent(85).level, '4');
  assert.equal(levelFromPercent(79.9).level, '3');
  assert.equal(levelFromPercent(70).level, '3');
  assert.equal(levelFromPercent(60).level, '2');
  assert.equal(levelFromPercent(50).level, '1');
  assert.equal(levelFromPercent(49).level, 'R');
  assert.equal(levelCode(78), '3+');
  assert.equal(levelCode(71), '3-');
  assert.equal(levelCode(95), '4+');
  assert.equal(levelCode(40), 'R');
});

test('KICA overall re-weights over scored categories', () => {
  assert.equal(kicaOverall({ K: 80, T: 70, C: 60, A: 90 }, W), (80 * 20 + 70 * 30 + 60 * 30 + 90 * 20) / 100);
  assert.equal(kicaOverall({ C: 70 }, W), 70);
  assert.equal(kicaOverall({}, W), null);
});

test('term mark methods', () => {
  assert.equal(termMark([], 'average'), null);
  assert.equal(termMark([60, 80], 'average'), 70);
  assert.equal(termMark([60, 70, 90], 'median'), 70);
  const recent = termMark([60, 90], 'recent')!;
  assert.ok(recent > 75, 'later work should count more');
});

test('final grade summary and needed mark', () => {
  const s = summarize(
    [
      { id: '1', at: '2026-01-01', title: 'a', kind: 'term', source: 'x', scores: { K: 70, T: 70, C: 70, A: 70 } },
      { id: '2', at: '2026-02-01', title: 'b', kind: 'term', source: 'x', scores: { K: 70, T: 70, C: 70, A: 70 } },
    ],
    W,
    { culminating: 15, exam: 15 },
    'recent',
    75,
  );
  assert.equal(s.term, 70);
  assert.equal(s.current, 70);
  assert.equal(s.coverage, 70);
  // need (75*100 - 70*70) / 30
  assert.ok(Math.abs((s.neededForTarget ?? 0) - (7500 - 4900) / 30) < 1e-9);
});

test('sentence splitter handles abbreviations and decimals', () => {
  const s = splitSentences('Dr. Lee paid $3.50 for it. Then she left! Did it work?');
  assert.equal(s.length, 3);
  assert.equal(s[0].text, 'Dr. Lee paid $3.50 for it.');
});

test('passive voice detection', () => {
  assert.equal(findPassive('The report was written by the committee.').length, 1);
  assert.equal(findPassive('The window was broken.').length, 1);
  assert.equal(findPassive('She was tired after work.').length, 0);
  assert.equal(findPassive('The committee wrote the report.').length, 0);
});

test('linter flags wordiness, slang, splices', () => {
  const text = 'Due to the fact that the bus was late, we missed the test. The bus was late, we missed class. It was gonna rain.';
  const issues = lintText(text);
  const kinds = issues.map((i) => i.kind);
  assert.ok(kinds.includes('wordy'));
  assert.ok(kinds.includes('splice'));
  assert.ok(kinds.includes('slang'));
  // The first sentence begins with a subordinate idea, so its comma is not a splice
  const splices = issues.filter((i) => i.kind === 'splice');
  assert.equal(splices.length, 1);
  assert.ok(text.slice(splices[0].start).startsWith(', we missed class'));
});

test('linter skips dialogue tags and intro phrases', () => {
  const kinds = lintText('"We are leaving now," she said quietly. After the long game ended, we went home.').map((i) => i.kind);
  assert.ok(!kinds.includes('splice'));
});

test('replacement keeps case and tidies cuts', () => {
  const text = 'In order to win, we trained.';
  const issue = lintText(text).find((i) => i.kind === 'wordy')!;
  assert.equal(applyReplacement(text, issue), 'To win, we trained.');
  const t2 = 'It is important to note that the rules changed.';
  const cut = lintText(t2).find((i) => i.kind === 'wordy')!;
  assert.equal(applyReplacement(t2, cut), 'The rules changed.');
});

test('linter catches common apostrophe and homophone slips', () => {
  const t = 'Its time to go. They lost there homework. Your welcome. This is better then that. I cant stay. The dog wagged its own tail.';
  const fixes = lintText(t).filter((i) => i.kind === 'mechanics').map((i) => i.replacement);
  assert.ok(fixes.includes("It's"));
  assert.ok(fixes.includes('their'));
  assert.ok(fixes.includes("You're"));
  assert.ok(fixes.includes('than'));
  assert.ok(fixes.includes("can't"));
  assert.equal(fixes.filter((f) => f === "it's" || f === "It's").length, 1);
});

test('precision score drops with issues', () => {
  const clean = 'Students who sleep eight hours score higher on tests. Schools should start later.';
  const messy = 'Basically u gotta sleep alot, its gonna help kinda.';
  const a = precisionScore(lintText(clean), textStats(clean).words);
  const b = precisionScore(lintText(messy), textStats(messy).words);
  assert.ok(a > b);
});

test('PPE checks', () => {
  assert.equal(checkPoint('In this paragraph I will talk about phones.').find((c) => c.id === 'point-announce')!.level, 'fail');
  assert.equal(checkPoint('Later school start times improve student health and grades.').every((c) => c.level !== 'fail'), true);
  const proof = 'According to the district survey, "61% of students reported sleeping fewer than seven hours" (Hamilton 4).';
  assert.equal(checkProof(proof).filter((c) => c.required).every((c) => c.level === 'pass'), true);
  assert.equal(checkProof('Lots of people agree.').find((c) => c.id === 'proof-evidence')!.level, 'fail');
  const exp = checkExplanation('This shows that most students start the school day already tired. Because tired students focus less and forget more, later start times would give them the rest they need to improve their grades.', 'Later school start times improve student grades.', proof);
  assert.equal(exp.find((c) => c.id === 'exp-length')!.level, 'pass');
  assert.equal(exp.find((c) => c.id === 'exp-tie')!.level, 'pass');
});

test('procedure step checks', () => {
  const ids = (s: string, m = '') => checkStep(s, m).filter((c) => c.level !== 'pass').map((c) => c.id);
  assert.ok(ids('You should unplug the toaster.').includes('you-should'));
  assert.ok(ids('Make sure the water is hot.').some((i) => i.startsWith('vague')));
  assert.ok(ids('The lid is removed.').includes('passive'));
  assert.ok(ids('Open the lid and remove the filter.').includes('multi'));
  assert.ok(ids('Use a screwdriver to remove the cover.', 'gloves').includes('prereq'));
  assert.ok(!ids('Use a screwdriver to remove the two cover screws.', 'Phillips screwdriver, screws').includes('prereq'));
  assert.deepEqual(ids('Press the red power button for 3 seconds.'), []);
  assert.deepEqual(ids('If the light stays off, hold the reset button for 10 seconds.'), []);
});

test('procedure report requires safety notes for hazards', () => {
  const r = analyzeProcedure({ title: 'How to Boil Pasta', audience: 'First-time cooks making dinner', materials: 'pot, water, salt, pasta', steps: ['Fill the pot with 4 L of water.', 'Heat the water on high until it boils.', 'Add 500 g of pasta.'], warnings: '', result: '' });
  assert.equal(r.doc.find((c) => c.id === 'safety')?.level, 'fail');
});

test('memo checks', () => {
  const r = analyzeMemo({ to: 'All staff', from: 'Manager', date: 'May 2', subject: 'Update', body: 'Hi everyone, stuff is changing.' });
  assert.equal(r.checks.find((c) => c.id === 'subject-specific')!.level, 'warn');
  assert.equal(r.checks.find((c) => c.id === 'greeting')!.level, 'warn');
});

test('caption checks', () => {
  assert.equal(checkCaption('This is a picture of my dog.').find((c) => c.id === 'lazy')!.level, 'fail');
  assert.ok(checkCaption('Maya laces her skates at 5 a.m. Practice starts in ten minutes.').every((c) => c.level === 'pass'));
});

test('speech metrics', () => {
  assert.equal(wpm(280, 120), 140);
  const f = countFillers('Um, so, I think like we should, uh, vote. I like the plan, you know.');
  assert.equal(f.byWord.um, 1);
  assert.equal(f.byWord.uh, 1);
  assert.equal(f.byWord.like, 1);
  assert.equal(f.byWord['you know'], 1);
  // 1 s speech, 0.5 s pause, 1 s speech, 2.5 s pause, 1 s speech at 50 ms steps
  const lv = (n: number, v: number) => Array(n).fill(v);
  const levels = [...lv(10, 0.001), ...lv(20, 0.1), ...lv(10, 0.002), ...lv(20, 0.1), ...lv(50, 0.001), ...lv(20, 0.12), ...lv(10, 0.001)];
  const r = analyzePauses(levels, 50);
  assert.equal(r.pauses.length, 2);
  assert.equal(r.short, 1);
  assert.equal(r.long, 1);
});
