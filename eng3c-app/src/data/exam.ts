import type { QuizQuestion } from '../types';

export interface ShortAnswer {
  id: string;
  q: string;
  marks: number;
  model: string;
  lookFor: string[];
}

export const EXAM_STORY = {
  title: 'The Night Shift',
  text: `The bakery on Dundas Street opened at six, which meant Theo started at three.

His mother had worked the same ovens for eleven years before her back gave out, and when Mr. Haddad offered the job to Theo, nobody asked whether a sixteen-year-old should be awake at that hour. Rent did not care what time it was.

The first week, he burned two trays of croissants and dropped an entire bin of flour, which exploded across the floor like a small, white storm. Mr. Haddad said nothing. He handed Theo a broom and went back to shaping loaves, his hands moving so fast they blurred.

By the second week, Theo could tell when the bread was done by the sound it made when he tapped the bottom: hollow, like knocking on a door to an empty room. He liked the quiet. He liked that no one needed him to talk. At school he sat in the back and said as little as possible, his eyes heavy, his homework half done on the bus.

"You fall asleep in my class again," Ms. Okonkwo said one afternoon, "and I am calling home."

"Go ahead," Theo said. "Nobody's awake at three in the afternoon."

She looked at him for a long moment. He expected the usual speech about effort and potential. Instead she asked, "What time do you start?"

He told her. She nodded slowly and wrote something on a sticky note.

The next morning, at 4:15, the bakery's back door opened and Ms. Okonkwo stepped in, shaking rain from her umbrella. Mr. Haddad looked up, flour to his elbows.

"I'd like a dozen of whatever he made," she said, pointing at Theo, "and I'd like to know if he can have Thursday mornings off for a study block."

Mr. Haddad studied her, then Theo, then the trays of bread cooling on the rack. "He is the best I have had in years," he said finally. "Thursdays, fine. But he comes back at noon."

Ms. Okonkwo paid for the bread and left the sticky note on the counter on her way out. It said: Thursday, 7:30, Room 214. Bring your questions.

Theo turned the note over in his floury fingers. Behind him the ovens ticked as they heated, steady as a clock, and for the first time in weeks he did not feel like the night was something he had to survive alone.`,
};

