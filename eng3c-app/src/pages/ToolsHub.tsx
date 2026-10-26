import { navigate } from '../lib/router';
import { STRANDS, STRAND_STYLE, TOOLS } from '../data/curriculum';
import { useApp } from '../store/store';
import { toolBest } from '../lib/progress';
import { PageHeader, ScoreBadge } from '../components/ui';
import { cx } from '../lib/util';

export default function ToolsHub() {
  const s = useApp();
  const groups = [
    ...STRANDS.map((st) => ({ key: st.id, title: `${st.id}. ${st.name}`, tools: TOOLS.filter((t) => t.strand === st.id), strand: st.id })),
    { key: 'all', title: 'Across all strands', tools: TOOLS.filter((t) => t.strand === 'all'), strand: undefined },
  ];
  return (
    <div>
      <PageHeader eyebrow="Practice tools" title="Tools" desc="Every tool maps to a curriculum strand and saves your work on this device." />
      <div className="grid gap-8">
        {groups.map((g) => (
          <section key={g.key}>
            <h2 className={cx('mb-3 text-xl font-semibold', g.strand && STRAND_STYLE[g.strand].text)}>{g.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.tools.map((t) => {
                const best = toolBest(s, t.id);
                return (
                  <button key={t.id} type="button" onClick={() => navigate(t.id)} className="card flex flex-col items-start gap-1 p-4 text-left transition-colors hover:border-ink/30">
                    <span className="flex w-full items-start justify-between gap-2">
                      <span className="font-bold">{t.name}</span>
                      {best !== undefined && <ScoreBadge score={best} />}
                    </span>
                    <span className="text-sm text-muted">{t.blurb}</span>
                    <span className="mt-1 text-xs font-bold text-muted">Builds {t.kica.join(' · ')}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
