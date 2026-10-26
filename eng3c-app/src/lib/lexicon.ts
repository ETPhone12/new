/** Word lists shared by the writing checkers. All lowercase. */

export const BE_VERBS = ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "isn't", "aren't", "wasn't", "weren't"];

export const IRREGULAR_PARTICIPLES = [
  'awoken', 'been', 'beaten', 'become', 'begun', 'bent', 'bet', 'bitten', 'blown', 'broken', 'brought', 'built', 'burnt',
  'bought', 'caught', 'chosen', 'come', 'cost', 'cut', 'dealt', 'done', 'drawn', 'driven', 'drunk', 'eaten', 'fallen',
  'fed', 'felt', 'fought', 'found', 'flown', 'forbidden', 'forgotten', 'forgiven', 'frozen', 'given', 'gone', 'grown',
  'hung', 'heard', 'hidden', 'hit', 'held', 'hurt', 'kept', 'known', 'laid', 'led', 'left', 'lent', 'let', 'lain', 'lit',
  'lost', 'made', 'meant', 'met', 'paid', 'put', 'quit', 'read', 'ridden', 'rung', 'risen', 'run', 'said', 'seen', 'sought',
  'sold', 'sent', 'set', 'shaken', 'shed', 'shot', 'shown', 'shut', 'sung', 'sunk', 'sat', 'slept', 'slid', 'spoken',
  'spent', 'spun', 'split', 'spread', 'stolen', 'stuck', 'stung', 'struck', 'sworn', 'swept', 'swum', 'taken', 'taught',
  'torn', 'told', 'thought', 'thrown', 'understood', 'woken', 'worn', 'won', 'written', 'withdrawn', 'overseen', 'undertaken',
];

/** -ed words that usually act as adjectives after "be" ("is tired"), so they are not flagged as passive. */
export const ADJECTIVE_ED = [
  'tired', 'bored', 'excited', 'interested', 'worried', 'scared', 'married', 'surprised', 'confused', 'concerned',
  'pleased', 'satisfied', 'disappointed', 'embarrassed', 'frustrated', 'amazed', 'annoyed', 'relaxed', 'stressed',
  'exhausted', 'qualified', 'experienced', 'supposed', 'used', 'involved', 'located', 'based', 'prepared', 'required',
  'allowed', 'needed', 'red', 'bed', 'shed', 'sacred', 'naked', 'wicked', 'crooked', 'beloved', 'aged', 'ragged',
  'skilled', 'talented', 'advanced', 'detailed', 'limited', 'complicated', 'sophisticated', 'dedicated', 'motivated',
  'balanced', 'educated', 'informed', 'organized', 'organised', 'focused', 'connected', 'related', 'determined', 'closed',
  'opened', 'finished', 'done', 'gone', 'lost', 'hurt', 'upset', 'set',
];

export const WORDY: [string, string][] = [
  ['due to the fact that', 'because'],
  ['owing to the fact that', 'because'],
  ['in light of the fact that', 'because'],
  ['despite the fact that', 'although'],
  ['in spite of the fact that', 'although'],
  ['the fact that', 'that (or rephrase)'],
  ['in order to', 'to'],
  ['so as to', 'to'],
  ['at this point in time', 'now'],
  ['at the present time', 'now'],
  ['at this moment in time', 'now'],
  ['in this day and age', 'today'],
  ['in today’s society', 'today'],
  ["in today's society", 'today'],
  ['in the event that', 'if'],
  ['in the near future', 'soon'],
  ['for the purpose of', 'for / to'],
  ['with regard to', 'about'],
  ['with regards to', 'about'],
  ['in regard to', 'about'],
  ['in reference to', 'about'],
  ['in terms of', 'for / in'],
  ['has the ability to', 'can'],
  ['have the ability to', 'can'],
  ['is able to', 'can'],
  ['are able to', 'can'],
  ['a large number of', 'many'],
  ['a great deal of', 'much'],
  ['a majority of', 'most'],
  ['the majority of', 'most'],
  ['each and every', 'each'],
  ['first and foremost', 'first'],
  ['basic fundamentals', 'fundamentals'],
  ['end result', 'result'],
  ['final outcome', 'outcome'],
  ['past history', 'history'],
  ['future plans', 'plans'],
  ['completely finished', 'finished'],
  ['absolutely essential', 'essential'],
  ['advance planning', 'planning'],
  ['close proximity', 'near'],
  ['repeat again', 'repeat'],
  ['revert back', 'revert'],
  ['refer back', 'refer'],
  ['free gift', 'gift'],
  ['until such time as', 'until'],
  ['in close proximity to', 'near'],
  ['make a decision', 'decide'],
  ['come to a conclusion', 'conclude'],
  ['give consideration to', 'consider'],
  ['take into consideration', 'consider'],
  ['conduct an investigation', 'investigate'],
  ['provide assistance', 'help'],
  ['make an attempt', 'try'],
  ['is in need of', 'needs'],
  ['are in need of', 'need'],
  ['it is important to note that', '(cut it)'],
  ['it should be noted that', '(cut it)'],
  ['it goes without saying that', '(cut it)'],
  ['needless to say', '(cut it)'],
  ['all things considered', '(cut it)'],
  ['as a matter of fact', 'in fact'],
  ['at all times', 'always'],
  ['on a daily basis', 'daily'],
  ['on a regular basis', 'regularly'],
  ['in a timely manner', 'promptly'],
  ['along the lines of', 'like'],
  ['there is no doubt that', '(cut it)'],
  ['what this means is that', '(cut it)'],
  ['the reason why is because', 'because'],
  ['the reason is because', 'because'],
  ['in my own personal opinion', 'I think (or cut it)'],
  ['each individual', 'each'],
  ['totally unique', 'unique'],
  ['very unique', 'unique'],
];

