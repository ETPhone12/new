import type { StrandId } from '../types';

export interface McItem {
  type: 'mc';
  prompt: string;
  quote?: string;
  options: string[];
  answer: number;
  why: string;
}

export interface TapItem {
  type: 'tap';
  prompt: string;
  sentence: string;
  /** The phrase inside `sentence` that counts as correct. */
  target: string;
  followUp: { q: string; options: string[]; answer: number };
  why: string;
}

export type DrillItem = McItem | TapItem;

export interface DrillSet {
  id: string;
  title: string;
  strand: StrandId;
  blurb: string;
  context?: { title: string; text: string };
  items: DrillItem[];
}

const FN = ['Addition', 'Contrast', 'Cause and effect', 'Sequence', 'Example', 'Similarity', 'Conclusion'];
const fn = (correct: string, others: string[]) => {
  const options = [correct, ...others].slice(0, 4);
  // fixed shuffle so the answer is not always first
  const order = [2, 0, 3, 1];
  const shuffled = order.map((i) => options[i]);
  return { q: 'What job does it do?', options: shuffled, answer: shuffled.indexOf(correct) };
};

const CONV = ['Comma splice', 'Run-on', 'Fragment', 'Subject–verb agreement', 'Apostrophe error', 'Wrong homophone'];
const conv = (correct: string, prompt: string, why: string): McItem => {
  const others = CONV.filter((c) => c !== correct);
  const pick = [others[0], others[2], others[4]];
  const options = [pick[0], correct, pick[1], pick[2]];
  if (prompt.length % 2 === 0) options.reverse();
  return { type: 'mc', prompt: 'What is the error?', quote: prompt, options, answer: options.indexOf(correct), why };
};

