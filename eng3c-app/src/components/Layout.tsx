import { useEffect, type ReactNode } from 'react';
import { Flame, Menu, X } from 'lucide-react';
import { navigate, useRoute } from '../lib/router';
import { setDrawer, useUi } from '../store/ui';
import { useApp } from '../store/store';
import { cx } from '../lib/util';
import { LESSONS } from '../data/lessons';
import { lessonsDone, streak } from '../lib/progress';
import { NAV, TABS, TILE } from './nav';
import { ProgressRing } from './ui';

const SECTION_OF: Record<string, string> = { lesson: 'course', task: 'course' };

function activeRoute(name: string) {
  return SECTION_OF[name] ?? name;
}

function Logo() {
  return (
    <button type="button" onClick={() => navigate('home')} className="flex items-center gap-3 text-left" aria-label="ENG3C Studio home">
      <span className="relative grid h-10 w-10 rotate-[-6deg] place-items-center rounded-xl bg-primary font-display text-xl font-black text-onprimary shadow-[0_3px_0_rgb(var(--primary-deep))]">
        E
        <span className="absolute -bottom-1 left-1.5 right-1.5 h-2 rounded-sm bg-sun" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[1.15rem] font-black">ENG3C Studio</span>
        <span className="block text-[0.74rem] font-bold text-muted">Grade 11 College English</span>
      </span>
    </button>
  );
}

function NavList({ onPick }: { onPick?: () => void }) {
  const route = useRoute();
  const active = activeRoute(route.name);
  return (
    <nav aria-label="Main" className="grid gap-5">
      {NAV.map((g) => {
        const tile = TILE[g.strand ?? 'primary'];
        return (
          <div key={g.title}>
            <div className="mb-1.5 px-3">
              <span className="eyebrow">
                {g.title}
                {g.strand && <span className={cx('ml-1.5', tile.text)}>· {g.strand}</span>}
              </span>
            </div>
            <ul className="grid gap-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                const on = active === it.route;
                return (
                  <li key={it.route}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(it.route);
                        onPick?.();
                      }}
                      aria-current={on ? 'page' : undefined}
                      className={cx(
                        'flex min-h-[2.6rem] w-full items-center gap-3 rounded-xl px-2.5 text-left text-[0.95rem] transition-colors',
                        on ? cx(tile.soft, 'font-extrabold text-ink') : 'font-semibold text-ink/80 hover:bg-sunken',
                      )}
                    >
                      <span className={cx('icon-tile h-8 w-8 !rounded-[10px]', on ? tile.solid : cx(tile.soft, tile.text))}>
                        <Icon size={17} strokeWidth={2.3} />
                      </span>
                      {it.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function ProgressCard() {
  const s = useApp();
  const done = lessonsDone(s);
  const st = streak(s);
  return (
    <button type="button" onClick={() => navigate('course')} className="card flex w-full items-center gap-3 p-3 text-left">
      <ProgressRing value={done} max={LESSONS.length} size={52} stroke={7} label={`${done} of ${LESSONS.length} lessons`}>
        <span className="num text-[0.8rem] font-black">{Math.round((done / LESSONS.length) * 100)}%</span>
      </ProgressRing>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold">{done} of {LESSONS.length} lessons</span>
        <span className={cx('flex items-center gap-1 text-[0.8rem] font-bold', st.count ? 'text-strandA' : 'text-muted')}>
          <Flame size={14} /> {st.count ? `${st.count}-day streak` : 'Start a streak today'}
        </span>
      </span>
    </button>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const route = useRoute();
  const { drawerOpen } = useUi();
  const s = useApp();
  const st = streak(s);
  const active = activeRoute(route.name);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-full lg:flex">
      {/* Sidebar: iPad landscape and desktop */}
      <aside
        className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col gap-5 overflow-y-auto border-r-[1.5px] border-line bg-surface px-3 py-5 lg:flex"
        style={{ paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))', paddingTop: 'max(20px, env(safe-area-inset-top, 0px))' }}
      >
        <div className="px-2">
          <Logo />
        </div>
        <ProgressCard />
        <NavList />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar: phones and iPad portrait */}
        <div className="sticky z-30 border-b-[1.5px] border-line bg-surface/95 backdrop-blur lg:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <div className="gutter flex h-16 items-center justify-between gap-3">
            <Logo />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => navigate('home')} className={cx('chip num gap-1 border-transparent', st.count ? 'bg-strandA/15 text-strandA' : 'bg-sunken text-muted')} aria-label={`${st.count}-day streak`}>
                <Flame size={15} /> {st.count}
              </button>
              <button type="button" className="btn btn-ghost !px-2.5" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawerOpen}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        <main className="gutter mx-auto w-full max-w-[1180px] pb-32 pt-6 lg:pb-14 lg:pt-9" id="main">
          {children}
        </main>

        {/* Bottom tabs: phones */}
        <nav
          aria-label="Quick"
          className="fixed inset-x-0 bottom-0 z-30 border-t-[1.5px] border-line bg-surface/95 backdrop-blur md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}
        >
          <ul className="grid grid-cols-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = active === t.route;
              return (
                <li key={t.route}>
                  <button
                    type="button"
                    onClick={() => navigate(t.route)}
                    aria-current={on ? 'page' : undefined}
                    className={cx('flex h-[3.9rem] w-full flex-col items-center justify-center gap-0.5 text-[0.72rem] font-extrabold', on ? 'text-primary' : 'text-muted')}
                  >
                    <span className={cx('grid h-7 w-12 place-items-center rounded-full transition-colors', on && 'bg-primary/15')}>
                      <Icon size={20} strokeWidth={on ? 2.6 : 2.1} />
                    </span>
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 h-full w-full bg-ink/40" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <div
            className="fade-in absolute bottom-0 left-0 top-0 flex w-[86%] max-w-[320px] flex-col gap-5 overflow-y-auto bg-surface px-3 py-4 shadow-lift"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 0px))', paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))', paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex items-center justify-between px-2">
              <Logo />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDrawer(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <ProgressCard />
            <NavList onPick={() => setDrawer(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
