import { useState } from 'react';
import { mmToInches, inchesToMm } from '../utils/conversions';

export function UnitConverter() {
  const [mm, setMm] = useState<string>('');
  const [inches, setInches] = useState<string>('');

  const handleMmChange = (v: string) => {
    setMm(v);
    const n = parseFloat(v);
    if (!Number.isNaN(n)) setInches(mmToInches(n).toFixed(4));
    else setInches('');
  };

  const handleInchesChange = (v: string) => {
    setInches(v);
    const n = parseFloat(v);
    if (!Number.isNaN(n)) setMm(inchesToMm(n).toFixed(2));
    else setMm('');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <h3 className="mb-2 text-sm font-semibold text-gray-800">Unit converter</h3>
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-xs text-gray-600">mm</label>
          <input
            type="number"
            value={mm}
            onChange={(e) => handleMmChange(e.target.value)}
            placeholder="0"
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">inches</label>
          <input
            type="number"
            value={inches}
            onChange={(e) => handleInchesChange(e.target.value)}
            placeholder="0"
            step="0.01"
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