export const DRILL_SETS: DrillSet[] = [
  {
    id: 'transitions',
    title: 'Transition Taps',
    strand: 'B',
    blurb: 'Tap the transition word or phrase, then name its job.',
    items: [
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'The trial was short. However, the results surprised everyone.', target: 'However', followUp: fn('Contrast', ['Addition', 'Sequence', 'Example']), why: '"However" signals a turn against what came before.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'First, unplug the printer from the wall.', target: 'First', followUp: fn('Sequence', ['Contrast', 'Conclusion', 'Similarity']), why: '"First" orders the steps.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'Many students work part-time; consequently, they have less time for homework.', target: 'consequently', followUp: fn('Cause and effect', ['Example', 'Addition', 'Contrast']), why: '"Consequently" shows a result.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'Ontario has a staggering number of lakes. For example, Algonquin Park alone holds more than two thousand.', target: 'For example', followUp: fn('Example', ['Conclusion', 'Contrast', 'Sequence']), why: '"For example" introduces a specific case.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'The coach was strict. Similarly, the team captain demanded extra drills.', target: 'Similarly', followUp: fn('Similarity', ['Cause and effect', 'Contrast', 'Addition']), why: '"Similarly" links two alike ideas.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'The bridge was old and rusted. As a result, the city closed it to trucks.', target: 'As a result', followUp: fn('Cause and effect', ['Similarity', 'Example', 'Sequence']), why: '"As a result" shows a consequence.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'Bus passes are cheaper for students. In addition, they include free weekend transfers.', target: 'In addition', followUp: fn('Addition', ['Contrast', 'Conclusion', 'Cause and effect']), why: '"In addition" adds another point in the same direction.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'Although the forecast called for rain, the game went ahead.', target: 'Although', followUp: fn('Contrast', ['Cause and effect', 'Example', 'Addition']), why: '"Although" sets up a contrast between expectation and result.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'Finally, sign the form and return it to the main office.', target: 'Finally', followUp: fn('Sequence', ['Example', 'Similarity', 'Contrast']), why: '"Finally" marks the last step.' },
      { type: 'tap', prompt: 'Tap the transition.', sentence: 'In conclusion, the evidence supports a later start to the school day.', target: 'In conclusion', followUp: fn('Conclusion', ['Addition', 'Sequence', 'Example']), why: '"In conclusion" signals the wrap-up.' },
    ],
  },
  {
    id: 'context',
    title: 'Context Clue Decoder',
    strand: 'B',
    blurb: 'Work out unfamiliar or technical words from the words around them.',
    items: [
      { type: 'mc', prompt: 'What is a multimeter?', quote: 'The technician used a multimeter, a tool that measures voltage, current, and resistance, to test the circuit.', options: ['A tool that measures electrical values', 'A type of ruler', 'A circuit breaker', 'A battery charger'], answer: 0, why: 'Definition clue: the phrase after the comma defines the word.' },
      { type: 'mc', prompt: 'What does "gregarious" mean?', quote: 'Unlike his gregarious brother, who chatted with everyone at the party, Sam stood quietly in the corner.', options: ['Shy', 'Sociable and outgoing', 'Angry', 'Tall'], answer: 1, why: 'Contrast clue: "unlike" sets the brother against quiet Sam, and "chatted with everyone" explains it.' },
      { type: 'mc', prompt: 'What is "detritus"?', quote: 'Before the inspection, the crew had to remove all detritus (loose gravel, broken wood, and scrap metal) from the site.', options: ['Expensive equipment', 'Paperwork', 'Debris and waste material', 'Workers'], answer: 2, why: 'Example clue: the list inside the brackets shows what detritus is.' },
      { type: 'mc', prompt: 'What does "ambiguous" mean?', quote: 'The new policy was ambiguous; half the staff thought it applied to them and half did not.', options: ['Strict', 'Unclear, open to more than one reading', 'Popular', 'Brand new'], answer: 1, why: 'Explanation clue: the second half shows people reading it two ways.' },
      { type: 'mc', prompt: 'What does "drowsiness" mean?', quote: 'The medication can cause drowsiness, so do not drive or operate heavy machinery.', options: ['Sleepiness', 'Hunger', 'Excitement', 'Pain'], answer: 0, why: 'Cause and effect clue: the warning not to drive suggests it makes you sleepy.' },
      { type: 'mc', prompt: 'What does "meagre" mean?', quote: 'The bakery’s profits were meagre, barely enough to pay the rent.', options: ['Large', 'Steady', 'Small and insufficient', 'Secret'], answer: 2, why: '"Barely enough" explains it.' },
      { type: 'mc', prompt: 'What does "frivolous" mean?', quote: 'Sound the alarm only in a real emergency; frivolous use wastes the fire department’s time.', options: ['Serious', 'Unnecessary, not serious', 'Loud', 'Expensive'], answer: 1, why: 'Contrast clue: frivolous use is set against a real emergency.' },
      { type: 'mc', prompt: 'What does "PPE" stand for here?', quote: 'Before entering the shop, put on your PPE: safety glasses, steel-toed boots, and hearing protection.', options: ['Point, Proof, Explanation', 'Personal protective equipment', 'Part-time paid employment', 'Power plant engineering'], answer: 1, why: 'Example clue: the list after the colon shows protective gear. Context changes what an acronym means.' },
    ],
  },
  {
    id: 'rhetoric',
    title: 'Appeals & Devices',
    strand: 'B',
    blurb: 'Name the persuasive move in each line.',
    items: [
      { type: 'mc', prompt: 'Which appeal or device?', quote: '"Four out of five drivers who text admit to drifting out of their lane."', options: ['Pathos', 'Logos', 'Ethos', 'Hyperbole'], answer: 1, why: 'A statistic appeals to logic.' },
      { type: 'mc', prompt: 'Which appeal or device?', quote: '"I’ve coached this team for twenty years, and I have never seen a group this determined."', options: ['Ethos', 'Logos', 'Call to action', 'Juxtaposition'], answer: 0, why: 'Twenty years of experience builds credibility.' },
      { type: 'mc', prompt: 'Which appeal or device?', quote: '"Imagine your little sister waiting by the window for a car that never comes home."', options: ['Logos', 'Tricolon', 'Pathos', 'Ethos'], answer: 2, why: 'A vivid image aimed at fear and grief.' },
      { type: 'mc', prompt: 'Which appeal or device?', quote: '"How many more warnings do we need before we act?"', options: ['Hyperbole', 'Rhetorical question', 'Ethos', 'Juxtaposition'], answer: 1, why: 'Asked for effect; the answer is implied.' },
      { type: 'mc', prompt: 'Which device?', quote: '"We will not wait. We will not whisper. We will not back down."', options: ['Anaphora', 'Understatement', 'Logos', 'Ad hominem'], answer: 0, why: 'Each clause opens with "We will not".' },
      { type: 'mc', prompt: 'Which device?', quote: '"This backpack weighs a thousand pounds!"', options: ['Logos', 'Hyperbole', 'Ethos', 'Rhetorical question'], answer: 1, why: 'Deliberate exaggeration.' },
      { type: 'mc', prompt: 'Which device?', quote: '"Sign the petition today at the front office."', options: ['Call to action', 'Juxtaposition', 'Anaphora', 'Pathos'], answer: 0, why: 'An imperative telling the audience what to do.' },
      { type: 'mc', prompt: 'Which device?', quote: '"They have new arenas; we have mould in our classrooms."', options: ['Tricolon', 'Juxtaposition', 'Logos', 'Ethos'], answer: 1, why: 'Two contrasting images side by side.' },
      { type: 'mc', prompt: 'Which device?', quote: '"Together, we can make this the safest school in the district."', options: ['Hyperbole', 'Inclusive language', 'Logos', 'Rhetorical question'], answer: 1, why: '"We" and "together" put the speaker and audience on one team.' },
      { type: 'mc', prompt: 'Which device?', quote: '"Fast. Cheap. Reliable. Take the bus."', options: ['Tricolon', 'Ethos', 'Juxtaposition', 'Understatement'], answer: 0, why: 'Three parallel words.' },
    ],
  },
  {
    id: 'fallacies',
    title: 'Fallacy Finder',
    strand: 'B',
    blurb: 'Spot the flaw in the reasoning.',
    items: [
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"Everyone at school has the new phone, so you need one too."', options: ['Straw man', 'Bandwagon', 'Red herring', 'Post hoc'], answer: 1, why: 'Popularity is not proof.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"My cousin got sick after eating sushi once, so sushi is dangerous."', options: ['Hasty generalization', 'Ad hominem', 'False dilemma', 'Circular reasoning'], answer: 0, why: 'One case cannot support a rule.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"If we allow hats in class, next it’ll be pyjamas, and soon no one will learn anything."', options: ['Bandwagon', 'Red herring', 'Slippery slope', 'False authority'], answer: 2, why: 'An unproven chain of consequences.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"You’re either with us or against us."', options: ['False dilemma', 'Post hoc', 'Straw man', 'Hasty generalization'], answer: 0, why: 'Only two options are offered when more exist.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"Why listen to his argument about taxes? He failed math in high school."', options: ['Circular reasoning', 'Ad hominem', 'Bandwagon', 'Slippery slope'], answer: 1, why: 'It attacks the person, not the argument.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: 'After a trustee proposes trimming the sports budget by 5%: "She wants to destroy school sports and make kids unhealthy."', options: ['Straw man', 'False authority', 'Post hoc', 'Red herring'], answer: 0, why: 'A 5% trim is twisted into "destroy".' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"A famous actor says this vitamin cures colds, so it must work."', options: ['Hasty generalization', 'Slippery slope', 'False authority', 'Bandwagon'], answer: 2, why: 'An actor is not a medical expert.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: 'Asked about the low recycling rate: "Why worry about recycling when the parking lot has potholes?"', options: ['Red herring', 'Ad hominem', 'False dilemma', 'Circular reasoning'], answer: 0, why: 'It changes the subject.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"The rules are fair because they are the rules."', options: ['Post hoc', 'Circular reasoning', 'Straw man', 'Bandwagon'], answer: 1, why: 'The conclusion is used as its own evidence.' },
      { type: 'mc', prompt: 'Name the fallacy.', quote: '"I wore my lucky socks and we won. The socks caused the win."', options: ['False authority', 'Ad hominem', 'Post hoc', 'False dilemma'], answer: 2, why: 'Coming before is not the same as causing.' },
    ],
  },
  {
    id: 'lateral',
    title: 'Lateral Reading Scenarios',
    strand: 'D',
    blurb: 'Choose the move a professional fact-checker would make.',
    items: [
      { type: 'mc', prompt: 'What should you do first?', quote: 'A video with 2 million views claims a new law bans winter tires in Ontario.', options: ['Share it to warn your friends', 'Search the claim on trusted news sites or the Ontario government site', 'Read the comments to see if people agree', 'Trust it because so many people watched it'], answer: 1, why: 'Views measure attention, not accuracy. Check the claim outside the video.' },
      { type: 'mc', prompt: 'What is the biggest red flag?', quote: 'A website called "Canadian Health Facts" says a supplement cures anxiety. The site sells the supplement.', options: ['The site has a Canadian name', 'The site profits from the claim it makes', 'The article is long', 'It uses the word "anxiety"'], answer: 1, why: 'A conflict of interest. Look for independent medical sources.' },
      { type: 'mc', prompt: 'Fastest way to check?', quote: 'A dramatic photo of a flooded highway is labelled "Toronto this morning."', options: ['Zoom in on the photo', 'Count the shares', 'Do a reverse image search', 'Ask the poster'], answer: 2, why: 'It reveals whether the image appeared earlier, somewhere else.' },
      { type: 'mc', prompt: 'What should you do?', quote: 'A post quotes a scientist saying "climate change is a hoax." There is no link.', options: ['Trace the quote to its original source and context', 'Assume it is real because it is in quotation marks', 'Repost it with a question mark', 'Ignore all science posts'], answer: 0, why: 'Quotes are often invented or cut out of context.' },
      { type: 'mc', prompt: 'Best next move?', quote: 'An article on a site you have never heard of looks professional and is full of charts.', options: ['Read every page of the site closely', 'Leave the site and search what others say about the publisher', 'Trust it because the charts look official', 'Check whether the site uses https'], answer: 1, why: 'Lateral reading: learn about a source from outside it. Design is easy to fake.' },
      { type: 'mc', prompt: 'What is probably happening?', quote: 'Your feed is full of posts agreeing with your opinion on a school issue. You rarely see the other side.', options: ['Everyone agrees with you', 'Your feed may be a filter bubble built from what you engage with', 'The other side has stopped posting', 'The app is broken'], answer: 1, why: 'Algorithms show you more of what you already like. Seek out credible opposing views.' },
    ],
  },
  {
    id: 'citations',
    title: 'Citation Check',
    strand: 'C',
    blurb: 'MLA 9 and APA 7 basics.',
    items: [
      { type: 'mc', prompt: 'Correct MLA in-text citation for page 112 of a book by Richard Wagamese?', options: ['(Wagamese, p. 112)', '(Wagamese 112)', '(112 Wagamese)', '(Wagamese, 2012, p. 112)'], answer: 1, why: 'MLA: author and page, no comma, no "p.".' },
      { type: 'mc', prompt: 'Which is a correct MLA 9 Works Cited entry? (Titles would be italicized.)', options: ['Dimaline, Cherie. The Marrow Thieves. Cormorant Books, 2017.', 'Cherie Dimaline, The Marrow Thieves, 2017, Cormorant.', 'Dimaline, C. (2017). The marrow thieves. Cormorant Books.', 'The Marrow Thieves by Cherie Dimaline (2017)'], answer: 0, why: 'Last name, First name. Title. Publisher, Year. Option C is APA style.' },
      { type: 'mc', prompt: 'Correct APA 7 in-text citation?', options: ['(Dimaline 45)', '(Dimaline, 2017, p. 45)', '(Cherie Dimaline, page 45)', '[Dimaline: 45]'], answer: 1, why: 'APA: author, year, and "p." with the page number.' },
      { type: 'mc', prompt: 'Which one needs a citation?', options: ['Your own opinion', 'Common knowledge, such as "Ottawa is Canada’s capital"', 'A paraphrased statistic from a news article', 'Your conclusion'], answer: 2, why: 'Paraphrased facts and ideas from a source must be credited.' },
      { type: 'mc', prompt: 'You cut words from the middle of a quotation. What do you use?', options: ['Square brackets', 'An ellipsis (...)', 'Italics', 'A dash'], answer: 1, why: 'An ellipsis shows removed words. Brackets show changed words.' },
      { type: 'mc', prompt: 'Where does the period go with an MLA parenthetical citation?', options: ['Before the quotation mark: "...home." (Okafor 45)', 'After the parentheses: "...home" (Okafor 45).', 'Inside the parentheses: "...home" (Okafor 45.)', 'No period is needed'], answer: 1, why: 'Close the quotation, add the citation, then the period.' },
    ],
  },
  {
    id: 'conventions',
    title: 'Conventions Clinic',
    strand: 'C',
    blurb: 'Diagnose the sentence error.',
    items: [
      conv('Comma splice', 'The store was closed, we went to the mall instead.', 'Two complete sentences joined only by a comma.'),
      conv('Fragment', 'Because the deadline was moved.', 'A dependent clause on its own has no main clause.'),
      conv('Subject–verb agreement', 'The list of supplies are on the table.', 'The subject is "list" (singular), so the verb is "is".'),
      conv('Apostrophe error', 'Its going to rain tomorrow.', '"It’s" means "it is".'),
      conv('Wrong homophone', 'The students forgot there textbooks.', '"Their" shows possession.'),
      conv('Run-on', 'I finished my shift I went straight to bed.', 'Two sentences with no punctuation between them.'),
      conv('Subject–verb agreement', 'Each of the players have a locker.', '"Each" is singular, so the verb is "has".'),
      conv('Apostrophe error', 'The dog wagged it’s tail.', 'The possessive "its" has no apostrophe.'),
    ],
  },
  {
    id: 'narrative',
    title: 'Short Story: "Last Ferry"',
    strand: 'B',
    blurb: 'Point of view, conflict, inference, and theme in an original short story.',
    context: {
      title: 'Last Ferry',
      text:
        'Mara had promised her grandfather she would be on the last ferry, the 9:40, and she had never once broken a promise to him. The wind off the lake was already pushing whitecaps against the dock when she reached the terminal at 9:38, breathless, her phone dead in her pocket.\n\nThe ticket window was dark. A handwritten sign was taped to the glass: CANCELLED — WEATHER.\n\nShe stared at it. Across the water, the island was a smudge of lights, and somewhere among them her grandfather was sitting by the window with the kettle on, the way he had every Friday since her grandmother died. He would not call anyone. He never did. He would simply wait, and when she did not come, he would decide that she, like everyone else, had found something better to do.\n\nA man in an orange vest was coiling rope at the end of the pier. "Anyone going across tonight?" she called.\n\nHe laughed without looking up. "Not unless you can swim four kilometres."\n\nMara looked at the small aluminum boats tied along the dock, their hulls knocking together in the swell. She looked at the sign. Then she walked to the payphone by the vending machines, fished a toonie from her jacket, and dialled the only number on the island she knew by heart.',
    },
    items: [
      { type: 'mc', prompt: 'What point of view is the story told from?', options: ['First person', 'Third person limited (Mara)', 'Third person omniscient', 'Second person'], answer: 1, why: 'An outside narrator ("she") who knows only Mara’s thoughts.' },
      { type: 'mc', prompt: 'What is the main conflict?', options: ['Mara vs. the man in the vest', 'Person vs. nature, which creates an inner conflict about her promise', 'Mara vs. technology', 'Mara vs. her grandmother'], answer: 1, why: 'The storm cancels the ferry, and that tests her promise.' },
      { type: 'mc', prompt: 'Why does the writer include the small boats "knocking together in the swell"?', options: ['To describe the harbour’s colours', 'To hint that Mara is tempted to take a boat herself, a dangerous choice', 'To show the boats are new', 'To fill space'], answer: 1, why: 'It raises tension. She looks at the boats, then at the sign, weighing a risky option.' },
      { type: 'mc', prompt: 'What can you infer about the grandfather?', quote: '"He would decide that she, like everyone else, had found something better to do."', options: ['He is angry with Mara', 'He feels lonely and forgotten since his wife died', 'He dislikes ferries', 'He is very busy'], answer: 1, why: '"Like everyone else" implies others have stopped visiting.' },
      { type: 'mc', prompt: 'Which is the best theme statement?', options: ['Ferries are unreliable.', 'Weather is dangerous.', 'Keeping faith with someone who depends on you can mean finding another way.', 'Phones should always be charged.'], answer: 2, why: 'A complete idea about life, supported by her choice at the end.' },
      { type: 'mc', prompt: 'Which moment is the turning point?', options: ['Mara arriving at 9:38', 'Reading the CANCELLED sign', 'Mara choosing the payphone over the boats', 'The man laughing'], answer: 2, why: 'Her decision resolves the tension between risk and responsibility.' },
    ],
  },
];

export const DRILL_BY_ID: Record<string, DrillSet> = Object.fromEntries(DRILL_SETS.map((d) => [d.id, d]));

export const TRANSITION_FUNCTIONS = FN;

/** A mock workplace bulletin used for the text-features drill. */
export const FEATURE_PROMPTS: { id: string; label: string; purpose: string }[] = [
  { id: 'title', label: 'the title', purpose: 'Names the topic so readers can decide in one glance whether it matters to them.' },
  { id: 'subheading', label: 'a subheading', purpose: 'Breaks the text into chunks so readers can scan for the part they need.' },
  { id: 'list', label: 'the bulleted list', purpose: 'Presents parallel items so they are quick to read and check off.' },
  { id: 'callout', label: 'the callout box', purpose: 'Pulls a warning or key fact out of the body so nobody misses it.' },
  { id: 'caption', label: 'the caption', purpose: 'Explains what the image shows and why it matters.' },
  { id: 'bold', label: 'a bolded key term', purpose: 'Flags vocabulary the reader must know.' },
  { id: 'source', label: 'the source note', purpose: 'Tells readers where the information came from, so they can judge or check it.' },
];
