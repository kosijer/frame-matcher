import {
  Minus,
  Plus,
  RotateCw,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react';
import { useFrameStore } from '../store/useFrameStore';
import { SizeSelector } from './SizeSelector';
import { ColorPicker } from './ColorPicker';
import { UnitConverter } from './UnitConverter';
import { HelpTooltip } from './HelpTooltip';

const MAX_FRAME_THICKNESS = 80;

export function FrameControls() {
  const frameWidth = useFrameStore((s) => s.frameWidth);
  const frameHeight = useFrameStore((s) => s.frameHeight);
  const frameThickness = useFrameStore((s) => s.frameThickness);
  const matEnabled = useFrameStore((s) => s.matEnabled);
  const matOpeningWidth = useFrameStore((s) => s.matOpeningWidth);
  const matOpeningHeight = useFrameStore((s) => s.matOpeningHeight);
  const defaultImageWidth = useFrameStore((s) => s.defaultImageWidth);
  const defaultImageHeight = useFrameStore((s) => s.defaultImageHeight);
  const imageCount = useFrameStore((s) => s.imageCount);
  const rowAlignment = useFrameStore((s) => s.rowAlignment);
  const verticalAlignment = useFrameStore((s) => s.verticalAlignment);
  const gridResult = useFrameStore((s) => s.gridResult);
  const frameColor = useFrameStore((s) => s.frameColor);
  const matColor = useFrameStore((s) => s.matColor);
  const showMargins = useFrameStore((s) => s.showMargins);
  const showCenterAxis = useFrameStore((s) => s.showCenterAxis);
  const showSpacingGuides = useFrameStore((s) => s.showSpacingGuides);

  const setFrameThickness = useFrameStore((s) => s.setFrameThickness);
  const setFrameSize = useFrameStore((s) => s.setFrameSize);
  const setMatEnabled = useFrameStore((s) => s.setMatEnabled);
  const setMatOpening = useFrameStore((s) => s.setMatOpening);
  const setDefaultImageSize = useFrameStore((s) => s.setDefaultImageSize);
  const setImageCount = useFrameStore((s) => s.setImageCount);
  const setRowAlignment = useFrameStore((s) => s.setRowAlignment);
  const setVerticalAlignment = useFrameStore((s) => s.setVerticalAlignment);
  const setShowMargins = useFrameStore((s) => s.setShowMargins);
  const setShowCenterAxis = useFrameStore((s) => s.setShowCenterAxis);
  const setShowSpacingGuides = useFrameStore((s) => s.setShowSpacingGuides);
  const setFrameColor = useFrameStore((s) => s.setFrameColor);
  const setMatColor = useFrameStore((s) => s.setMatColor);
  const rotateLayout = useFrameStore((s) => s.rotateLayout);
  const rotateImageSize = useFrameStore((s) => s.rotateImageSize);

  const containerWidth = matEnabled ? matOpeningWidth : frameWidth - 2 * frameThickness;
  const containerHeight = matEnabled ? matOpeningHeight : frameHeight - 2 * frameThickness;
  const maxImageCount = Math.max(
    1,
    Math.min(
      100,
      Math.floor(containerWidth / defaultImageWidth) *
        Math.floor(containerHeight / defaultImageHeight)
    )
  );
  const maxThickness = Math.min(
    MAX_FRAME_THICKNESS,
    (frameWidth - 20) / 2,
    (frameHeight - 20) / 2
  );
  const showVerticalAlignment = (gridResult?.rows ?? 0) > 1;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Controls</h2>

      {/* ——— Frame ——— */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 border-b border-gray-200 pb-2 text-sm font-medium text-gray-700">
          Frame
          <HelpTooltip content="Outer dimensions and border thickness of the physical frame. Use the rotate icon to switch portrait/landscape." />
        </div>
        <SizeSelector />
        <div className="flex items-end gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Width (mm)</label>
              <input
                type="number"
                value={frameWidth}
                onChange={(e) => setFrameSize(Number(e.target.value), frameHeight)}
                min={10}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Height (mm)</label>
              <input
                type="number"
                value={frameHeight}
                onChange={(e) => setFrameSize(frameWidth, Number(e.target.value))}
                min={10}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={rotateLayout}
            title="Swap frame and mat (portrait / landscape)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Frame thickness (mm, max {Math.floor(maxThickness)})
          </label>
          <input
            type="number"
            value={frameThickness}
            onChange={(e) => setFrameThickness(Number(e.target.value))}
            min={1}
            max={Math.max(1, Math.floor(maxThickness))}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="relative">
          <ColorPicker label="Frame color" value={frameColor} onChange={setFrameColor} />
        </div>
      </div>

      {/* ——— Mat board ——— */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-1 border-b border-gray-200 pb-2 text-sm font-medium text-gray-700">
          Mat board (passe-partout)
          <HelpTooltip content="The mat creates a border between the frame and the images. Mat opening is the visible area where photos sit." />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="matEnabled"
            checked={matEnabled}
            onChange={(e) => setMatEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="matEnabled" className="text-sm font-medium text-gray-700">
            Enable mat board
          </label>
        </div>
        {matEnabled && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Mat opening W (mm)</label>
                <input
                  type="number"
                  value={matOpeningWidth}
                  onChange={(e) => setMatOpening(Number(e.target.value), matOpeningHeight)}
                  min={1}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mat opening H (mm)</label>
                <input
                  type="number"
                  value={matOpeningHeight}
                  onChange={(e) => setMatOpening(matOpeningWidth, Number(e.target.value))}
                  min={1}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="relative">
              <ColorPicker label="Mat color" value={matColor} onChange={setMatColor} />
            </div>
          </>
        )}
      </div>

      {/* ——— Images ——— */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-1 border-b border-gray-200 pb-2 text-sm font-medium text-gray-700">
          Images
          <HelpTooltip content="Default size for each photo. With one image, changing size in the preview (double-click) updates these fields. Add more images; spacing is computed automatically." />
        </div>
        <div className="flex items-end gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Photo width (mm)</label>
              <input
                type="number"
                value={defaultImageWidth}
                onChange={(e) => setDefaultImageSize(Number(e.target.value), defaultImageHeight)}
                min={1}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Photo height (mm)</label>
              <input
                type="number"
                value={defaultImageHeight}
                onChange={(e) => setDefaultImageSize(defaultImageWidth, Number(e.target.value))}
                min={1}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={rotateImageSize}
            title="Swap photo dimensions (portrait / landscape)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Image count</label>
          <p className="text-xs text-gray-500">Max that fit without cutting: {maxImageCount}</p>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImageCount(imageCount - 1)}
              disabled={imageCount <= 1}
              className="rounded border border-gray-300 bg-white p-1.5 hover:bg-gray-50 disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              min={1}
              max={maxImageCount}
              className="w-20 rounded border border-gray-300 px-2 py-1.5 text-center text-sm"
            />
            <button
              type="button"
              onClick={() => setImageCount(imageCount + 1)}
              disabled={imageCount >= maxImageCount}
              className="rounded border border-gray-300 bg-white p-1.5 hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Row alignment</label>
          <select
            value={rowAlignment}
            onChange={(e) => setRowAlignment(e.target.value as 'left' | 'center' | 'right')}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        {showVerticalAlignment && (
          <div>
            <label className="text-sm font-medium text-gray-700">Vertical position</label>
            <div className="mt-1 flex gap-1">
              <button
                type="button"
                onClick={() => setVerticalAlignment('top')}
                title="Align grid to top"
                className={`flex h-9 w-9 items-center justify-center rounded border ${
                  verticalAlignment === 'top'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlignStartVertical className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVerticalAlignment('center')}
                title="Center grid vertically"
                className={`flex h-9 w-9 items-center justify-center rounded border ${
                  verticalAlignment === 'center'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlignCenterVertical className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVerticalAlignment('bottom')}
                title="Align grid to bottom"
                className={`flex h-9 w-9 items-center justify-center rounded border ${
                  verticalAlignment === 'bottom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlignEndVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ——— Display ——— */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <span className="text-sm font-medium text-gray-700">Display</span>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showMargins}
              onChange={(e) => setShowMargins(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show margins</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCenterAxis}
              onChange={(e) => setShowCenterAxis(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show center axis</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSpacingGuides}
              onChange={(e) => setShowSpacingGuides(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show spacing guides</span>
            <HelpTooltip content="When enabled, hover between two images in the preview to see the gap size in mm." className="ml-0.5" />
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <UnitConverter />
      </div>
    </div>
  );
}
