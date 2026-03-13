import { useFrameStore } from '../store/useFrameStore';
import { ImageItem } from './ImageItem';
import { SpacingGuideOverlays } from './SpacingGuideOverlays';

interface ImageGridProps {
  containerWidthMm: number;
  containerHeightMm: number;
  scale: number;
}

export function ImageGrid({ containerWidthMm, containerHeightMm, scale }: ImageGridProps) {
  const images = useFrameStore((s) => s.images);
  const showCenterAxis = useFrameStore((s) => s.showCenterAxis);
  const showMargins = useFrameStore((s) => s.showMargins);
  const showSpacingGuides = useFrameStore((s) => s.showSpacingGuides);
  const gridResult = useFrameStore((s) => s.gridResult);

  const w = containerWidthMm * scale;
  const h = containerHeightMm * scale;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: w, height: h }}
    >
      {showCenterAxis && (
        <>
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400/60"
            style={{ left: w / 2 }}
          />
          <div
            className="absolute left-0 right-0 h-px bg-red-400/60"
            style={{ top: h / 2 }}
          />
        </>
      )}
      {showMargins && gridResult && (
        <div
          className="pointer-events-none absolute border border-dashed border-amber-400/50"
          style={{
            left: 0,
            top: 0,
            width: w,
            height: h,
          }}
        />
      )}
      {showSpacingGuides && gridResult && (
        <SpacingGuideOverlays
          images={images}
          gridResult={gridResult}
          scale={scale}
        />
      )}
      {images.map((item) => (
        <ImageItem key={item.id} item={item} scale={scale} />
      ))}
    </div>
  );
}
