import { useState } from 'react';
import type { ImageItem as ImageItemType } from '../types/types';
import type { GridLayoutResult } from '../types/types';

interface SpacingGuideOverlaysProps {
  images: ImageItemType[];
  gridResult: GridLayoutResult | null;
  scale: number;
}

export function SpacingGuideOverlays({
  images,
  gridResult,
  scale,
}: SpacingGuideOverlaysProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!gridResult || images.length === 0) return null;
  const { layout, spacingH, spacingV } = gridResult;
  const overlays: Array<{ left: number; top: number; width: number; height: number; label: string }> = [];
  let idx = 0;
  for (let row = 0; row < layout.length; row++) {
    const countInRow = layout[row] ?? 0;
    for (let col = 0; col < countInRow; col++) {
      const img = images[idx];
      if (!img) break;
      const x = img.x * scale;
      const y = img.y * scale;
      const w = img.width * scale;
      const h = img.height * scale;
      if (col < countInRow - 1) {
        overlays.push({
          left: x + w,
          top: y,
          width: Math.max(4, spacingH * scale),
          height: h,
          label: `${Math.round(spacingH * 10) / 10} mm`,
        });
      }
      if (row < layout.length - 1) {
        overlays.push({
          left: x,
          top: y + h,
          width: w,
          height: Math.max(4, spacingV * scale),
          label: `${Math.round(spacingV * 10) / 10} mm`,
        });
      }
      idx++;
    }
  }

  return (
    <>
      {overlays.map((zone, i) => (
        <div
          key={i}
          className="absolute z-10 cursor-default"
          style={{
            left: zone.left,
            top: zone.top,
            width: zone.width,
            height: zone.height,
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {hoveredIndex === i && (
            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap">
              Gap: {zone.label}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