export const SLANG: [string, string][] = [
  ['gonna', 'going to'],
  ['wanna', 'want to'],
  ['gotta', 'have to / must'],
  ['kinda', 'somewhat'],
  ['sorta', 'somewhat'],
  ['lots of', 'many / much'],
  ['a lot of', 'many / much'],
  ['a lot', 'often / greatly'],
  ['stuff', 'a specific noun'],
  ['things', 'a specific noun'],
  ['thing', 'a specific noun'],
  ['awesome', 'a precise adjective'],
  ['cool', 'a precise adjective'],
  ['super', 'very / a precise adjective'],
  ['totally', '(cut it)'],
  ['literally', '(cut it unless literal)'],
  ['basically', '(cut it)'],
  ['like,', '(cut the filler)'],
  ['lol', '(cut it)'],
  ['omg', '(cut it)'],
  ['tbh', 'to be honest (or cut it)'],
  ['idk', 'I do not know'],
  ['u', 'you'],
  ['ur', 'your / you are'],
  ['ok', 'acceptable'],
  ['okay', 'acceptable'],
  ['kids', 'children / students'],
  ['guys', 'people / everyone'],
  ['huge', 'significant'],
  ['crazy', 'surprising / extreme'],
  ['insane', 'extreme'],
  ['dude', '(cut it)'],
  ['nope', 'no'],
  ['yeah', 'yes'],
  ['sucks', 'is poor / fails'],
  ['legit', 'genuine / legitimate'],
  ['lowkey', 'somewhat'],
  ['highkey', 'clearly'],
  ['vibe', 'mood / atmosphere'],
  ['vibes', 'mood / atmosphere'],
  ['get', 'obtain / receive / become'],
  ['got', 'received / became'],
];

export const WEAK_INTENSIFIERS = ['very', 'really', 'extremely', 'incredibly', 'quite', 'rather', 'somewhat', 'fairly', 'pretty much', 'kind of', 'sort of', 'just'];

export const HEDGES = ['i think', 'i feel', 'i believe', 'in my opinion', 'i guess', 'it seems like', 'i would say', 'personally'];

export const CONTRACTIONS = /\b(?:\w+n't|\w+'re|\w+'ve|\w+'ll|\w+'d|i'm|it's|that's|there's|what's|let's|here's|who's)\b/gi;

export const FILLERS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'basically', 'actually', 'literally', 'right', 'kind of', 'sort of', 'i mean', 'okay so'];

export const PRONOUN_SUBJECTS = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those', 'there', 'my', 'his', 'her', 'their', 'our'];

export const SUBORDINATORS = ['if', 'when', 'whenever', 'because', 'although', 'though', 'since', 'while', 'after', 'before', 'as', 'unless', 'until', 'once', 'even', 'whether', 'wherever', 'where', 'however', 'therefore', 'also', 'in', 'on', 'at', 'for', 'by', 'with', 'during', 'without', 'despite', 'due', 'given', 'considering', 'owing', 'thanks', 'according', 'unlike', 'like', 'from', 'to', 'of', 'through', 'throughout', 'upon', 'under', 'over', 'between', 'among', 'regarding', 'following', 'compared', 'besides', 'instead', 'meanwhile', 'still', 'yes', 'no', 'well', 'oh', 'now', 'today', 'yesterday', 'tomorrow', 'last', 'next', 'first', 'finally', 'then'];