export const EXAM_READING: (QuizQuestion & { id: string })[] = [
  { id: 'r1', q: 'Why does Theo work at the bakery?', options: ['He wants to become a chef', 'His family needs the income since his mother can no longer work', 'Ms. Okonkwo arranged it', 'He needs volunteer hours'], answer: 1, why: '"Her back gave out" and "Rent did not care what time it was."' },
  { id: 'r2', q: '"exploded across the floor like a small, white storm" is an example of:', options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'], answer: 1, why: 'A comparison using "like".' },
  { id: 'r3', q: 'What does Mr. Haddad’s silence after the flour spill suggest about him?', options: ['He is furious', 'He is patient and willing to let Theo learn', 'He did not notice', 'He plans to fire Theo'], answer: 1, why: 'He hands Theo a broom and returns to work: no blame, just the next step.' },
  { id: 'r4', q: 'The comparison "like knocking on a door to an empty room" also hints at:', options: ['Theo’s loneliness', 'The bakery’s poor construction', 'Mr. Haddad’s wealth', 'A coming storm'], answer: 0, why: 'An empty room echoes Theo’s isolation at school and at home.' },
  { id: 'r5', q: 'Ms. Okonkwo’s question "What time do you start?" is a turning point because:', options: ['She is curious about baking', 'She chooses understanding over punishment', 'She wants a job', 'She is joking'], answer: 1, why: 'Theo expects a lecture; instead she asks about his life.' },
  { id: 'r6', q: 'Which is the best statement of theme?', options: ['Bakeries open early.', 'Teachers should be strict.', 'Small acts of understanding can make hardship feel less lonely.', 'Hard work always pays off immediately.'], answer: 2, why: 'The ending shows Theo no longer feels alone because someone noticed.' },
];

export const EXAM_SHORT: ShortAnswer[] = [
  {
    id: 's1',
    q: 'How does Ms. Okonkwo change from her first appearance to the end of the story? Use one piece of evidence. (3 marks)',
    marks: 3,
    model: 'Ms. Okonkwo changes from a strict teacher who threatens to call home to an ally who advocates for Theo. At first she warns that if he falls asleep again she is "calling home," but by the end she visits the bakery at 4:15 a.m. to arrange a study block. This shows she moved from judging his behaviour to understanding its cause.',
    lookFor: ['A clear answer in the first sentence (strict to supportive)', 'One accurate quotation or specific detail', 'An explanation of what the evidence shows'],
  },
  {
    id: 's2',
    q: 'Explain the significance of the final sentence. What has changed for Theo? (3 marks)',
    marks: 3,
    model: 'The final sentence shows that Theo no longer feels isolated. The ovens ticking "steady as a clock" suggest a reliable rhythm instead of an endless night, and he "did not feel like the night was something he had to survive alone." Because two adults have now noticed and supported him, his hardship has not disappeared, but he has people on his side.',
    lookFor: ['States the change (isolated to supported)', 'Refers to wording in the final sentence', 'Explains why it matters for the theme'],
  },
];

export const EXAM_MEDIA: (QuizQuestion & { id: string })[] = [
  { id: 'm1', q: 'Look at the screen-time chart. How much more daily screen time do Grade 12 students report than Grade 9 students?', options: ['About 1.2 hours', 'About 3 times as much', 'About 4 hours', 'About 0.2 hours'], answer: 0, why: '5.8 − 4.6 = 1.2 hours.' },
  { id: 'm2', q: 'Why does the Grade 12 bar look about three times taller than Grade 9?', options: ['Grade 12s use phones three times more', 'The y-axis starts at 4 hours instead of 0', 'The bars use different colours', 'The chart is a pie chart'], answer: 1, why: 'A truncated axis exaggerates differences.' },
  { id: 'm3', q: 'Is the headline "Screen time EXPLODES in senior years" justified?', options: ['Yes, the data shows an explosion', 'No: the increase is real (about 26%) but "explodes" exaggerates it', 'No: screen time goes down', 'It cannot be judged at all'], answer: 1, why: '5.8 ÷ 4.6 ≈ 1.26, a moderate rise.' },
];

export const EXAM_CONVENTIONS: (QuizQuestion & { id: string; quote: string })[] = [
  { id: 'c1', quote: 'The meeting ran late, everyone missed the bus.', q: 'Identify the error.', options: ['Fragment', 'Comma splice', 'Apostrophe error', 'No error'], answer: 1, why: 'Two independent clauses joined only by a comma.' },
  { id: 'c2', quote: 'Running down the hallway with my backpack open.', q: 'Identify the error.', options: ['Fragment', 'Run-on', 'Subject–verb agreement', 'No error'], answer: 0, why: 'No subject and main verb.' },
  { id: 'c3', quote: 'Neither of the managers were available.', q: 'Identify the error.', options: ['Apostrophe error', 'Subject–verb agreement', 'Comma splice', 'No error'], answer: 1, why: '"Neither" is singular: "was available".' },
  { id: 'c4', quote: 'The students’ lockers were cleaned out on Friday.', q: 'Identify the error.', options: ['Apostrophe error', 'Fragment', 'Wrong homophone', 'No error'], answer: 3, why: 'Plural possessive "students’" is correct.' },
  { id: 'c5', quote: 'Your going to need a permission form.', q: 'Identify the error.', options: ['Wrong homophone', 'Run-on', 'Fragment', 'No error'], answer: 0, why: '"You’re" means "you are".' },
  { id: 'c6', quote: 'The report was submitted by the team on Monday.', q: 'How should this be revised for active voice?', options: ['The team submitted the report on Monday.', 'On Monday, the report was submitted.', 'The report, by the team, was submitted.', 'It is already active.'], answer: 0, why: 'Make the doer (the team) the subject.' },
];

export const EXAM_PROMPTS = [
  {
    id: 'persuasive',
    title: 'Persuasive essay',
    prompt:
      'Should Ontario high schools build a scheduled study block into the school day? Write a persuasive essay of 400–600 words with a clear thesis, at least two PPE body paragraphs, and a counter-argument with rebuttal. You may use "The Night Shift" as one example.',
  },
  {
    id: 'compare',
    title: 'Compare & contrast essay',
    prompt:
      'Compare how Theo ("The Night Shift") and Mara ("Last Ferry") face adult responsibilities. Choose block or point-by-point structure, write a comparative thesis, and support each point with quotations. 400–600 words.',
  },
];

export const EXAM_SECTIONS = [
  { id: 'A', title: 'Part A: Sight passage', marks: EXAM_READING.length + EXAM_SHORT.reduce((a, s) => a + s.marks, 0) },
  { id: 'B', title: 'Part B: Graphic & media text', marks: EXAM_MEDIA.length },
  { id: 'C', title: 'Part C: Language conventions', marks: EXAM_CONVENTIONS.length },
  { id: 'D', title: 'Part D: Essay', marks: 20 },
];
