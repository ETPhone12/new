import type { QuizQuestion } from '../types';

export type HlLabel = 'thesis' | 'fact' | 'opinion' | 'inference';

export const HL_INFO: Record<HlLabel, { name: string; desc: string; cls: string; swatch: string }> = {
  thesis: { name: 'Thesis / main idea', desc: 'The central claim or main point', cls: 'hl-thesis', swatch: 'bg-hlThesis' },
  fact: { name: 'Verifiable fact', desc: 'Could be checked and confirmed', cls: 'hl-fact', swatch: 'bg-hlFact' },
  opinion: { name: 'Opinion / loaded language', desc: 'Judgment, prediction, or emotional spin', cls: 'hl-opinion', swatch: 'bg-hlOpinion' },
  inference: { name: 'Inference needed', desc: 'Means more than it says; write what is implied', cls: 'hl-inference', swatch: 'bg-hlInference' },
};

export interface Segment {
  text: string;
  label: HlLabel;
  /** Other labels that are also accepted for mixed sentences. */
  accept?: HlLabel[];
  note: string;
  /** Model answer for what the sentence implies. */
  inference?: string;
  para?: boolean;
}

export interface Passage {
  id: string;
  title: string;
  kind: string;
  byline: string;
  intro: string;
  segments: Segment[];
  questions: QuizQuestion[];
}

