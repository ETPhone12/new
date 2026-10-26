import type { ReactNode } from 'react';
import type { QuizQuestion } from '../types';

export const MEDIA_TAGS: { id: string; label: string; group: string }[] = [
  { id: 'angle-low', label: 'Low camera angle (power)', group: 'Camera' },
  { id: 'angle-high', label: 'High camera angle (vulnerability)', group: 'Camera' },
  { id: 'angle-eye', label: 'Eye-level / close-up (relatable)', group: 'Camera' },
  { id: 'thirds', label: 'Rule of thirds / focal point', group: 'Composition' },
  { id: 'lines', label: 'Leading lines', group: 'Composition' },
  { id: 'negative', label: 'Negative space', group: 'Composition' },
  { id: 'colour', label: 'Colour mood', group: 'Colour & light' },
  { id: 'lighting', label: 'Lighting', group: 'Colour & light' },
  { id: 'headline', label: 'Headline / slogan technique', group: 'Text' },
  { id: 'cta', label: 'Call to action', group: 'Text' },
  { id: 'fineprint', label: 'Fine print / disclosure', group: 'Text' },
  { id: 'brand', label: 'Logo / sponsor', group: 'Text' },
  { id: 'subtext', label: 'Implied message (subtext)', group: 'Message' },
  { id: 'audience', label: 'Target audience cue', group: 'Message' },
  { id: 'proof', label: 'Social proof / scarcity', group: 'Message' },
];

export const TAG_LABEL: Record<string, string> = Object.fromEntries(MEDIA_TAGS.map((t) => [t.id, t.label]));

export interface Hotspot {
  x: number;
  y: number;
  accept: string[];
  explain: string;
}

export interface Poster {
  id: string;
  title: string;
  kind: string;
  blurb: string;
  art: () => ReactNode;
  hotspots: Hotspot[];
  questions: QuizQuestion[];
}

const PsaArt = () => (
  <svg viewBox="0 0 300 400" role="img" aria-label="PSA poster: a phone lying on a dark wet road under one pool of light, with the headline One text. One second. One life." className="block h-auto w-full">
    <defs>
      <radialGradient id="psa-light" cx="200" cy="282" r="95" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#dbeafe" stopOpacity="0.55" />
        <stop offset="0.55" stopColor="#93c5fd" stopOpacity="0.16" />
        <stop offset="1" stopColor="#0b1220" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="psa-road" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1f2937" />
        <stop offset="1" stopColor="#111827" />
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="#0b1220" />
    <polygon points="0,170 0,260 300,390 300,300" fill="url(#psa-road)" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x1 = i * 46;
      const y1 = 215 + x1 * (130 / 300);
      const x2 = x1 + 26;
      const y2 = 215 + x2 * (130 / 300);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#facc15" strokeWidth="4" strokeLinecap="round" opacity={i === 4 ? 0 : 0.85} />;
    })}
    {[[30, 205, 70, 222], [150, 270, 210, 296], [230, 320, 280, 342]].map(([a, b, c, d], i) => (
      <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#64748b" strokeWidth="1" opacity="0.35" />
    ))}
    <circle cx="200" cy="282" r="95" fill="url(#psa-light)" />
    <g transform="rotate(-24 200 282)">
      <rect x="183" y="251" width="34" height="62" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <rect x="186" y="256" width="28" height="50" rx="2" fill="#bfdbfe" />
      <path d="M190 262 L205 280 L198 296 M205 280 L212 272" stroke="#1e293b" strokeWidth="0.9" fill="none" />
    </g>
    <g>
      <rect x="216" y="214" width="30" height="22" rx="8" fill="#f8fafc" />
      <path d="M222 236 L218 244 L230 236 Z" fill="#f8fafc" />
      <text x="231" y="230" textAnchor="middle" fontFamily="Lexend, Arial, sans-serif" fontSize="13" fontWeight="700" fill="#0f172a">k</text>
    </g>
    <g fontFamily="'Zilla Slab', Rockwell, Georgia, serif" fontWeight="700" letterSpacing="1">
      <text x="18" y="54" fontSize="30" fill="#f8fafc">ONE TEXT.</text>
      <text x="18" y="88" fontSize="30" fill="#f8fafc">ONE SECOND.</text>
      <text x="18" y="122" fontSize="30" fill="#f87171">ONE LIFE.</text>
    </g>
    <g fontFamily="Lexend, Arial, sans-serif" fill="#cbd5e1">
      <text x="18" y="352" fontSize="12" fontWeight="700">Put it in the glovebox</text>
      <text x="18" y="368" fontSize="12" fontWeight="700">before you turn the key.</text>
      <text x="150" y="392" fontSize="7.5" textAnchor="middle" fill="#94a3b8">A message from SafeRoads Youth Network (fictional) · #WaitToRead</text>
    </g>
  </svg>
);

