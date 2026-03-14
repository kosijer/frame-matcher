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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Frame Layout Planner
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="w-full shrink-0 lg:w-80">
            <FrameControls />
          </aside>
          <section className="min-w-0 flex-1 space-y-6">
            <FramePreview />
            <LayoutInfo />
            <FrameSearch />
          </section>
        </div>
      </main>
      {import.meta.env.VITE_DEBUG === 'true' && <FrameSearchDebugPanel />}
    </div>
  );
}

export default App;
