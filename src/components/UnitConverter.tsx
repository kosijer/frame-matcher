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
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-foreground">mm</label>
        <input
          type="number"
          value={mm}
          onChange={(e) => handleMmChange(e.target.value)}
          placeholder="0"
          className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">inches</label>
        <input
          type="number"
          value={inches}
          onChange={(e) => handleInchesChange(e.target.value)}
          placeholder="0"
          step="0.01"
          className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>
    </div>
  );
}
