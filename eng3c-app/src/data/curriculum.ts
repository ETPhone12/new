import type { CourseModule, StrandId, ToolId } from '../types';

export interface Strand {
  id: StrandId;
  name: string;
  short: string;
  expectations: { code: string; name: string }[];
  does: string;
  reflection: string;
}

export const STRANDS: Strand[] = [
  {
    id: 'A',
    name: 'Oral Communication',
    short: 'Oral',
    expectations: [
      { code: 'A1', name: 'Listening to Understand' },
      { code: 'A2', name: 'Speaking to Communicate' },
      { code: 'A3', name: 'Reflecting on Oral Communication Skills and Strategies' },
    ],
    does: 'Analyze speeches and audio for bias and tone, listen actively, and deliver structured presentations, pitches, or podcasts with control of pace, pitch, and non-verbal cues.',
    reflection: 'A3',
  },
  {
    id: 'B',
    name: 'Reading & Literature Studies',
    short: 'Reading',
    expectations: [
      { code: 'B1', name: 'Reading for Meaning' },
      { code: 'B2', name: 'Understanding Form and Style' },
      { code: 'B3', name: 'Reading With Fluency' },
      { code: 'B4', name: 'Reflecting on Reading Skills and Strategies' },
    ],
    does: 'Read short stories, plays, novels, manuals, reports, and graphic texts; find main ideas, make inferences, and decode vocabulary from context.',
    reflection: 'B4',
  },
  {
    id: 'C',
    name: 'Writing',
    short: 'Writing',
    expectations: [
      { code: 'C1', name: 'Developing and Organizing Content' },
      { code: 'C2', name: 'Using Knowledge of Form and Style' },
      { code: 'C3', name: 'Applying Knowledge of Conventions' },
      { code: 'C4', name: 'Reflecting on Writing Skills and Strategies' },
    ],
    does: 'Brainstorm and outline; draft instructions, business letters, news reports, persuasive and compare-and-contrast essays; edit for grammar, punctuation, and active voice.',
    reflection: 'C4',
  },
  {
    id: 'D',
    name: 'Media Studies',
    short: 'Media',
    expectations: [
      { code: 'D1', name: 'Understanding Media Texts' },
      { code: 'D2', name: 'Understanding Media Forms, Conventions, and Techniques' },
      { code: 'D3', name: 'Creating Media Texts' },
      { code: 'D4', name: 'Reflecting on Media Literacy Skills and Strategies' },
    ],
    does: 'Deconstruct ads, PSAs, news, and social feeds; identify audiences, overt and implied messages, and camera, lighting, and layout choices; produce original media.',
    reflection: 'D4',
  },
];

export const STRAND_BY_ID: Record<StrandId, Strand> = Object.fromEntries(STRANDS.map((s) => [s.id, s])) as Record<StrandId, Strand>;

/** Tailwind classes for each strand's colour, written out so the build keeps them. */
export const STRAND_STYLE: Record<StrandId, { text: string; bg: string; soft: string; tint: string; border: string; dot: string }> = {
  A: { text: 'text-strandA', bg: 'bg-strandA', soft: 'bg-strandA/10', tint: 'bg-strandA/15', border: 'border-strandA', dot: 'bg-strandA' },
  B: { text: 'text-strandB', bg: 'bg-strandB', soft: 'bg-strandB/10', tint: 'bg-strandB/15', border: 'border-strandB', dot: 'bg-strandB' },
  C: { text: 'text-strandC', bg: 'bg-strandC', soft: 'bg-strandC/10', tint: 'bg-strandC/15', border: 'border-strandC', dot: 'bg-strandC' },
  D: { text: 'text-strandD', bg: 'bg-strandD', soft: 'bg-strandD/10', tint: 'bg-strandD/15', border: 'border-strandD', dot: 'bg-strandD' },
};

export interface TvoUnit {
  id: string;
  title: string;
  lessons: { code: string; title: string }[];
  strands: StrandId[];
  modules: string[];
}

