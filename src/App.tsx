import { useEffect } from 'react';
import { FrameControls } from './components/FrameControls';
import { FramePreview } from './components/FramePreview';
import { FrameSearch } from './components/FrameSearch';
import { FrameSearchDebugPanel } from './components/FrameSearchDebugPanel';
import { LayoutInfo } from './components/LayoutInfo';
import { useFrameStore } from './store/useFrameStore';

function App() {
  const recalcLayout = useFrameStore((s) => s.recalcLayout);

  useEffect(() => {
    recalcLayout();
  }, [recalcLayout]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Frame Layout Planner</h1>
      </header>
      <main className="flex gap-6 p-6">
        <aside className="w-80 shrink-0">
          <FrameControls />
        </aside>
        <section className="min-w-0 flex-1">
          <FramePreview />
          <LayoutInfo />
          <FrameSearch />
        </section>
      </main>
      {import.meta.env.VITE_DEBUG === 'true' && <FrameSearchDebugPanel />}
    </div>
  );
}

export default App;
