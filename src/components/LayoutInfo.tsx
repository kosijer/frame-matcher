import { useFrameStore } from '../store/useFrameStore';

export function LayoutInfo() {
  const frameWidth = useFrameStore((s) => s.frameWidth);
  const frameHeight = useFrameStore((s) => s.frameHeight);
  const matEnabled = useFrameStore((s) => s.matEnabled);
  const matOpeningWidth = useFrameStore((s) => s.matOpeningWidth);
  const matOpeningHeight = useFrameStore((s) => s.matOpeningHeight);
  const gridResult = useFrameStore((s) => s.gridResult);

  if (!gridResult) return null;

  const { rows, columns, imageWidth, imageHeight, spacingH, spacingV } = gridResult;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-muted-foreground">
        <span className="font-medium text-foreground">Frame</span>
        <span>{frameWidth} × {frameHeight} mm</span>
        {matEnabled && (
          <>
            <span className="font-medium text-foreground">Mat</span>
            <span>{matOpeningWidth} × {matOpeningHeight} mm</span>
          </>
        )}
        <span className="font-medium text-foreground">Images</span>
        <span>{Math.round(imageWidth * 10) / 10} × {Math.round(imageHeight * 10) / 10} mm</span>
        <span className="font-medium text-foreground">Grid</span>
        <span>{rows} rows × {columns} columns</span>
        <span className="font-medium text-foreground">Spacing (H)</span>
        <span>{Math.round(spacingH * 10) / 10} mm</span>
        <span className="font-medium text-foreground">Spacing (V)</span>
        <span>{Math.round(spacingV * 10) / 10} mm</span>
      </div>
    </div>
  );
}