/** The "Power" thematic unit sequence used by Ontario's public distance-learning ENG3C course. */
export const TVO_UNITS: TvoUnit[] = [
  {
    id: 'U1',
    title: 'Writing Power',
    strands: ['B', 'C'],
    modules: ['m1', 'm2', 'm5'],
    lessons: [
      { code: '1.0', title: 'Welcome to Grade 11 English' },
      { code: '1.1', title: 'Power of narrative structure' },
      { code: '1.2', title: 'Whose point of view is shared?' },
      { code: '1.3', title: 'Persuasion is power' },
      { code: '1.4', title: 'Fact vs. opinion' },
      { code: '1.5', title: 'Influencing' },
    ],
  },
  {
    id: 'U2',
    title: 'Communicating Power',
    strands: ['A'],
    modules: ['m3'],
    lessons: [
      { code: '2.1', title: 'Active listening' },
      { code: '2.2', title: 'Communicating without words' },
      { code: '2.3', title: 'Producing powerful speeches' },
      { code: '2.4', title: 'Playing with performance' },
      { code: '2.5', title: 'Engaging an audience' },
    ],
  },
  {
    id: 'U3',
    title: 'Media Power',
    strands: ['D', 'B'],
    modules: ['m4'],
    lessons: [
      { code: '3.1', title: 'The social media self' },
      { code: '3.2', title: 'Managing your digital self' },
      { code: '3.3', title: 'Communicating through images' },
      { code: '3.4', title: 'Relating through photo essays' },
    ],
  },
  {
    id: 'U4',
    title: 'Changing Power',
    strands: ['C', 'B', 'A', 'D'],
    modules: ['m5'],
    lessons: [
      { code: '4.1', title: 'The compare and contrast essay' },
      { code: '4.2', title: 'Advocating for change (culminating project + final exam)' },
    ],
  },
];

export interface ToolInfo {
  id: ToolId;
  name: string;
  strand: StrandId | 'all';
  blurb: string;
  kica: ('K' | 'T' | 'C' | 'A')[];
}

