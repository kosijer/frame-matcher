import { useState } from 'react';
import {
  Minus,
  Plus,
  RotateCw,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Ruler,
} from 'lucide-react';
import { useFrameStore } from '../store/useFrameStore';
import { SizeSelector } from './SizeSelector';
import { ColorPicker } from './ColorPicker';
import { UnitConverter } from './UnitConverter';
import { HelpTooltip } from './HelpTooltip';
import { Modal } from './Modal';

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

  const [unitConverterOpen, setUnitConverterOpen] = useState(false);

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

  const inputClass =
    'mt-1.5 h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';
  const labelClass = 'text-sm font-medium text-foreground';
  const sectionTitleClass = 'flex items-center gap-1.5 text-sm font-medium text-foreground';
  const iconBtnClass =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  const toggleActiveClass = 'border-primary bg-primary/10 text-primary';

  return (
    <>
      <div className="flex h-full flex-col gap-5 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Controls</h2>
          <button
            type="button"
            onClick={() => setUnitConverterOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Ruler className="h-3.5 w-3.5" aria-hidden />
            Convert mm ↔ in
          </button>
        </div>

        {/* Frame */}
        <section className="space-y-3">
          <div className={sectionTitleClass}>
            Frame
            <HelpTooltip content="Outer dimensions and border thickness of the physical frame. Use the rotate icon to switch portrait/landscape." />
          </div>
        <SizeSelector />
        <div className="flex items-end gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Width (mm)</label>
              <input
                type="number"
                value={frameWidth}
                onChange={(e) => setFrameSize(Number(e.target.value), frameHeight)}
                min={10}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Height (mm)</label>
              <input
                type="number"
                value={frameHeight}
                onChange={(e) => setFrameSize(frameWidth, Number(e.target.value))}
                min={10}
                className={inputClass}
              />
            </div>
          </div>
          <button type="button" onClick={rotateLayout} title="Swap frame and mat (portrait / landscape)" className={iconBtnClass}>
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className={labelClass}>Frame thickness (mm, max {Math.floor(maxThickness)})</label>
          <input
            type="number"
            value={frameThickness}
            onChange={(e) => setFrameThickness(Number(e.target.value))}
            min={1}
            max={Math.max(1, Math.floor(maxThickness))}
            className={inputClass}
          />
        </div>
        <div className="relative">
          <ColorPicker label="Frame color" value={frameColor} onChange={setFrameColor} />
        </div>
        </section>

        {/* Mat board */}
        <section className="space-y-3 border-t border-border pt-4">
          <div className={sectionTitleClass}>
            Mat board (passe-partout)
          <HelpTooltip content="The mat creates a border between the frame and the images. Mat opening is the visible area where photos sit." />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={matEnabled}
            onChange={(e) => setMatEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <span className="text-sm font-medium text-foreground">Enable mat board</span>
        </label>
        {matEnabled && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Mat opening W (mm)</label>
                <input
                  type="number"
                  value={matOpeningWidth}
                  onChange={(e) => setMatOpening(Number(e.target.value), matOpeningHeight)}
                  min={1}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mat opening H (mm)</label>
                <input
                  type="number"
                  value={matOpeningHeight}
                  onChange={(e) => setMatOpening(matOpeningWidth, Number(e.target.value))}
                  min={1}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="relative">
              <ColorPicker label="Mat color" value={matColor} onChange={setMatColor} />
            </div>
          </>
        )}
        </section>

        {/* Images */}
        <section className="space-y-3 border-t border-border pt-4">
          <div className={sectionTitleClass}>
            Images
          <HelpTooltip content="Default size for each photo. With one image, changing size in the preview (double-click) updates these fields. Add more images; spacing is computed automatically." />
        </div>
        <div className="flex items-end gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Photo width (mm)</label>
              <input
                type="number"
                value={defaultImageWidth}
                onChange={(e) => setDefaultImageSize(Number(e.target.value), defaultImageHeight)}
                min={1}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Photo height (mm)</label>
              <input
                type="number"
                value={defaultImageHeight}
                onChange={(e) => setDefaultImageSize(defaultImageWidth, Number(e.target.value))}
                min={1}
                className={inputClass}
              />
            </div>
          </div>
          <button type="button" onClick={rotateImageSize} title="Swap photo dimensions (portrait / landscape)" className={iconBtnClass}>
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className={labelClass}>Image count</label>
          <p className="mt-0.5 text-xs text-muted-foreground">Max that fit without cutting: {maxImageCount}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImageCount(imageCount - 1)}
              disabled={imageCount <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              min={1}
              max={maxImageCount}
              className="h-9 w-20 rounded-md border border-border bg-card px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <button
              type="button"
              onClick={() => setImageCount(imageCount + 1)}
              disabled={imageCount >= maxImageCount}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Row alignment</label>
          <select
            value={rowAlignment}
            onChange={(e) => setRowAlignment(e.target.value as 'left' | 'center' | 'right')}
            className={inputClass}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        {showVerticalAlignment && (
          <div>
            <label className={labelClass}>Vertical position</label>
            <div className="mt-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={() => setVerticalAlignment('top')}
                title="Align grid to top"
                className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  verticalAlignment === 'top' ? toggleActiveClass : 'border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <AlignStartVertical className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVerticalAlignment('center')}
                title="Center grid vertically"
                className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  verticalAlignment === 'center' ? toggleActiveClass : 'border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <AlignCenterVertical className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVerticalAlignment('bottom')}
                title="Align grid to bottom"
                className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  verticalAlignment === 'bottom' ? toggleActiveClass : 'border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <AlignEndVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        </section>

        {/* Display */}
        <section className="border-t border-border pt-4">
          <span className={sectionTitleClass}>Display</span>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showMargins}
                onChange={(e) => setShowMargins(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm text-muted-foreground">Margins</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showCenterAxis}
                onChange={(e) => setShowCenterAxis(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm text-muted-foreground">Center axis</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showSpacingGuides}
                onChange={(e) => setShowSpacingGuides(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm text-muted-foreground">Spacing guides</span>
              <HelpTooltip content="When enabled, hover between two images in the preview to see the gap size in mm." className="ml-0.5" />
            </label>
          </div>
        </section>
      </div>

      <Modal
        open={unitConverterOpen}
        onClose={() => setUnitConverterOpen(false)}
        title="Unit converter"
      >
        <UnitConverter />
      </Modal>
    </>
  );
}
