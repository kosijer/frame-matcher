import { useState, useRef, useEffect } from 'react';
import type { ImageItem as ImageItemType } from '../types/types';
import { useFrameStore } from '../store/useFrameStore';

const PASTELS = [
  '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a5f3fc', '#bfdbfe', '#e9d5ff', '#fbcfe8',
];

interface ImageItemProps {
  item: ImageItemType;
  scale: number; // mm to px
}

export function ImageItem({ item, scale }: ImageItemProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [localW, setLocalW] = useState(item.width);
  const [localH, setLocalH] = useState(item.height);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setImageOverride = useFrameStore((s) => s.setImageOverride);
  const resetImageSize = useFrameStore((s) => s.resetImageSize);
  const setEditingImageId = useFrameStore((s) => s.setEditingImageId);
  const editingImageId = useFrameStore((s) => s.editingImageId);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const color = PASTELS[item.id.split('-').reduce((a, c) => a + c.charCodeAt(0), 0) % PASTELS.length];
  const w = item.width * scale;
  const h = item.height * scale;
  const x = item.x * scale;
  const y = item.y * scale;

  const handleDoubleClick = () => {
    setShowEditor(true);
    setEditingImageId(item.id);
    setLocalW(item.width);
    setLocalH(item.height);
  };

  const handleApply = () => {
    setImageOverride(item.id, localW, localH);
    setShowEditor(false);
    setEditingImageId(null);
  };

  const handleReset = () => {
    resetImageSize(item.id);
    setShowEditor(false);
    setEditingImageId(null);
  };

  const handleClose = () => {
    setShowEditor(false);
    setEditingImageId(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onDoubleClick={handleDoubleClick}
        className="absolute flex items-center justify-center overflow-hidden rounded border border-gray-300/80 shadow-sm transition hover:border-gray-400"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          backgroundColor: color,
          minWidth: 4,
          minHeight: 4,
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="pointer-events-none select-none text-center text-[10px] font-medium text-gray-600">
            {Math.round(item.width)} × {Math.round(item.height)}
          </span>
        )}
      </div>
      {showEditor && editingImageId === item.id && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/30"
          onClick={handleClose}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-3 text-sm font-semibold">Custom size (mm)</h4>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Width</label>
                  <input
                    type="number"
                    value={localW}
                    onChange={(e) => setLocalW(Number(e.target.value))}
                    min={1}
                    className="ml-2 w-24 rounded border px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Height</label>
                  <input
                    type="number"
                    value={localH}
                    onChange={(e) => setLocalH(Number(e.target.value))}
                    min={1}
                    className="ml-2 w-24 rounded border px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Preview image (optional)</label>
                <p className="text-xs text-gray-500 mb-1">Not saved — for layout preview only.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Upload image
                  </button>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={clearPreview}
                      className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {previewUrl && (
                  <div className="mt-2 h-32 w-full overflow-hidden rounded border border-gray-200 bg-gray-100">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
