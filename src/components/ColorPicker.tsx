import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

const PRESETS = [
  '#1a1a1a',
  '#2d2d2d',
  '#4a4a4a',
  '#ffffff',
  '#f5f5f0',
  '#e8e4d9',
  '#d4af37',
  '#8b4513',
  '#2c1810',
  '#1e3a5f',
  '#4a5568',
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-8 w-12 rounded-md border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ backgroundColor: value }}
          title={value}
        />
        {open && (
          <div className="absolute z-10 mt-24 rounded-lg border border-border bg-card p-2 shadow-lg">
            <HexColorPicker color={value} onChange={onChange} />
            <div className="mt-2 flex flex-wrap gap-1">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); }}
                  className="h-5 w-5 rounded border border-border"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
