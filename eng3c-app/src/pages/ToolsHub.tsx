import { ArrowRight } from 'lucide-react';
import { navigate } from '../lib/router';
import { STRANDS, TOOLS } from '../data/curriculum';
import { useApp } from '../store/store';
import { toolBest } from '../lib/progress';
import { PageHeader, ScoreBadge } from '../components/ui';
import { ROUTE_META, TILE } from '../components/nav';
import { cx } from '../lib/util';
import type { StrandId } from '../types';

export default function ToolsHub() {
  const s = useApp();
  const groups: { key: string; title: string; sub: string; strand?: StrandId }[] = [
    ...STRANDS.map((st) => ({ key: st.id, title: st.name, sub: `Strand ${st.id}`, strand: st.id })),
    { key: 'all', title: 'Across all strands', sub: 'Track and review' },
  ];
  return (
    <div>
      <PageHeader eyebrow="Practice tools" title="Tools" desc="Every tool maps to a curriculum strand and saves your work on this device. Your best score shows on each card." />
      <div className="grid gap-10">
        {groups.map((g) => {
          const tile = TILE[g.strand ?? 'primary'];
          const tools = TOOLS.filter((t) => (g.strand ? t.strand === g.strand : t.strand === 'all'));
          return (
            <section key={g.key}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx('h-8 w-1.5 rounded-full', g.strand ? tile.solid.split(' ')[0] : 'bg-primary')} aria-hidden />
                <div>
                  <div className={cx('text-xs font-black uppercase tracking-[0.1em]', tile.text)}>{g.sub}</div>
                  <h2 className="text-2xl font-black leading-tight">{g.title}</h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => {
                  const best = toolBest(s, t.id);
                  const Icon = ROUTE_META[t.id]?.icon;
                  return (
                    <button key={t.id} type="button" onClick={() => navigate(t.id)} className="card group flex flex-col items-start gap-3 p-5 text-left transition-transform hover:-translate-y-0.5">
                      <span className="flex w-full items-start justify-between gap-2">
                        {Icon && (
                          <span className={cx('icon-tile h-14 w-14 rotate-[-4deg] transition-transform group-hover:rotate-0', tile.solid)}>
                            <Icon size={28} strokeWidth={2.2} />
                          </span>
                        )}
                        {best !== undefined && <ScoreBadge score={best} />}
                      </span>
                      <span className="font-display text-lg font-black leading-tight">{t.name}</span>
                      <span className="text-[0.92rem] text-muted">{t.blurb}</span>
                      <span className="mt-auto flex w-full items-center justify-between pt-1">
                        <span className="flex gap-1">
                          {t.kica.map((k) => (
                            <span key={k} className="chip !px-2 !py-0 text-[0.7rem]">{k}</span>
                          ))}
                        </span>
                        <span className={cx('flex items-center gap-1 text-sm font-extrabold', tile.text)}>Open <ArrowRight size={15} /></span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