export const TOOLS: ToolInfo[] = [
  { id: 'reader', name: 'Text Deconstructor', strand: 'B', blurb: 'Split-screen reader. Highlight thesis, facts, opinions, and inferences, then check against the key.', kica: ['K', 'T'] },
  { id: 'graphic', name: 'Graphic Text Lab', strand: 'B', blurb: 'Read charts, floor plans, and infographics. Spot truncated axes and missing sources.', kica: ['K', 'T'] },
  { id: 'drills', name: 'Quick-Fire Drills', strand: 'B', blurb: 'Tap transitions, decode context clues, name fallacies, appeals, and citation errors.', kica: ['K', 'T'] },
  { id: 'ppe', name: 'PPE Paragraph Builder', strand: 'C', blurb: 'Fill Point, Proof, Explanation (and Link) slots. The paragraph stitches only when each part works.', kica: ['T', 'C'] },
  { id: 'compare', name: 'Compare & Contrast Matrix', strand: 'C', blurb: 'Enter criteria once, flip between Block and Point-by-Point essay skeletons.', kica: ['T', 'C'] },
  { id: 'procedure', name: 'How-To Stress Tester', strand: 'C', blurb: 'Write steps or a memo. Flags vague verbs, passive voice, missing materials, and safety gaps.', kica: ['C', 'A'] },
  { id: 'linter', name: 'Precision Linter', strand: 'C', blurb: 'Underlines wordiness, slang, comma splices, run-ons, and passive voice with one-tap fixes.', kica: ['C'] },
  { id: 'listening', name: 'Active Listening Player', strand: 'A', blurb: 'Audio pieces that pause at checkpoints to ask about tone, audience, and rhetorical moves.', kica: ['K', 'T'] },
  { id: 'speech', name: 'Speech Studio', strand: 'A', blurb: 'Teleprompter and recorder. Measures words per minute, filler words, and pauses.', kica: ['C', 'A'] },
  { id: 'hotspot', name: 'Ad & PSA Analyzer', strand: 'D', blurb: 'Tap hotspots on posters to tag angle, composition, colour, overt and implied messages.', kica: ['K', 'T'] },
  { id: 'photo', name: 'Photo Essay Storyboard', strand: 'D', blurb: 'Sequence 5–6 photos, tag shot types, and write tight active captions.', kica: ['A', 'C'] },
  { id: 'exam', name: 'Mock Final Exam', strand: 'all', blurb: 'Timed sight passage, media text, conventions, and essay with auto-marking and a rubric.', kica: ['K', 'T', 'C', 'A'] },
  { id: 'reflections', name: 'Reflection Log', strand: 'all', blurb: 'The 60-second metacognition log for A3, B4, C4, and D4. Export it for your teacher.', kica: ['T'] },
  { id: 'grades', name: 'KICA Gradebook', strand: 'all', blurb: 'Self-assess on the four KICA categories and project your final mark with the 70/30 split.', kica: ['K', 'T', 'C', 'A'] },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, ToolInfo>;

export const MODULES: CourseModule[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Precision & Real-World Writing',
    focus: 'Reading informational and graphic texts, then writing technical documents with zero ambiguity.',
    strands: ['B', 'C'],
    lessonIds: ['1-1', '1-2', '1-3', '1-4'],
    milestone: {
      id: 'pt1',
      title: 'Portfolio Task 1: Infographic Analysis + Zero-Ambiguity SOP',
      kind: 'term',
      summary:
        'Analyze a complex infographic (features, data, and any misleading design), then write a standard operating procedure that a first-time reader can follow without asking a single question.',
      steps: [
        { label: 'Analyze all three graphics in the Graphic Text Lab', tool: 'graphic' },
        { label: 'Sort fact from opinion in the advertorial passage', tool: 'reader', param: 'hydrate' },
        { label: 'Draft your SOP and pass the stress test (score 85+)', tool: 'procedure' },
        { label: 'Polish the final copy in the Precision Linter', tool: 'linter' },
      ],
      rubric: [
        { cat: 'K', criteria: ['Names graphic text features (title, legend, axis, scale, source) and their purpose', 'Explains the purpose and audience of the SOP'] },
        { cat: 'T', criteria: ['Draws accurate conclusions from the data', 'Spots misleading design or missing information', 'Orders steps logically with prerequisites first'] },
        { cat: 'C', criteria: ['Every step starts with a command verb and has one action', 'Uses exact measurements and consistent names for parts', 'Clean formatting, headings, and conventions'] },
        { cat: 'A', criteria: ['The SOP works when a real first-time reader tests it', 'Applies graphic-reading strategies to a new document'] },
      ],
    },
  },
  {
    id: 'm2',
    number: 2,
    title: 'The Mechanics of Persuasion',
    focus: 'How arguments work: appeals, devices, PPE paragraphs, fallacies, and the opinion piece.',
    strands: ['B', 'C'],
    lessonIds: ['2-1', '2-2', '2-3', '2-4'],
    milestone: {
      id: 'pt2',
      title: 'Portfolio Task 2: Persuasive Op-Ed with Cited Evidence',
      kind: 'term',
      summary:
        'Write a 500–700 word op-ed on a local or school issue. Use at least two cited sources, a counter-argument with rebuttal, and three PPE body paragraphs. Finish with a reflection log entry.',
      steps: [
        { label: 'Warm up: rhetorical appeals and devices drill', tool: 'drills', param: 'rhetoric' },
        { label: 'Build three PPE body paragraphs', tool: 'ppe' },
        { label: 'Check your argument for fallacies', tool: 'drills', param: 'fallacies' },
        { label: 'Lint the full op-ed (score 80+)', tool: 'linter' },
        { label: 'Log a 60-second reflection on your writing process', tool: 'reflections' },
      ],
      rubric: [
        { cat: 'K', criteria: ['Uses ethos, pathos, and logos on purpose and can name them', 'Understands the issue and the evidence'] },
        { cat: 'T', criteria: ['Arguable thesis', 'Credible, relevant evidence from at least two sources', 'Addresses a counter-argument without fallacies'] },
        { cat: 'C', criteria: ['PPE paragraphs with smooth transitions', 'Tone fits the publication and audience', 'Correct MLA/APA in-text citations and conventions'] },
        { cat: 'A', criteria: ['Connects the issue to real people and events in the community', 'Chooses persuasive techniques that suit the audience'] },
      ],
    },
  },
  {
    id: 'm3',
    number: 3,
    title: 'Oral Power & Active Listening',
    focus: 'Listening for meaning and tone, then scripting and delivering a speech built for the ear.',
    strands: ['A'],
    lessonIds: ['3-1', '3-2', '3-3', '3-4'],
    milestone: {
      id: 'pt3',
      title: 'Portfolio Task 3: Audio Editorial Quiz + 2-Minute Persuasive Speech',
      kind: 'term',
      summary:
        'Complete the audio editorial with checkpoint questions, then script, rehearse, and record a 2-minute persuasive speech. Aim for 130–150 words per minute with few filler words.',
      steps: [
        { label: 'Listen to "The Seven-Dollar T-Shirt" and answer every checkpoint', tool: 'listening', param: 'fashion' },
        { label: 'Script your speech (260–300 words) in the Speech Studio', tool: 'speech' },
        { label: 'Record it and review WPM, fillers, and pauses', tool: 'speech' },
        { label: 'Log a 60-second reflection on your delivery', tool: 'reflections' },
      ],
      rubric: [
        { cat: 'K', criteria: ['Identifies tone, audience, purpose, and devices in the audio', 'Knows the parts of a persuasive speech'] },
        { cat: 'T', criteria: ['Notes capture the main argument and key evidence', 'Speech has a hook, signposts, and a call to action'] },
        { cat: 'C', criteria: ['Pace in the 130–150 WPM range', 'Clear articulation, few fillers, purposeful pauses', 'Vocal variety and emphasis'] },
        { cat: 'A', criteria: ['Script is written for the ear (short sentences, repetition, concrete examples)', 'Adapts the message to the listeners'] },
      ],
    },
  },
  {
    id: 'm4',
    number: 4,
    title: 'Media Literacy & Visual Storytelling',
    focus: 'Decoding how images persuade, reading laterally online, and creating a photo essay.',
    strands: ['D', 'B'],
    lessonIds: ['4-1', '4-2', '4-3', '4-4'],
    milestone: {
      id: 'pt4',
      title: 'Portfolio Task 4: PSA Deconstruction + 5-Frame Photo Essay',
      kind: 'term',
      summary:
        'Deconstruct a print PSA (angle, composition, colour, lighting, overt and implied messages, audience), then build a 5-frame annotated photo essay on one theme using varied shots and tight captions.',
      steps: [
        { label: 'Deconstruct the "One Text" PSA', tool: 'hotspot', param: 'psa' },
        { label: 'Deconstruct an ad of your own choosing (upload it)', tool: 'hotspot', param: 'custom' },
        { label: 'Build the 5-frame photo essay with captions', tool: 'photo' },
        { label: 'Log a 60-second media reflection', tool: 'reflections' },
      ],
      rubric: [
        { cat: 'K', criteria: ['Names techniques: angle, shot size, composition, colour, lighting', 'Knows PSA conventions'] },
        { cat: 'T', criteria: ['Explains overt and implied messages and who benefits', 'Identifies the target audience with evidence'] },
        { cat: 'C', criteria: ['Captions are tight (2 sentences max) with active verbs', 'Clear visual sequence and a stated theme'] },
        { cat: 'A', criteria: ['Uses angles and composition on purpose in the photo essay', 'Applies media concepts to a new text'] },
      ],
    },
  },
  {
    id: 'm5',
    number: 5,
    title: 'Comparative Analysis & Culminating Prep',
    focus: 'Narrative structure, compare-and-contrast essays, citations, and the timed final exam.',
    strands: ['B', 'C', 'A', 'D'],
    lessonIds: ['5-1', '5-2', '5-3', '5-4'],
    milestone: {
      id: 'final',
      title: 'Final Evaluation: Compare & Contrast Essay + Timed Exam',
      kind: 'culminating',
      summary:
        'Write a full compare-and-contrast essay (two texts, characters, or media pieces) with integrated, cited quotations. Then sit the timed mock exam: sight passage, media text, conventions, and an essay. An advocacy project (research + media + persuasive writing) is a common alternative culminating task.',
      steps: [
        { label: 'Outline in the Compare & Contrast Matrix', tool: 'compare' },
        { label: 'Draft body paragraphs with integrated quotes', tool: 'ppe' },
        { label: 'Check your citations', tool: 'drills', param: 'citations' },
        { label: 'Lint the essay (score 80+)', tool: 'linter' },
        { label: 'Sit the timed mock exam', tool: 'exam' },
      ],
      rubric: [
        { cat: 'K', criteria: ['Accurate understanding of both subjects', 'Uses narrative and comparison terms correctly'] },
        { cat: 'T', criteria: ['Insightful criteria for comparison', 'Thesis states the relationship and what it reveals', 'Well-chosen evidence'] },
        { cat: 'C', criteria: ['Clear block or point-by-point organization', 'Comparison transitions (similarly, whereas, in contrast)', 'MLA citations and clean conventions'] },
        { cat: 'A', criteria: ['Connects the comparison to wider themes or real events', 'Integrates quotations smoothly'] },
      ],
    },
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<string, CourseModule>;

export const ALL_MILESTONES = MODULES.map((m) => m.milestone);

export const READING_LIST = {
  novels: [
    { title: 'The Marrow Thieves', author: 'Cherie Dimaline', note: 'Flagship novel for NBE3C; widely used in ENG3C.' },
    { title: 'Indian Horse', author: 'Richard Wagamese', note: 'Residential school survivor story; hockey, memory, healing.' },
    { title: 'One Native Life', author: 'Richard Wagamese', note: 'Memoir in short essays; good model for personal narrative.' },
    { title: 'Animal Farm', author: 'George Orwell', note: 'Allegory of power and propaganda; pairs with media and persuasion units.' },
    { title: '1984', author: 'George Orwell', note: 'Surveillance, language, and control.' },
    { title: 'Of Mice and Men', author: 'John Steinbeck', note: 'Short novel on friendship, dreams, and loneliness.' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', note: 'First-person voice and the unreliable narrator.' },
    { title: '12 Angry Men', author: 'Reginald Rose', note: 'Play and film on persuasion, bias, and group dynamics.' },
  ],
};

/** Marker colour and icon name for each module, written out so the build keeps the classes. */
export const MODULE_STYLE: Record<string, { bg: string; soft: string; text: string; border: string; fill: string; stroke: string; ring: string; icon: 'ClipboardList' | 'Megaphone' | 'Mic' | 'Camera' | 'Scale' }> = {
  m1: { bg: 'bg-mod1', soft: 'bg-mod1/10', text: 'text-mod1', border: 'border-mod1', fill: 'fill-mod1', stroke: 'stroke-mod1', ring: 'ring-mod1', icon: 'ClipboardList' },
  m2: { bg: 'bg-mod2', soft: 'bg-mod2/10', text: 'text-mod2', border: 'border-mod2', fill: 'fill-mod2', stroke: 'stroke-mod2', ring: 'ring-mod2', icon: 'Megaphone' },
  m3: { bg: 'bg-mod3', soft: 'bg-mod3/10', text: 'text-mod3', border: 'border-mod3', fill: 'fill-mod3', stroke: 'stroke-mod3', ring: 'ring-mod3', icon: 'Mic' },
  m4: { bg: 'bg-mod4', soft: 'bg-mod4/10', text: 'text-mod4', border: 'border-mod4', fill: 'fill-mod4', stroke: 'stroke-mod4', ring: 'ring-mod4', icon: 'Camera' },
  m5: { bg: 'bg-mod5', soft: 'bg-mod5/10', text: 'text-mod5', border: 'border-mod5', fill: 'fill-mod5', stroke: 'stroke-mod5', ring: 'ring-mod5', icon: 'Scale' },
};
