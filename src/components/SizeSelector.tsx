import { PAPER_SIZES } from '../constants/paperSizes';
import { useFrameStore } from '../store/useFrameStore';

export function SizeSelector() {
  const selectedPaperId = useFrameStore((s) => s.selectedPaperId);
  const setFrameSize = useFrameStore((s) => s.setFrameSize);
  const setSelectedPaperId = useFrameStore((s) => s.setSelectedPaperId);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Frame size (paper)</label>
      <select
        value={selectedPaperId ?? ''}
        onChange={(e) => {
          const id = e.target.value || null;
          setSelectedPaperId(id);
          if (id) {
            const paper = PAPER_SIZES.find((p) => p.id === id);
            if (paper) setFrameSize(paper.width, paper.height);
          }
        }}
        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Custom</option>
        {PAPER_SIZES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.width} × {p.height} mm
          </option>
        ))}
      </select>
    </div>
  );
}
