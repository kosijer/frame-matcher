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
    <div className="mt-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span>Frame:</span>
        <span>{frameWidth} × {frameHeight} mm</span>
        {matEnabled && (
          <>
            <span>Mat:</span>
            <span>{matOpeningWidth} × {matOpeningHeight} mm</span>
          </>
        )}
        <span>Images:</span>
        <span>{Math.round(imageWidth * 10) / 10} × {Math.round(imageHeight * 10) / 10} mm</span>
        <span>Grid:</span>
        <span>{rows} rows × {columns} columns</span>
        <span>Spacing (H):</span>
        <span>{Math.round(spacingH * 10) / 10} mm</span>
        <span>Spacing (V):</span>
        <span>{Math.round(spacingV * 10) / 10} mm</span>
      </div>
    </div>
  );
}
