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
  Mic,
  NotebookPen,
  PenLine,
  PieChart,
  Settings,
  SpellCheck,
  Timer,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { StrandId } from '../types';

export interface NavItem {
  route: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  strand?: StrandId;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: 'My course',
    items: [
      { route: 'home', label: 'Today', icon: Home },
      { route: 'course', label: 'Learning path', icon: GraduationCap },
      { route: 'blueprint', label: 'Course blueprint', icon: Compass },
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
    title: 'Track & review',
    items: [
      { route: 'reflections', label: 'Reflection Log', icon: NotebookPen },
      { route: 'grades', label: 'KICA Gradebook', icon: BarChart3 },
      { route: 'exam', label: 'Mock Final Exam', icon: Timer },
      { route: 'glossary', label: 'Word Wall', icon: BookText },
      { route: 'settings', label: 'Settings & about', icon: Settings },
    ],
  },
];

export const TABS: NavItem[] = [
  { route: 'home', label: 'Today', icon: Home },
  { route: 'course', label: 'Path', icon: BookOpen },
  { route: 'tools', label: 'Tools', icon: LayoutGrid },
  { route: 'reflections', label: 'Reflect', icon: ClipboardList },
  { route: 'grades', label: 'Grades', icon: FileCheck2 },
];

/** Icon and strand for each route, used by page headers. */
export const ROUTE_META: Record<string, { icon: LucideIcon; strand?: StrandId }> = Object.fromEntries(
  NAV.flatMap((g) => g.items.map((it) => [it.route, { icon: it.icon, strand: g.strand }])),
);
ROUTE_META.tools = { icon: LayoutGrid };
ROUTE_META.task = { icon: Trophy };

/** Tailwind classes for the small icon tiles, per strand (or the primary colour). */
export const TILE: Record<StrandId | 'primary', { soft: string; text: string; solid: string }> = {
  A: { soft: 'bg-strandA/15', text: 'text-strandA', solid: 'bg-strandA text-surface' },
  B: { soft: 'bg-strandB/15', text: 'text-strandB', solid: 'bg-strandB text-surface' },
  C: { soft: 'bg-strandC/15', text: 'text-strandC', solid: 'bg-strandC text-surface' },
  D: { soft: 'bg-strandD/15', text: 'text-strandD', solid: 'bg-strandD text-surface' },
  primary: { soft: 'bg-primary/15', text: 'text-primary', solid: 'bg-primary text-onprimary' },
};
