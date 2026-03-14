import { useMemo } from 'react';
import { useFrameStore } from '../store/useFrameStore';
import { ImageGrid } from './ImageGrid';

const PREVIEW_MAX = 420;

export function FramePreview() {
  const frameWidth = useFrameStore((s) => s.frameWidth);
  const frameHeight = useFrameStore((s) => s.frameHeight);
  const frameThickness = useFrameStore((s) => s.frameThickness);
  const matEnabled = useFrameStore((s) => s.matEnabled);
  const matOpeningWidth = useFrameStore((s) => s.matOpeningWidth);
  const matOpeningHeight = useFrameStore((s) => s.matOpeningHeight);
  const frameColor = useFrameStore((s) => s.frameColor);
  const matColor = useFrameStore((s) => s.matColor);

  const outerW = frameWidth + 2 * frameThickness;
  const outerH = frameHeight + 2 * frameThickness;
  const scale = useMemo(() => {
    const maxDim = Math.max(outerW, outerH);
    return maxDim > 0 ? PREVIEW_MAX / maxDim : 1;
  }, [outerW, outerH]);

  const frameW = outerW * scale;
  const frameH = outerH * scale;
  const thick = frameThickness * scale;
  const innerW = frameWidth * scale;
  const innerH = frameHeight * scale;

  const matW = matEnabled ? matOpeningWidth * scale : innerW;
  const matH = matEnabled ? matOpeningHeight * scale : innerH;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/60 p-8 shadow-inner">
      <div
        className="relative flex items-center justify-center rounded-lg shadow-md"
        style={{
          width: frameW,
          height: frameH,
          backgroundColor: frameColor,
        }}
      >
        {/* Frame border: inner cutout */}
        <div
          className="absolute rounded-sm"
          style={{
            left: thick,
            top: thick,
            width: innerW,
            height: innerH,
            backgroundColor: matEnabled ? matColor : '#fafafa',
          }}
        >
          {matEnabled && (
            <div
              className="absolute flex items-center justify-center overflow-hidden rounded-sm"
              style={{
                left: (innerW - matW) / 2,
                top: (innerH - matH) / 2,
                width: matW,
                height: matH,
                backgroundColor: '#f8f8f4',
              }}
            >
              <ImageGrid
                containerWidthMm={matOpeningWidth}
                containerHeightMm={matOpeningHeight}
                scale={scale}
              />
            </div>
          )}
          {!matEnabled && (
            <div className="flex h-full w-full items-center justify-center">
              <ImageGrid
                containerWidthMm={frameWidth}
                containerHeightMm={frameHeight}
                scale={scale}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