const SurgeArt = () => (
  <svg viewBox="0 0 300 400" role="img" aria-label="Sports drink ad: an athlete silhouette shot from below against an orange sky, raising a fist, with a SURGE bottle and the slogan Built for the final push." className="block h-auto w-full">
    <defs>
      <linearGradient id="surge-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff6a1a" />
        <stop offset="0.55" stopColor="#ffab40" />
        <stop offset="1" stopColor="#ffd66b" />
      </linearGradient>
      <radialGradient id="surge-sun" cx="205" cy="150" r="90" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fffbe6" />
        <stop offset="0.35" stopColor="#fff1b8" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="300" height="400" fill="url(#surge-sky)" />
    <circle cx="205" cy="150" r="90" fill="url(#surge-sun)" />
    <polygon points="0,300 300,300 300,400 0,400" fill="#7c2d12" />
    {[-120, -40, 40, 120, 200, 280, 360, 440].map((x, i) => (
      <line key={i} x1={x} y1={400} x2={150 + (x - 150) * 0.12} y2={300} stroke="#fde68a" strokeWidth="1.6" opacity="0.7" />
    ))}
    <g fill="#1c0f08" stroke="#fff2b3" strokeWidth="1.4" strokeLinejoin="round">
      <polygon points="104,190 130,192 112,330 74,392 38,392 86,322" />
      <polygon points="130,192 158,188 178,300 204,392 162,392 150,310" />
      <polygon points="112,96 146,96 160,192 102,196" />
      <polygon points="114,104 104,100 82,170 93,175" />
      <polygon points="141,103 152,98 179,44 168,38" />
      <circle cx="174" cy="36" r="9.5" />
      <circle cx="128" cy="80" r="15" />
    </g>
    <text x="131" y="150" textAnchor="middle" fontFamily="'Zilla Slab', Georgia, serif" fontWeight="700" fontSize="18" fill="#ff8a3d">24</text>
    <g>
      <rect x="214" y="236" width="34" height="96" rx="9" fill="#1d4ed8" stroke="#0b1d5c" strokeWidth="1.5" />
      <rect x="222" y="224" width="18" height="14" rx="3" fill="#0b1d5c" />
      <rect x="214" y="262" width="34" height="40" fill="#f97316" />
      <text x="231" y="287" textAnchor="middle" fontFamily="'Zilla Slab', Georgia, serif" fontWeight="700" fontSize="10.5" fill="#fff" letterSpacing="0.5">SURGE</text>
      <path d="M222 246 l6 -6 -2 5 6 0 -7 8 2 -5 z" fill="#fde047" />
    </g>
    <g fontFamily="'Zilla Slab', Georgia, serif" fontWeight="700" fill="#3b0d00" textAnchor="end">
      <text x="288" y="44" fontSize="24">BUILT</text>
      <text x="288" y="70" fontSize="24">FOR THE</text>
      <text x="288" y="96" fontSize="24">FINAL PUSH.</text>
    </g>
    <g>
      <path d="M16 18 l8 -8 -3 7 8 0 -9 10 3 -7 z" fill="#3b0d00" />
      <text x="32" y="25" fontFamily="'Zilla Slab', Georgia, serif" fontWeight="700" fontSize="13" fill="#3b0d00">SURGE</text>
    </g>
    <text x="150" y="394" textAnchor="middle" fontFamily="Lexend, Arial, sans-serif" fontSize="7.5" fill="#fde7c7">*Preferred over water by 9 of 12 testers in a SURGE taste test. (Fictional brand.)</text>
  </svg>
);

