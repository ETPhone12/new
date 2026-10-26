# ENG3C Studio

A practice app for **Ontario Grade 11 College Preparation English** (ENG3C, and NBE3C: *Understanding Contemporary First Nations, Métis, and Inuit Voices*). It covers all four curriculum strands with interactive tools, not flashcards, and grades work on the four KICA categories.

Built for iPad and desktop, and works on phones. Installable as an offline web app.

## What's inside

**Course structure:** 5 modules, 20 lessons, 4 portfolio tasks and a final evaluation. Each lesson cross-references its curriculum expectations (A1–D4) and the matching TVO ILC lesson (1.0–4.2).

| Module | Strands | Milestone |
|---|---|---|
| 1. Precision & Real-World Writing | B, C | Infographic analysis + zero-ambiguity SOP |
| 2. The Mechanics of Persuasion | B, C | Persuasive op-ed with cited evidence |
| 3. Oral Power & Active Listening | A | Audio editorial quiz + 2-minute speech |
| 4. Media Literacy & Visual Storytelling | D, B | PSA deconstruction + 5-frame photo essay |
| 5. Comparative Analysis & Culminating Prep | all | Compare & contrast essay + timed exam |

**Classroom look and feel**

- *Today* page: a "Today's agenda" whiteboard (lesson → practice → reflection), a weekly learning streak, course progress, and module cards in their own colours.
- *Learning path*: each module's lessons are stops on a trail that fills in as you go, ending at the portfolio task trophy.
- *3-part lessons* in the Ontario format:
  - **Minds On**: a sticky-note hook, the learning goal, and "I can…" success criteria you tick off.
  - **Action**: the teaching notes, a chalkboard "teacher model", and a word wall of index cards.
  - **Consolidation**: an exit ticket, practice tools, then "Mark complete" with confetti and the 60-second reflection.
- *Sticker chart*: 18 stickers for milestones such as finishing a module, reflecting in all four strands, or speaking at 130–150 WPM.
- *Themes*: "Whiteboard" (light) and "Chalkboard" (dark). The fonts are Nunito for the interface, Literata for reading passages, and Caveat for handwritten notes.

**Tools by strand**

- **Reading (B)**
  - *Text Deconstructor*: split-screen reader. Highlight thesis (blue), facts (green), opinions/loaded language (yellow), and inferences (purple, with a note). Checked against an answer key.
  - *Graphic Text Lab*: a truncated-axis bar chart (with an "honest axis" toggle), an evacuation floor plan with a scale bar, and an infographic.
  - *Quick-Fire Drills*: transition taps, context clues, a text-features hunt, appeals and devices, fallacies, lateral reading, citations (MLA 9 / APA 7), conventions, and a short-story set.
- **Writing (C)**
  - *PPE Paragraph Builder*: Point, Proof, Explanation (and Link) slots. Each slot unlocks only when the one before it passes, and the paragraph stitches only when all required checks pass.
  - *Compare & Contrast Matrix*: enter criteria once, then flip between Block and Point-by-Point outlines.
  - *How-To Stress Tester*: flags non-imperative steps, vague verbs, passive voice, steps with more than one action, missing measurements, tools not in the materials list, and missing safety warnings. Includes a business-memo checker.
  - *Precision Linter*: wordiness, slang, hedging, passive voice, comma splices, run-ons, its/it's, there/their, then/than and more, with one-tap fixes and a precision score.
- **Oral (A)**
  - *Active Listening Player*: four original audio pieces read by the device's built-in voice. They pause at checkpoints to ask about tone, audience, devices, and bias. Includes Cornell notes. Falls back to text mode when speech is not available.
  - *Speech Studio*: script editor with ear-friendly checks, a teleprompter (speed in WPM, mirror mode), and a microphone recorder. It reports words per minute (target 130–150), filler words (from a live transcript where the browser supports one, or a tap counter), and a pause histogram. You can also upload a recording.
- **Media (D)**
  - *Ad & PSA Analyzer*: three original posters (PSA, print ad, sponsored post) with tappable hotspots to tag angle, composition, colour and lighting, text, and subtext. You can also upload your own ad and pin it.
  - *Photo Essay Storyboard*: 5–6 frames with your own photos, drag-to-reorder, shot size and angle tags, caption checks, and a slideshow preview.
- **Across the course**
  - *60-second Reflection Log*: covers A3, B4, C4, and D4. It opens after each lesson and task, and the log can be copied for submission.
  - *KICA Gradebook*: self-assessment rubrics (levels R to 4+, converted to %). Includes adjustable KICA weights, the 70/30 split, recent-weighted, median, or average term marks, and a "mark needed on the rest" calculator. You can enter real course marks too.
  - *Mock Final Exam*: timed (60/90/120 min). It has a sight passage, a graphic text, conventions, and an essay. Multiple choice is auto-marked; short answers are self-marked against model answers.
  - *Blueprint Explorer*: an interactive diagram linking strands, TVO units, modules, tools, and KICA.
  - *Word Wall*: about 120 terms on index cards grouped by letter, with flashcards.

All practice passages, posters, brands, and people are original or fictional. The only exceptions are short quotations from public-domain speeches (Lincoln, FDR, Douglass).

## Run it

```bash
cd eng3c-app
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests for grading, linter, writing checks, speech metrics
npm run typecheck
npm run build        # PWA build in dist/ (deploy to any static host)
npm run build:single # whole app in one HTML file (dist-single/)
```

To use it on an iPad, deploy `dist/` to any static host (GitHub Pages, Netlify, and so on). Open it in Safari, then tap Share → Add to Home Screen. It works offline after the first visit.

## Data and privacy

Progress is stored in the browser: `localStorage` for work, IndexedDB for photos. Nothing is sent to a server. Settings → *Copy backup* / *Restore* moves data between devices.

One exception: in Chrome and Edge, the live transcript in Speech Studio uses the browser's speech recognition service, which may process audio online. The app says this next to the recorder.

## Notes and limits

- The writing checks are rule-based (no AI service), so they catch patterns, not meaning. The app presents each flag as a question for the writer.
- Microphone recording needs a browser that allows it. Where it is blocked, the upload option still works, and WPM is then estimated from the script.
- KICA weights and the final-evaluation split vary by school. Defaults are K20/T30/C30/A20 and 15% + 15%. Change them in the gradebook to match your teacher.
- This is an independent study tool. It is not affiliated with the Ontario Ministry of Education or TVO.

## Project layout

```
src/
  data/        curriculum, 20 lessons, passages, drills, listening scripts, posters, exam
  lib/         grading, text analysis, writing checks, speech metrics, router, image store
  store/       persisted app state + UI state
  components/  layout, quiz, KICA rubric, reflection modal, graphics
  pages/       one file per screen
```
