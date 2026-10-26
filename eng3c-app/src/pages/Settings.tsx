import { useState } from 'react';
import { Copy, Download, Upload } from 'lucide-react';
import { freshState, getState, isStorageOk, normalizeState, replaceState, updateSettings, useApp } from '../store/store';
import { toast } from '../store/ui';
import { READING_LIST } from '../data/curriculum';
import { Callout, ConfirmButton, PageHeader, Segmented } from '../components/ui';
import { copyText, downloadText, isEmbedded } from '../lib/util';
import type { ThemePref } from '../types';

export default function SettingsPage() {
  const s = useApp();
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const backup = () => JSON.stringify(getState());

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      replaceState(normalizeState(parsed));
      setImportText('');
      setImportError(null);
      toast('Backup restored');
    } catch {
      setImportError('That is not a valid backup. Paste the full text you copied from "Copy backup".');
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Settings & about" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 content-start gap-6">
          <section className="card grid gap-4 p-5">
            <h2 className="text-lg font-semibold">You</h2>
            <div>
              <label htmlFor="set-name" className="label">First name (for greetings and exports)</label>
              <input id="set-name" className="input" value={s.settings.name} onChange={(e) => updateSettings({ name: e.target.value })} />
            </div>
            <div>
              <div className="label">Course</div>
              <Segmented label="Course" value={s.settings.course} onChange={(v) => updateSettings({ course: v })} options={[{ value: 'ENG3C', label: 'ENG3C' }, { value: 'NBE3C', label: 'NBE3C' }]} />
              <p className="mt-2 text-sm text-muted">
                NBE3C (Understanding Contemporary First Nations, Métis, and Inuit Voices) is the compulsory Grade 11 College English credit in many Ontario schools. It uses the same four strands, with texts by First Nations, Métis, and Inuit authors at the centre, such as <i>The Marrow Thieves</i> and <i>Indian Horse</i>. Pair this app’s skills practice with those texts.
              </p>
            </div>
            <div>
              <div className="label">Appearance</div>
              <Segmented<ThemePref> label="Theme" value={s.settings.theme} onChange={(v) => updateSettings({ theme: v })} options={[{ value: 'system', label: 'Match device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
            </div>
          </section>

          <section className="card grid gap-3 p-5">
            <h2 className="text-lg font-semibold">Your data</h2>
            <p className="text-sm text-muted">Everything is saved in this browser on this device. Nothing is uploaded. Clearing site data erases it, so keep a backup.</p>
            {!isStorageOk() && <Callout tone="warn">This browser is blocking storage, so progress will not survive a reload.</Callout>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-sm" onClick={async () => toast((await copyText(backup())) ? 'Backup copied. Paste it somewhere safe.' : 'Copy failed')}><Copy size={15} /> Copy backup</button>
              {!isEmbedded() && <button type="button" className="btn btn-sm" onClick={() => downloadText(`eng3c-backup-${new Date().toISOString().slice(0, 10)}.json`, backup(), 'application/json')}><Download size={15} /> Download backup</button>}
            </div>
            <label htmlFor="import" className="label mt-2">Restore from a backup</label>
            <textarea id="import" className="input min-h-[5rem] font-mono text-xs" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste backup text here" />
            {importError && <p className="text-sm text-bad">{importError}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-sm" disabled={!importText.trim()} onClick={doImport}><Upload size={15} /> Restore</button>
              <ConfirmButton label="Erase all progress" confirmLabel="Tap again to erase everything" className="btn-sm" onConfirm={() => { replaceState(freshState()); toast('All progress erased'); }} />
            </div>
          </section>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">About ENG3C Studio</h2>
            <div className="grid gap-2 text-[0.95rem]">
              <p>A practice app for Ontario Grade 11 College Preparation English. Lessons and tools follow the four strands of <i>The Ontario Curriculum, Grades 11 and 12: English</i> (2007): Oral Communication, Reading and Literature Studies, Writing, and Media Studies, each with its reflection expectation.</p>
              <p>The unit cross-references follow the "Power" sequence of TVO ILC’s ENG3C course, and the technical-writing work reflects the procedural and business writing taught in other Ontario online schools.</p>
              <p className="text-muted">This is an independent study tool. It is not affiliated with or endorsed by the Ontario Ministry of Education, TVO, or any school. Your teacher’s rubrics and weights always take priority. All passages, posters, brands, and people in the practice texts are original or fictional unless named as historical.</p>
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">How marks work</h2>
            <ul className="grid gap-1.5 text-[0.95rem]">
              <li><strong>70%</strong> term work, judged on your most consistent level, with more weight on recent work.</li>
              <li><strong>30%</strong> final evaluation: often a 15% culminating task plus a 15% exam, or a single 25–30% exam.</li>
              <li><strong>50%</strong> earns the credit; many college programs look for <strong>60–65%+</strong>.</li>
              <li>Every task is marked on <strong>K/U, T/I, C, A</strong>. Level 3 (70–79%) is the provincial standard.</li>
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">Common course texts</h2>
            <ul className="grid gap-2">
              {READING_LIST.novels.map((n) => (
                <li key={n.title} className="text-[0.95rem]">
                  <i className="font-bold not-italic">{n.title}</i> · {n.author}
                  <span className="block text-sm text-muted">{n.note}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5 text-[0.95rem]">
            <h2 className="mb-2 text-lg font-semibold">Install it on an iPad</h2>
            <p className="text-muted">In Safari, tap Share, then "Add to Home Screen". The app opens full screen and works offline after the first visit.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