const GlowArt = () => (
  <svg viewBox="0 0 300 400" role="img" aria-label="Influencer post: an eye-level close-up of a smiling creator holding a serum bottle beside her face, with 48.2K likes and a caption ending in #ad." className="block h-auto w-full">
    <defs>
      <linearGradient id="glow-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffd3df" />
        <stop offset="1" stopColor="#ffe8d1" />
      </linearGradient>
      <linearGradient id="glow-avatar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f472b6" />
        <stop offset="1" stopColor="#fb923c" />
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="#ffffff" />
    <circle cx="24" cy="26" r="13" fill="url(#glow-avatar)" />
    <text x="44" y="24" fontFamily="Lexend, Arial, sans-serif" fontSize="11" fontWeight="700" fill="#111827">glowwithmaya</text>
    <text x="44" y="37" fontFamily="Lexend, Arial, sans-serif" fontSize="7.5" fill="#9ca3af">Paid partnership</text>
    <text x="284" y="28" textAnchor="end" fontFamily="Lexend, Arial, sans-serif" fontSize="14" fill="#111827">···</text>
    <rect x="0" y="50" width="300" height="222" fill="url(#glow-bg)" />
    <ellipse cx="150" cy="150" rx="78" ry="92" fill="#5b3424" />
    <ellipse cx="150" cy="170" rx="60" ry="72" fill="#f2c4a4" />
    <ellipse cx="127" cy="160" rx="8" ry="5.5" fill="#2b1810" />
    <ellipse cx="173" cy="160" rx="8" ry="5.5" fill="#2b1810" />
    <circle cx="129" cy="158.5" r="2.6" fill="none" stroke="#ffffff" strokeWidth="1.3" />
    <circle cx="175" cy="158.5" r="2.6" fill="none" stroke="#ffffff" strokeWidth="1.3" />
    <path d="M117 147 q10 -6 20 0 M163 147 q10 -6 20 0" stroke="#5b3424" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="116" cy="188" r="9" fill="#f9a8b8" opacity="0.6" />
    <circle cx="184" cy="188" r="9" fill="#f9a8b8" opacity="0.6" />
    <path d="M132 203 q18 16 36 0" stroke="#b4535f" strokeWidth="3" fill="#fff" strokeLinejoin="round" />
    <path d="M148 168 q-4 14 2 18" stroke="#d99b7b" strokeWidth="2" fill="none" strokeLinecap="round" />
    <g>
      <ellipse cx="220" cy="246" rx="17" ry="13" fill="#f2c4a4" />
      <rect x="209" y="186" width="22" height="58" rx="5" fill="#c4b5fd" stroke="#8b5cf6" strokeWidth="1.2" />
      <rect x="214" y="174" width="12" height="14" rx="2" fill="#6d28d9" />
      <ellipse cx="220" cy="172" rx="7" ry="5" fill="#1f2937" />
      <text x="220" y="219" textAnchor="middle" fontFamily="'Zilla Slab', Georgia, serif" fontSize="7" fontWeight="700" fill="#4c1d95">GLOW</text>
    </g>
    <g stroke="#111827" strokeWidth="1.6" fill="none">
      <path d="M22 290 c-4 -6 -12 -2 -10 4 c1 4 10 10 10 10 s9 -6 10 -10 c2 -6 -6 -10 -10 -4 z" fill="#ef4444" stroke="#ef4444" />
      <path d="M44 286 h14 a3 3 0 0 1 3 3 v8 a3 3 0 0 1 -3 3 h-8 l-5 4 v-4 h-1 a3 3 0 0 1 -3 -3 v-8 a3 3 0 0 1 3 -3 z" />
      <path d="M72 285 l14 7 -14 7 v-5 h-0 z" />
    </g>
    <g fontFamily="Lexend, Arial, sans-serif" fontSize="10" fill="#111827">
      <text x="12" y="320" fontWeight="700">48.2K likes</text>
      <text x="12" y="336"><tspan fontWeight="700">glowwithmaya</tspan> obsessed with my glow!! ONLY 3 LEFT</text>
      <text x="12" y="350">in stock, link in bio #skincare #glowup #selfcare <tspan fill="#9ca3af">#ad</tspan></text>
      <text x="12" y="368" fill="#9ca3af">View all 1,204 comments</text>
      <text x="12" y="383"><tspan fontWeight="700">lena.k</tspan> omg need this</text>
      <text x="12" y="397"><tspan fontWeight="700">jaybird</tspan> your skin!!!</text>
    </g>
  </svg>
);

