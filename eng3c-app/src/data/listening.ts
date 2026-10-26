export type ListenSkill = 'Tone' | 'Audience' | 'Device' | 'Main idea' | 'Bias' | 'Purpose' | 'Evidence' | 'Structure';

export interface Checkpoint {
  skill: ListenSkill;
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface ListenSegment {
  text: string;
  checkpoint?: Checkpoint;
}

export interface ListenPiece {
  id: string;
  title: string;
  kind: string;
  speaker: string;
  summary: string;
  segments: ListenSegment[];
}

export const LISTEN_PIECES: ListenPiece[] = [
  {
    id: 'lookup',
    title: 'One Word',
    kind: 'Radio PSA',
    speaker: 'Narrator',
    summary: 'A 60-second public service announcement about distracted driving.',
    segments: [
      { text: 'This is Jaylen. Jaylen is seventeen. He has his licence, a part-time job at the hardware store, and a phone that buzzes about two hundred times a day.' },
      {
        text: 'Last spring, on a straight, dry road, in broad daylight, Jaylen looked down to read one message. It said: k.',
        checkpoint: {
          skill: 'Tone',
          q: 'What is the tone so far?',
          options: ['Upbeat and comic', 'Calm, with quiet, building tension', 'Angry and accusing', 'Sarcastic'],
          answer: 1,
          why: 'Short, plain sentences and ordinary details set up something about to go wrong.',
        },
      },
      {
        text: 'At eighty kilometres an hour, looking down for five seconds means travelling more than a hundred metres without seeing the road. That is the length of a football field, driven blind.',
        checkpoint: {
          skill: 'Device',
          q: 'Which appeal does this section mainly use?',
          options: ['Ethos', 'Pathos', 'Logos', 'Bandwagon'],
          answer: 2,
          why: 'Speed, time, and distance: a logical calculation made concrete with the football-field comparison.',
        },
      },
      {
        text: 'Jaylen walked away. The cyclist he hit spent four months learning to walk again.',
        checkpoint: {
          skill: 'Structure',
          q: 'Why does the narrator reveal the cyclist only now?',
          options: ['To save time', 'To shock listeners at the moment of highest tension', 'Because the cyclist is not important', 'To introduce a new topic'],
          answer: 1,
          why: 'Delaying the consequence makes it hit harder (pathos).',
        },
      },
      {
        text: 'One word. One second. One choice. Put the phone in the glovebox before you turn the key. The message can wait. Someone’s life cannot.',
        checkpoint: {
          skill: 'Audience',
          q: 'Who is the main target audience?',
          options: ['Cyclists', 'Teen and new drivers', 'Police officers', 'Car manufacturers'],
          answer: 1,
          why: 'A seventeen-year-old main character, phones, and a licence: it speaks to young drivers.',
        },
      },
    ],
  },
  {
    id: 'fashion',
    title: 'The Seven-Dollar T-Shirt',
    kind: 'Audio editorial',
    speaker: 'Commentator',
    summary: 'A persuasive commentary on fast fashion. Listen for the argument, the evidence, and what is left out.',
    segments: [
      { text: 'Last weekend I bought a T-shirt for seven dollars. It was soft, it fit, and it was the colour of the season. I felt pretty good about it, right up until I started doing the math.' },
      {
        text: 'Think about everything that has to happen for a shirt to cost seven dollars. Someone grows the cotton. Someone spins it, dyes it, cuts it, sews it, packs it, and ships it halfway around the world. Then a store pays rent, staff, and advertising, and still makes a profit. Something in that chain is not being paid for.',
        checkpoint: {
          skill: 'Main idea',
          q: 'What is the speaker’s main argument so far?',
          options: ['T-shirts are too expensive', 'A very low price hides costs that someone else pays', 'Stores should stop advertising', 'Cotton is hard to grow'],
          answer: 1,
          why: 'The long list of steps sets up the claim that the price cannot cover them all.',
        },
      },
      {
        text: 'Often, it is the workers. In 2013, the Rana Plaza factory building in Bangladesh collapsed, killing more than eleven hundred garment workers. Cracks had been found in the walls the day before. Workers were told to go back in anyway.',
        checkpoint: {
          skill: 'Evidence',
          q: 'What kind of evidence is this?',
          options: ['A personal opinion', 'A real historical example with a statistic', 'An expert quotation', 'A hypothetical story'],
          answer: 1,
          why: 'A documented event with a death toll: logos and pathos together.',
        },
      },
      {
        text: 'And sometimes it is the planet. Dyeing and finishing fabric is a major source of water pollution, and many garments are worn only a handful of times before they are thrown away.',
        checkpoint: {
          skill: 'Tone',
          q: 'How would you describe the speaker’s tone?',
          options: ['Neutral and detached', 'Concerned and persuasive', 'Joking', 'Bored'],
          answer: 1,
          why: 'Word choice ("told to go back in anyway") and the personal opening show concern and intent to persuade.',
        },
      },
      {
        text: 'Now, I am not saying never buy anything new. Not everyone can afford forty-dollar shirts, and shaming people for being on a budget helps no one.',
        checkpoint: {
          skill: 'Structure',
          q: 'What is the speaker doing here?',
          options: ['Changing the subject', 'Conceding a fair counter-argument', 'Using a slippery slope', 'Ending the editorial'],
          answer: 1,
          why: 'Admitting a valid point builds credibility (ethos) before the call to action.',
        },
      },
      {
        text: 'But we can buy less, and buy better. Wear what you own thirty times before you replace it. Shop second-hand. Ask brands who made your clothes, and keep asking until they answer. The cheapest shirt in the store should not cost someone their life.',
        checkpoint: {
          skill: 'Bias',
          q: 'Which perspective is missing from this editorial?',
          options: ['The shopper’s', 'Garment workers who depend on these jobs for income', 'The speaker’s', 'Nobody’s'],
          answer: 1,
          why: 'Workers are discussed but never heard from. Some might fear boycotts would cost them their jobs.',
        },
      },
    ],
  },
  {
    id: 'campaign',
    title: 'Vote Priya',
    kind: 'Student council speech',
    speaker: 'Candidate',
    summary: 'A 2-minute campaign speech. Track the appeals, the structure, and one sneaky fallacy.',
    segments: [
      {
        text: 'Good morning, Northview! My name is Priya Shah, and for the past two years, I have been the person behind the snack table at every dance, every games night, and every spirit week. I have counted your change, I have heard your complaints, and believe me, I have heard a lot of them.',
        checkpoint: {
          skill: 'Device',
          q: 'What is Priya mainly building in her opening?',
          options: ['Logos', 'Ethos', 'A straw man', 'Fear'],
          answer: 1,
          why: 'Experience and a friendly connection make her credible and likeable.',
        },
      },
      {
        text: 'So let me ask you: when was the last time student council actually changed something you care about?',
        checkpoint: {
          skill: 'Device',
          q: 'Which device is this?',
          options: ['Hyperbole', 'Rhetorical question', 'Tricolon', 'Statistic'],
          answer: 1,
          why: 'She does not expect an answer; she wants listeners to think "never".',
        },
      },
      {
        text: 'Here is my plan, and it has three parts. First, a working water-bottle station on every floor, not just the one by the gym. Second, a student-run tutoring hour every Thursday, free, in the library. Third, a suggestion box that actually gets opened, with answers posted every month.',
        checkpoint: {
          skill: 'Structure',
          q: 'What helps listeners follow this section?',
          options: ['Statistics', 'Signposting: "first, second, third"', 'Sound effects', 'Quotations'],
          answer: 1,
          why: 'Signposts tell listeners where they are in a list they cannot reread.',
        },
      },
      {
        text: 'My opponent says these ideas are too expensive. But I have already talked to the principal, and the water stations are covered by this year’s facilities budget.',
        checkpoint: {
          skill: 'Evidence',
          q: 'What is Priya doing here?',
          options: ['Attacking her opponent personally', 'Rebutting a counter-argument with evidence', 'Changing the subject', 'Conceding defeat'],
          answer: 1,
          why: 'She states the objection, then answers it with a specific fact.',
        },
      },
      {
        text: 'Everybody I have talked to is voting for change this year. Do not be the only one left behind.',
        checkpoint: {
          skill: 'Bias',
          q: 'Which fallacy does this line use?',
          options: ['Bandwagon', 'Post hoc', 'Circular reasoning', 'False authority'],
          answer: 0,
          why: '"Everybody is doing it" pressures listeners instead of giving a reason.',
        },
      },
      {
        text: 'On Friday, vote Priya Shah. Let’s stop complaining, and start changing. Thank you!',
        checkpoint: {
          skill: 'Purpose',
          q: 'Which techniques close the speech?',
          options: ['A statistic and a quotation', 'A call to action and a contrast ("stop complaining, start changing")', 'A rhetorical question and hyperbole', 'An apology'],
          answer: 1,
          why: 'An imperative plus a memorable contrast in parallel form.',
        },
      },
    ],
  },
  {
    id: 'smoke',
    title: 'Smoke Advisory',
    kind: 'TV news segment',
    speaker: 'News anchor',
    summary: 'A short news report. Compare its tone with the editorial.',
    segments: [
      {
        text: 'Good evening. Weather officials have issued a special air quality statement for much of southern Ontario tonight, as smoke from distant forest fires drifts south.',
        checkpoint: {
          skill: 'Tone',
          q: 'What is the tone of this opening?',
          options: ['Neutral and informative', 'Panicked', 'Humorous', 'Persuasive'],
          answer: 0,
          why: 'Plain statements of who, what, and where, with no loaded words.',
        },
      },
      {
        text: 'The Air Quality Health Index is expected to reach 8 to 10, which is considered high risk, by tomorrow afternoon.',
        checkpoint: {
          skill: 'Purpose',
          q: 'Why include the index number?',
          options: ['To sound scientific', 'To give a measurable, checkable level of risk', 'To scare viewers', 'To fill time'],
          answer: 1,
          why: 'A specific number on a known scale lets viewers judge the risk themselves.',
        },
      },
      { text: 'Health officials advise children, older adults, and people with heart or lung conditions to limit time outdoors. Schools in the region say outdoor recess may be moved inside.' },
      {
        text: 'Conditions are expected to improve on Thursday as winds shift. We will have updates throughout the evening.',
        checkpoint: {
          skill: 'Main idea',
          q: 'What is the main idea of the segment?',
          options: ['Forest fires are getting worse every year', 'Smoke will make air quality high risk until Thursday, so vulnerable people should limit time outside', 'Schools are closing', 'The weather will be sunny'],
          answer: 1,
          why: 'The who, what, when, and advice are all in that summary.',
        },
      },
    ],
  },
];

export const LISTEN_BY_ID: Record<string, ListenPiece> = Object.fromEntries(LISTEN_PIECES.map((p) => [p.id, p]));