export const IMPERATIVE_VERBS = [
  'add', 'adjust', 'align', 'allow', 'apply', 'arrange', 'assemble', 'attach', 'avoid', 'bake', 'begin', 'bend', 'blend',
  'boil', 'book', 'bring', 'brush', 'build', 'calculate', 'call', 'cancel', 'carry', 'center', 'centre', 'change', 'charge',
  'check', 'choose', 'chop', 'clean', 'clear', 'click', 'clip', 'close', 'collect', 'combine', 'compare', 'complete',
  'confirm', 'connect', 'continue', 'cook', 'cool', 'copy', 'count', 'cover', 'create', 'cut', 'decide', 'delete',
  'describe', 'dial', 'dice', 'dip', 'disconnect', 'dispose', 'divide', 'do', 'double-check', 'download', 'drag', 'drain',
  'draw', 'drill', 'drink', 'drive', 'drop', 'dry', 'email', 'empty', 'enable', 'enter', 'fasten', 'file', 'fill', 'find',
  'finish', 'fit', 'fix', 'flip', 'fold', 'follow', 'forward', 'freeze', 'fry', 'gather', 'get', 'give', 'glue', 'go',
  'grab', 'grate', 'grease', 'grip', 'hand', 'hang', 'heat', 'hold', 'identify', 'include', 'insert', 'install', 'inspect',
  'keep', 'knead', 'label', 'lay', 'leave', 'lift', 'line', 'list', 'locate', 'lock', 'log', 'look', 'loosen', 'lower',
  'make', 'mark', 'measure', 'melt', 'mix', 'mount', 'move', 'note', 'notify', 'open', 'order', 'organize', 'pack', 'paint',
  'paste', 'pause', 'peel', 'place', 'plug', 'point', 'position', 'pour', 'preheat', 'prepare', 'press', 'print', 'pull',
  'push', 'put', 'raise', 'read', 'record', 'reduce', 'refill', 'release', 'remove', 'repeat', 'replace', 'report',
  'restart', 'return', 'review', 'rinse', 'roll', 'rotate', 'run', 'sand', 'save', 'scan', 'scroll', 'seal', 'search',
  'secure', 'select', 'send', 'separate', 'serve', 'set', 'shake', 'share', 'shut', 'sign', 'simmer', 'sit', 'slice',
  'slide', 'soak', 'sort', 'spray', 'spread', 'squeeze', 'stack', 'stand', 'start', 'stir', 'stop', 'store', 'strain',
  'stretch', 'submit', 'swipe', 'switch', 'take', 'tap', 'tape', 'test', 'tie', 'tighten', 'toggle', 'touch', 'transfer',
  'trim', 'turn', 'twist', 'type', 'unlock', 'unplug', 'unscrew', 'update', 'upload', 'use', 'verify', 'wait', 'walk',
  'warm', 'wash', 'wear', 'weigh', 'whisk', 'wipe', 'wrap', 'write', 'zip', 'screw', 'water', 'plant', 'dig', 'sweep',
  'mop', 'vacuum', 'fold', 'iron', 'sew', 'thread', 'pin', 'staple', 'punch', 'scrub', 'soap', 'lather', 'charge', 'power',
  'reboot', 'pair', 'sync', 'tag', 'post', 'reply', 'attach', 'stamp', 'greet', 'ask', 'tell', 'explain', 'show', 'demonstrate',
  'contact', 'phone', 'text', 'invite', 'schedule', 'plan', 'outline', 'draft', 'edit', 'proofread', 'revise', 'sketch',
  'trace', 'fill', 'empty', 'flush', 'refrigerate', 'season', 'sprinkle', 'garnish', 'toast', 'grill', 'roast', 'steam',
  'microwave', 'stir-fry', 'drizzle', 'beat', 'crack', 'skim', 'shred', 'mash', 'wear', 'put', 'park', 'signal', 'merge',
];

export const VAGUE_INSTRUCTION: [RegExp, string][] = [
  [/\bhandle\b/i, 'Name the exact action (lift, grip, carry, sort...).'],
  [/\bdeal with\b/i, 'Name the exact action.'],
  [/\btake care of\b/i, 'Name the exact action.'],
  [/\bmake sure\b/i, 'Use "Check that" or "Confirm that" and say what to look for.'],
  [/\bensure\b/i, 'Say how to confirm it (what should the reader see or hear?).'],
  [/\bproperly\b/i, 'Replace "properly" with the standard: how far, how tight, which way.'],
  [/\bcorrectly\b/i, 'Describe what "correct" looks like.'],
  [/\bappropriate(ly)?\b/i, 'Name the specific setting, amount, or item.'],
  [/\bas needed\b/i, 'Give a rule for when it is needed.'],
  [/\buntil (?:ready|done|good|finished)\b/i, 'Describe the signal that means it is ready (colour, sound, time).'],
  [/\b(?:some|a bit|a little|a few|enough|several)\b/i, 'Give an exact amount.'],
  [/\b(?:a while|a few minutes|briefly|for a bit)\b/i, 'Give an exact time.'],
  [/\b(?:stuff|things?|etc\.?)\b/i, 'Name the items.'],
  [/\bfix\b/i, 'Say what the fix is.'],
  [/\b(?:carefully|gently|slowly)\b/i, 'Fine as a cue, but add the measurable part (speed, force, distance).'],
  [/\bnormal(ly)?\b/i, 'Describe the normal state so a first-time reader recognizes it.'],
  [/\b(?:it|this|that) (?:thing|part|piece)\b/i, 'Name the part.'],
];