export const PASSAGES: Passage[] = [
  {
    id: 'phones',
    title: 'Phones Belong in Lockers, Not Pockets',
    kind: 'Op-ed',
    byline: 'By a Grade 12 student, Northview Collegiate student newspaper',
    intro: 'A student opinion piece. Find the thesis, then separate the checkable claims from the judgments.',
    segments: [
      { para: true, text: 'Last Tuesday, I watched a classmate check his phone eleven times during a twenty-minute lab.', label: 'fact', note: 'A specific, countable observation used as a hook. It could be checked by anyone in the room.' },
      { text: 'He is not lazy; he is hooked, and so are the rest of us.', label: 'opinion', note: '"Hooked" is a judgment, and "the rest of us" is a sweeping generalization.' },
      { text: 'It is time for Northview to require phones to stay in lockers from the first bell to the last.', label: 'thesis', note: 'The writer’s arguable position. Everything else supports this sentence.' },
      { para: true, text: 'Since 2019, Ontario has restricted cellphone use during instructional time, and the province tightened those rules in 2024.', label: 'fact', note: 'Dates and policy changes can be checked in government announcements.' },
      { text: 'Yet in our hallways, the rule might as well not exist.', label: 'opinion', accept: ['inference'], note: 'An exaggeration. It implies the rule is ignored but offers no measure.' },
      { text: 'Teachers at Northview report spending up to ten minutes per class reminding students to put devices away.', label: 'fact', note: 'An attributed claim you could verify by asking teachers. Note "up to": that is the maximum, not the average.' },
      {
        text: 'That adds up to almost an hour of lost learning every school day.',
        label: 'inference',
        accept: ['opinion'],
        note: 'The writer draws a conclusion from the "up to ten minutes" figure.',
        inference: 'The writer multiplies the worst case by every class, so the real daily loss is probably much smaller than an hour.',
      },
      { para: true, text: 'Some parents worry that they will not be able to reach their children in an emergency.', label: 'fact', accept: ['opinion'], note: 'It is a fact that some parents hold this worry. The writer is setting up the counter-argument.' },
      { text: 'That concern is understandable, but the main office has phones, and lockers are less than a minute away.', label: 'opinion', accept: ['fact'], note: 'Mixed: "understandable" is a judgment, while the office phones and locker distance are checkable. Its job is the rebuttal.' },
      { text: 'Besides, our grandparents survived high school without texting their parents every hour.', label: 'opinion', note: 'An appeal to tradition, and a weak one: "survived" without phones does not prove phones are useless in emergencies.' },
      { para: true, text: 'The benefits are obvious.', label: 'opinion', note: '"Obvious" is loaded. It pressures readers to agree instead of proving the point.' },
      { text: 'Students would talk to each other at lunch instead of scrolling in silence.', label: 'opinion', note: 'A prediction. Predictions are opinions until they happen.' },
      {
        text: 'Walk through the cafeteria at noon and count how many faces are lit blue.',
        label: 'inference',
        note: 'An image that implies more than it says.',
        inference: '"Faces lit blue" implies students are staring at screens instead of each other, so the cafeteria is quiet and disconnected.',
      },
      { text: 'Locking phones away for six hours is a small price for getting our attention back.', label: 'thesis', accept: ['opinion'], note: 'The thesis restated as a closing line, with a final judgment ("a small price").' },
    ],
    questions: [
      {
        q: 'Which piece of evidence is weakest?',
        options: ['The province changed its rules in 2024', 'Teachers report up to ten minutes per class', 'Our grandparents survived without phones', 'The classmate checked his phone eleven times'],
        answer: 2,
        why: 'It is an appeal to tradition, not evidence about emergencies or learning.',
      },
      {
        q: 'Whose voice is missing from the op-ed?',
        options: ['Teachers', 'Parents', 'Students who rely on phones for medical or family reasons', 'The writer'],
        answer: 2,
        why: 'Some students use phones for diabetes monitors, translation, or caregiving. The writer never considers them.',
      },
    ],
  },
  {
    id: 'transit',
    title: 'Council Approves 25-Cent Fare Increase',
    kind: 'News report',
    byline: 'Port Alder Daily (practice text; the city and people are fictional)',
    intro: 'A news report should be mostly fact. Watch how quotes and small details can still carry opinion and bias.',
    segments: [
      { para: true, text: 'PORT ALDER — City council voted 7–4 on Monday night to raise the adult transit fare from $3.25 to $3.50, starting March 1.', label: 'thesis', accept: ['fact'], note: 'In a news report the lead sentence is the main idea: who, what, when. It is also factual.' },
      { text: 'The increase is the first in four years.', label: 'fact', note: 'Checkable in city records.' },
      { text: 'Transit director Leah Moss told council the extra revenue, an estimated $2.1 million a year, will fund longer evening service on six routes.', label: 'fact', note: 'Attributed and checkable. "Estimated" signals a projection, not a result.' },
      { text: '“Riders asked for buses after 10 p.m., and this is how we pay for them,” Moss said.', label: 'opinion', accept: ['fact'], note: 'It is a fact that she said it, but the content is her justification for the decision.' },
      { para: true, text: 'Councillor Raj Patel, who voted against the motion, called the increase “a tax on the people who can least afford it.”', label: 'opinion', accept: ['fact'], note: 'A quoted opinion with loaded language ("a tax"). Balanced reporting includes both sides.' },
      { text: 'About 38 percent of riders who responded to a city survey last fall said they earn less than $30,000 a year.', label: 'fact', note: 'A checkable statistic. "Who responded" means it is not all riders.' },
      { text: 'Student and senior fares will not change.', label: 'fact', note: 'A verifiable policy detail.' },
      {
        para: true,
        text: 'The Port Alder Riders’ Union, which was not invited to present at Monday’s meeting, plans to hold a public forum next week.',
        label: 'inference',
        accept: ['fact'],
        note: 'Factual on the surface, but the writer chose to include "was not invited".',
        inference: 'Including that the union was not invited suggests the riders who will pay the fare had little say in the decision.',
      },
    ],
    questions: [
      {
        q: 'Why does the reporter include both Moss and Patel?',
        options: ['To fill space', 'To present both sides of the decision', 'Because they are friends', 'To prove the increase is good'],
        answer: 1,
        why: 'Balanced news reporting quotes people on different sides.',
      },
      {
        q: 'The survey statistic mainly supports whose view?',
        options: ['Moss', 'Patel', 'Neither', 'The mayor'],
        answer: 1,
        why: 'It suggests many riders have low incomes, backing Patel’s "can least afford it".',
      },
    ],
  },
  {
    id: 'hydrate',
    title: 'The Smart Way to Hydrate',
    kind: 'Advertorial (sponsored content)',
    byline: 'SPONSORED by AquaPeak (practice text; the brand and athlete are fictional)',
    intro: 'An ad dressed as an article. Separate what can be checked from the sales pitch.',
    segments: [
      { para: true, text: 'Every athlete knows the feeling: legs heavy, head foggy, the finish line impossibly far away.', label: 'opinion', note: '"Every athlete knows" is a generalization designed to make you nod along (pathos).' },
      { text: 'Scientists agree that losing as little as 2 percent of your body weight in water can hurt performance.', label: 'fact', note: 'Widely reported in sports science and checkable. Notice, though, that "scientists agree" names no source.' },
      { text: 'That is why AquaPeak Electrolyte Water is the only drink serious athletes trust.', label: 'thesis', accept: ['opinion'], note: 'The main claim, and a sweeping opinion. "Only" and "serious" cannot be proven. It also leaps from "water matters" to "this brand".' },
      { para: true, text: 'Each 500 mL bottle contains 200 mg of sodium and 90 mg of potassium.', label: 'fact', note: 'Checkable on the nutrition label.' },
      { text: 'Ordinary water simply cannot keep up.', label: 'opinion', note: '"Ordinary" and "simply" are loaded. No evidence is given.' },
      { text: 'In a company taste test, 9 out of 10 participants preferred AquaPeak’s Glacier Berry flavour.', label: 'fact', accept: ['inference'], note: 'A fact claim, but the company ran the test, the sample size is hidden, and taste is not performance.' },
      {
        para: true,
        text: 'Pro triathlete Kenji Moreau starts every race with a bottle in hand.',
        label: 'inference',
        accept: ['fact'],
        note: 'Checkable on the surface, but its real job is an implied endorsement.',
        inference: 'It implies AquaPeak helps Moreau perform, without saying whether he is paid to carry it.',
      },
      { text: 'Don’t settle for less. Your body deserves the peak.', label: 'opinion', note: 'A call to action with loaded language and a pun on the brand name.' },
    ],
    questions: [
      {
        q: 'Which detail most suggests this is not neutral journalism?',
        options: ['The sodium content', 'The "SPONSORED" label', 'The 2 percent statistic', 'The flavour name'],
        answer: 1,
        why: 'Sponsored content is paid for by the company it praises.',
      },
      {
        q: 'What logical leap does the thesis make?',
        options: ['From "hydration matters" to "only this brand works"', 'From taste to price', 'From sodium to potassium', 'None'],
        answer: 0,
        why: 'Evidence that water matters is not evidence for AquaPeak in particular.',
      },
    ],
  },
];

export const PASSAGE_BY_ID: Record<string, Passage> = Object.fromEntries(PASSAGES.map((p) => [p.id, p]));
