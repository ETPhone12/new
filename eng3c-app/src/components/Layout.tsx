import { useEffect, type ReactNode } from 'react';
import {
  BarChart3,
  BookOpen,
  BookText,
  Camera,
  ClipboardList,
  Compass,
  Ear,
  FileCheck2,
  GitCompareArrows,
  GraduationCap,
  Highlighter,
  Home,
  Images,
  LayoutGrid,
  ListChecks,
  Menu,
  Mic,
  NotebookPen,
  PenLine,
  PieChart,
  Settings,
  SpellCheck,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { navigate, useRoute } from '../lib/router';
import { setDrawer, useUi } from '../store/ui';
import { cx } from '../lib/util';
import type { StrandId } from '../types';
import { STRAND_STYLE } from '../data/curriculum';

interface NavItem {
  route: string;
  label: string;
  icon: typeof Home;
}

const NAV: { title: string; strand?: StrandId; items: NavItem[] }[] = [
  {
    title: 'Course',
    items: [
      { route: 'home', label: 'Today', icon: Home },
      { route: 'course', label: 'Course map', icon: GraduationCap },
      { route: 'blueprint', label: 'Blueprint explorer', icon: Compass },
    ],
  },
  {
    title: 'Reading',
    strand: 'B',
    items: [
      { route: 'reader', label: 'Text Deconstructor', icon: Highlighter },
      { route: 'graphic', label: 'Graphic Text Lab', icon: PieChart },
      { route: 'drills', label: 'Quick-Fire Drills', icon: Zap },
    ],
  },
  {
    title: 'Writing',
    strand: 'C',
    items: [
      { route: 'ppe', label: 'PPE Builder', icon: PenLine },
      { route: 'compare', label: 'Compare Matrix', icon: GitCompareArrows },
      { route: 'procedure', label: 'How-To Tester', icon: ListChecks },
      { route: 'linter', label: 'Precision Linter', icon: SpellCheck },
    ],
  },
  {
    title: 'Oral',
    strand: 'A',
    items: [
      { route: 'listening', label: 'Listening Player', icon: Ear },
      { route: 'speech', label: 'Speech Studio', icon: Mic },
    ],
  },
  {
    title: 'Media',
    strand: 'D',
    items: [
      { route: 'hotspot', label: 'Ad & PSA Analyzer', icon: Camera },
      { route: 'photo', label: 'Photo Essay', icon: Images },
    ],
  },
  {
    title: 'Track',
    items: [
      { route: 'reflections', label: 'Reflection Log', icon: NotebookPen },
      { route: 'grades', label: 'KICA Gradebook', icon: BarChart3 },
      { route: 'exam', label: 'Mock Final Exam', icon: Timer },
      { route: 'glossary', label: 'Glossary', icon: BookText },
      { route: 'settings', label: 'Settings & about', icon: Settings },
    ],
  },
];

const TABS: NavItem[] = [
  { route: 'home', label: 'Today', icon: Home },
  { route: 'course', label: 'Course', icon: BookOpen },
  { route: 'tools', label: 'Tools', icon: LayoutGrid },
  { route: 'reflections', label: 'Reflect', icon: ClipboardList },
  { route: 'grades', label: 'Grades', icon: FileCheck2 },
];

const SECTION_OF: Record<string, string> = { lesson: 'course', task: 'course' };

function activeRoute(name: string) {
  return SECTION_OF[name] ?? name;
}

function Logo() {
  return (
    <button type="button" onClick={() => navigate('home')} className="flex items-center gap-2.5 text-left" aria-label="ENG3C Studio home">
      <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-lg font-bold text-surface">
        E
        <span className="absolute -bottom-0.5 left-1 right-1 h-1.5 rounded-sm bg-hlOpinion/90" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold">ENG3C Studio</span>
        <span className="block text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted">Grade 11 College English</span>
      </span>
    </button>
  );
}

function NavList({ onPick }: { onPick?: () => void }) {
  const route = useRoute();
  const active = activeRoute(route.name);
  return (
    <nav aria-label="Main" className="grid gap-5">
      {NAV.map((g) => (
        <div key={g.title}>
          <div className="mb-1.5 flex items-center gap-2 px-3">
            {g.strand && <span className={cx('h-2 w-2 rounded-full', STRAND_STYLE[g.strand].dot)} aria-hidden />}
            <span className="eyebrow">
              {g.title}
              {g.strand && <span className="ml-1 font-normal normal-case tracking-normal">· Strand {g.strand}</span>}
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
                      'relative flex min-h-[2.4rem] w-full items-center gap-3 rounded-lg px-3 text-left text-[0.95rem] transition-colors',
                      on ? 'bg-surface font-bold text-ink shadow-lift' : 'text-ink/80 hover:bg-surface/70',
                    )}
                  >
                    {on && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-pen" aria-hidden />}
                    <Icon size={18} className={on ? 'text-pen' : 'text-muted'} />
                    {it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const route = useRoute();
  const { drawerOpen } = useUi();
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
        className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-sunken px-3 py-5 lg:flex"
        style={{ paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))', paddingTop: 'max(20px, env(safe-area-inset-top, 0px))' }}
      >
        <div className="px-2">
          <Logo />
        </div>
        <NavList />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar: phones and iPad portrait */}
        <div className="sticky z-30 border-b border-line bg-bg/95 backdrop-blur lg:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <div className="gutter flex h-14 items-center justify-between gap-3">
            <Logo />
            <button type="button" className="btn btn-ghost" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawerOpen}>
              <Menu size={22} />
            </button>
          </div>
        </div>

        <main className="gutter mx-auto w-full max-w-[1180px] pb-28 pt-6 lg:pb-12 lg:pt-8" id="main">
          {children}
        </main>

        {/* Bottom tabs: phones */}
        <nav
          aria-label="Quick"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden"
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
                    className={cx('flex h-[3.6rem] w-full flex-col items-center justify-center gap-0.5 text-[0.72rem] font-bold', on ? 'text-pen' : 'text-muted')}
                  >
                    <Icon size={21} />
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
            className="fade-in absolute bottom-0 left-0 top-0 flex w-[86%] max-w-[320px] flex-col gap-5 overflow-y-auto bg-sunken px-3 py-4 shadow-lift"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 0px))', paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))', paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex items-center justify-between px-2">
              <Logo />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDrawer(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <NavList onPick={() => setDrawer(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