export const POSTERS: Poster[] = [
  {
    id: 'psa',
    title: 'One Text. One Second.',
    kind: 'Print PSA',
    blurb: 'A road-safety public service announcement.',
    art: PsaArt,
    hotspots: [
      { x: 226, y: 312, accept: ['angle-high', 'thirds'], explain: 'Shot from above (high angle), the dropped phone looks small and abandoned. It also sits near the lower-right rule-of-thirds point, so it is the focal point.' },
      { x: 136, y: 300, accept: ['lighting'], explain: 'Low-key lighting: one pool of light in darkness creates a grave, dramatic mood and spotlights the evidence.' },
      { x: 60, y: 241, accept: ['lines'], explain: 'The lane markings act as leading lines, pulling the eye diagonally toward the phone.' },
      { x: 196, y: 112, accept: ['headline'], explain: 'Anaphora and tricolon ("One... One... One...") make it rhythmic and memorable, building from small (a text) to enormous (a life). Red marks the climax.' },
      { x: 248, y: 120, accept: ['colour', 'negative'], explain: 'Cold navy and black set a sombre mood, and the empty space isolates the phone, suggesting loss and silence.' },
      { x: 258, y: 210, accept: ['subtext'], explain: 'The message was only "k". The implied message: the crash happened for nothing; no text is worth a life.' },
      { x: 182, y: 362, accept: ['cta'], explain: 'A concrete call to action tells drivers exactly what to do and when.' },
      { x: 286, y: 376, accept: ['fineprint', 'brand'], explain: 'The sponsor line shows a non-profit made it, not a company selling something. That builds trust (ethos).' },
    ],
    questions: [
      { q: 'Who is the target audience?', options: ['Cyclists', 'Teen and new drivers', 'Phone companies', 'Parents of toddlers'], answer: 1, why: 'The glovebox and "turn the key" address drivers; the texting habit points to young drivers.' },
      { q: 'What is the overt message?', options: ['Buy a new phone', 'Do not text while driving', 'Roads are dangerous at night', 'Join SafeRoads'], answer: 1, why: 'It is stated directly in the call to action.' },
      { q: 'What is the implied message?', options: ['Phones break easily', 'A single careless second can destroy a life, and no message is worth it', 'Driving is fun', 'Night driving is illegal'], answer: 1, why: 'The trivial "k", the abandoned phone, and "ONE LIFE." suggest the stakes without showing a crash.' },
    ],
  },
  {
    id: 'surge',
    title: 'SURGE: Built for the Final Push',
    kind: 'Print ad',
    blurb: 'A sports drink advertisement.',
    art: SurgeArt,
    hotspots: [
      { x: 130, y: 150, accept: ['angle-low'], explain: 'Shot from below (low angle), the athlete towers over the viewer: heroic and powerful.' },
      { x: 226, y: 176, accept: ['colour', 'lighting'], explain: 'Warm, saturated orange and gold suggest energy, heat, and victory. Backlighting from the sun gives the athlete a glowing rim.' },
      { x: 248, y: 346, accept: ['lines'], explain: 'The track lanes are leading lines that converge upward toward the athlete.' },
      { x: 231, y: 300, accept: ['thirds', 'brand'], explain: 'The product sits near a rule-of-thirds point and is the only labelled object in sharp colour contrast (blue on orange).' },
      { x: 190, y: 64, accept: ['headline'], explain: 'The slogan implies the drink gives you the edge at the hardest moment, when you need it most.' },
      { x: 290, y: 386, accept: ['fineprint'], explain: 'The asterisk claim rests on a company taste test of only 12 people, and taste says nothing about performance.' },
      { x: 174, y: 36, accept: ['subtext'], explain: 'The raised fist signals victory. Implied: drink SURGE and you become a winner.' },
      { x: 80, y: 300, accept: ['audience'], explain: 'A jersey number and sprinter’s stance target teen and young adult athletes who see themselves as competitors.' },
    ],
    questions: [
      { q: 'Who is the target audience?', options: ['Retirees', 'Teen and young adult athletes', 'Restaurant owners', 'Doctors'], answer: 1, why: 'Track, jersey, and athletic pose.' },
      { q: 'What is the overt message?', options: ['Exercise daily', 'Buy SURGE', 'Run on tracks', 'Drink water'], answer: 1, why: 'The product and brand are front and centre.' },
      { q: 'What is the implied message?', options: ['SURGE is cheap', 'SURGE turns you into a champion', 'Orange is a good colour', 'Water is unhealthy'], answer: 1, why: 'The heroic angle, fist, and slogan link the drink to winning without proof.' },
    ],
  },
  {
    id: 'glow',
    title: 'glowwithmaya',
    kind: 'Sponsored social post',
    blurb: 'An influencer post for a skincare serum.',
    art: GlowArt,
    hotspots: [
      { x: 150, y: 228, accept: ['angle-eye'], explain: 'An eye-level close-up feels personal, like a friend talking to you directly.' },
      { x: 108, y: 150, accept: ['lighting'], explain: 'Ring-shaped catchlights in the eyes reveal soft, even ring-light lighting that hides texture and makes skin look flawless.' },
      { x: 50, y: 92, accept: ['colour'], explain: 'Soft pinks and peach create a gentle, "clean", feminine mood that matches the product.' },
      { x: 238, y: 210, accept: ['subtext', 'thirds'], explain: 'The bottle beside her face implies the serum caused her "glow", which is never proven. It sits on the right third.' },
      { x: 100, y: 313, accept: ['proof'], explain: '48.2K likes is social proof: if everyone likes it, it must work.' },
      { x: 288, y: 311, accept: ['proof'], explain: '"ONLY 3 LEFT" creates scarcity and urgency so viewers buy before thinking.' },
      { x: 288, y: 349, accept: ['fineprint'], explain: '#ad is buried in grey at the end of the hashtags. Canadian advertising guidelines expect paid posts to be clearly disclosed.' },
      { x: 150, y: 30, accept: ['audience', 'fineprint'], explain: 'A friendly first-name handle and selfie style target teens and young adults who follow creators for advice. "Paid partnership" is tiny and grey.' },
    ],
    questions: [
      { q: 'Who is the target audience?', options: ['Teens and young adults who follow beauty creators', 'Business owners', 'Seniors', 'Young children'], answer: 0, why: 'The platform, slang, and selfie style.' },
      { q: 'What is the overt message?', options: ['This serum gave me glowing skin; buy it now', 'Wear sunscreen', 'Follow me for recipes', 'Comment below'], answer: 0, why: 'Stated in the caption.' },
      { q: 'What is the implied message?', options: ['Skin care is expensive', 'You can look like her, and everyone else already wants this', 'Phones take good photos', 'Pink is popular'], answer: 1, why: 'Lighting, likes, and scarcity build desire and fear of missing out.' },
    ],
  },
];

export const POSTER_BY_ID: Record<string, Poster> = Object.fromEntries(POSTERS.map((p) => [p.id, p]));