export const MEASURE_VERBS = ['add', 'pour', 'wait', 'heat', 'bake', 'cook', 'boil', 'simmer', 'microwave', 'cut', 'tighten', 'set', 'measure', 'fill', 'mix', 'stir', 'soak', 'cool', 'charge', 'press', 'hold', 'rinse', 'water', 'turn'];

export const HAZARD_WORDS = ['knife', 'knives', 'blade', 'sharp', 'hot', 'boil', 'oven', 'stove', 'burner', 'flame', 'fire', 'chemical', 'bleach', 'ammonia', 'solvent', 'electrical', 'electric', 'outlet', 'wire', 'battery', 'ladder', 'saw', 'drill', 'grinder', 'glass', 'steam', 'grease', 'oil', 'gas', 'propane', 'scissors', 'box cutter', 'utility knife', 'microwave', 'kettle', 'iron', 'heavy', 'lift'];

/** Common tools and materials. A step that mentions one should have it in the materials list. */
export const MATERIAL_NOUNS = [
  'screwdriver', 'wrench', 'hammer', 'pliers', 'drill', 'bit', 'screw', 'screws', 'nail', 'nails', 'bolt', 'bolts', 'nut', 'nuts',
  'washer', 'tape', 'measuring tape', 'ruler', 'level', 'saw', 'knife', 'scissors', 'glue', 'sandpaper', 'paint', 'brush',
  'roller', 'gloves', 'goggles', 'mask', 'ladder', 'bucket', 'sponge', 'cloth', 'towel', 'rag', 'mop', 'broom', 'vacuum',
  'detergent', 'soap', 'bleach', 'cleaner', 'spray bottle', 'pot', 'pan', 'saucepan', 'frying pan', 'bowl', 'whisk',
  'spatula', 'spoon', 'fork', 'cup', 'measuring cup', 'measuring spoon', 'kettle', 'oven', 'stove', 'microwave', 'timer',
  'cutting board', 'baking sheet', 'tray', 'lid', 'strainer', 'colander', 'blender', 'toaster', 'flour', 'sugar', 'salt',
  'butter', 'oil', 'eggs', 'egg', 'milk', 'water', 'noodles', 'rice', 'charger', 'cable', 'adapter', 'battery', 'batteries',
  'laptop', 'phone', 'tablet', 'mouse', 'keyboard', 'monitor', 'printer', 'paper', 'stapler', 'pen', 'pencil', 'marker',
  'folder', 'envelope', 'stamp', 'label', 'labels', 'box', 'boxes', 'bag', 'bags', 'hose', 'shovel', 'rake', 'soil', 'seeds',
  'pot', 'fertilizer', 'helmet', 'lock', 'pump', 'tire', 'jack', 'oil filter', 'funnel', 'thermometer', 'scale', 'clipboard',
  'form', 'badge', 'apron', 'hairnet', 'sanitizer', 'tongs', 'ladle', 'grater', 'peeler', 'foil', 'plastic wrap', 'container',
];

export const ANALYSIS_WORDS = ['shows', 'show', 'suggests', 'suggest', 'reveals', 'reveal', 'proves', 'prove', 'demonstrates', 'demonstrate', 'implies', 'imply', 'highlights', 'highlight', 'means', 'mean', 'because', 'therefore', 'as a result', 'this matters', 'this is important', 'which', 'illustrates', 'illustrate', 'emphasizes', 'emphasize', 'indicates', 'indicate', 'explains', 'clearly', 'so', 'thus', 'consequently', 'in other words', 'this means', 'this shows', 'this suggests'];

export const SOURCE_CUES = ['according to', 'states', 'stated', 'reports', 'reported', 'found', 'finds', 'says', 'said', 'writes', 'wrote', 'explains', 'explained', 'notes', 'noted', 'argues', 'argued', 'claims', 'claimed', 'survey', 'study', 'research', 'data', 'statistics', 'census', 'report', 'article', 'website', 'author', 'expert'];

export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'so', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
  'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him', 'us', 'them', 'not', 'no', 'do', 'does', 'did', 'have', 'has',
  'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'also', 'very', 'more', 'most', 'than', 'then',
  'there', 'here', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'any', 'some', 'many', 'much',
  'one', 'about', 'into', 'over', 'just', 'only', 'if', 'because', 'while', 'such', 'own', 'same', 'other', 'each',
]);
