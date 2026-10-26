import { useEffect } from 'react';
import Layout from './components/Layout';
import ReflectionModal from './components/ReflectionModal';
import { Confetti, StickerWatcher } from './components/Celebrate';
import { Sparkles } from 'lucide-react';
import { useRoute } from './lib/router';
import { useApp } from './store/store';
import { useUi } from './store/ui';
import Home from './pages/Home';
import CourseMap from './pages/CourseMap';
import LessonView from './pages/LessonView';
import MilestoneView from './pages/MilestoneView';
import Blueprint from './pages/Blueprint';
import ToolsHub from './pages/ToolsHub';
import Deconstructor from './pages/Deconstructor';
import GraphicLab from './pages/GraphicLab';
import Drills from './pages/Drills';
import PpeBuilder from './pages/PpeBuilder';
import CompareMatrix from './pages/CompareMatrix';
import ProcedureTester from './pages/ProcedureTester';
import Linter from './pages/Linter';
import ListeningPlayer from './pages/ListeningPlayer';
import SpeechStudio from './pages/SpeechStudio';
import HotspotAnalyzer from './pages/HotspotAnalyzer';
import PhotoEssay from './pages/PhotoEssay';
import Reflections from './pages/Reflections';
import Gradebook from './pages/Gradebook';
import MockExam from './pages/MockExam';
import Glossary from './pages/Glossary';
import SettingsPage from './pages/Settings';

function Page() {
  const { name, param } = useRoute();
  switch (name) {
    case 'course':
      return <CourseMap />;
    case 'lesson':
      return <LessonView id={param ?? '1-1'} />;
    case 'task':
      return <MilestoneView id={param ?? 'pt1'} />;
    case 'blueprint':
      return <Blueprint />;
    case 'tools':
      return <ToolsHub />;
    case 'reader':
      return <Deconstructor initial={param} />;
    case 'graphic':
      return <GraphicLab />;
    case 'drills':
      return <Drills initial={param} />;
    case 'ppe':
      return <PpeBuilder />;
    case 'compare':
      return <CompareMatrix />;
    case 'procedure':
      return <ProcedureTester initial={param} />;
    case 'linter':
      return <Linter />;
    case 'listening':
      return <ListeningPlayer initial={param} />;
    case 'speech':
      return <SpeechStudio />;
    case 'hotspot':
      return <HotspotAnalyzer initial={param} />;
    case 'photo':
      return <PhotoEssay />;
    case 'reflections':
      return <Reflections />;
    case 'grades':
      return <Gradebook />;
    case 'exam':
      return <MockExam />;
    case 'glossary':
      return <Glossary />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <Home />;
  }
}

export default function App() {
  const { settings } = useApp();
  const { toast } = useUi();
  const route = useRoute();

  useEffect(() => {
    // Only touch data-theme when the user picked one here, so a host page's own theme still wins on "Match device".
    const root = document.documentElement;
    if (settings.theme === 'system') {
      if (root.dataset.appTheme) {
        root.removeAttribute('data-theme');
        delete root.dataset.appTheme;
      }
    } else {
      root.setAttribute('data-theme', settings.theme);
      root.dataset.appTheme = '1';
    }
  }, [settings.theme]);

  return (
    <Layout>
      <div key={route.name + (route.param ?? '')} className="fade-in">
        <Page />
      </div>
      <ReflectionModal />
      <StickerWatcher />
      <Confetti />
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="pop-in fixed left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-extrabold text-surface shadow-lift"
          style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Sparkles size={16} className="text-sun" />
          {toast.text}
        </div>
      )}
    </Layout>
  );
}
