import { create } from 'zustand';
import type { GridLayoutResult, ImageItem, RowAlignment, VerticalAlignment } from '../types/types';
import { computeGridLayout } from '../algorithms/gridPacking';
import { getRowOffsetByWidth } from '../utils/layoutMath';
import {
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_FRAME_THICKNESS,
} from '../constants/paperSizes';

const DEFAULT_FRAME_WIDTH = 297;
const DEFAULT_FRAME_HEIGHT = 420;
const DEFAULT_MAT_OPENING_WIDTH = 210;
const DEFAULT_MAT_OPENING_HEIGHT = 297;

interface FrameState {
  frameThickness: number;
  frameWidth: number;
  frameHeight: number;
  matEnabled: boolean;
  matOpeningWidth: number;
  matOpeningHeight: number;
  frameColor: string;
  matColor: string;
  defaultImageWidth: number;
  defaultImageHeight: number;
  imageCount: number;
  rowAlignment: RowAlignment;
  verticalAlignment: VerticalAlignment;
  images: ImageItem[];
  selectedPaperId: string | null;
  showMargins: boolean;
  showCenterAxis: boolean;
  showSpacingGuides: boolean;
  editingImageId: string | null;
  gridResult: GridLayoutResult | null;
  containerSize: { width: number; height: number };
}

interface FrameActions {
  setFrameThickness: (v: number) => void;
  setFrameSize: (w: number, h: number) => void;
  setMatEnabled: (v: boolean) => void;
  setMatOpening: (w: number, h: number) => void;
  setFrameColor: (v: string) => void;
  setMatColor: (v: string) => void;
  setDefaultImageSize: (w: number, h: number) => void;
  setImageCount: (n: number) => void;
  setRowAlignment: (v: RowAlignment) => void;
  setVerticalAlignment: (v: VerticalAlignment) => void;
  setSelectedPaperId: (id: string | null) => void;
  setShowMargins: (v: boolean) => void;
  setShowCenterAxis: (v: boolean) => void;
  setShowSpacingGuides: (v: boolean) => void;
  setEditingImageId: (id: string | null) => void;
  setImageOverride: (id: string, width: number, height: number) => void;
  resetImageSize: (id: string) => void;
  rotateLayout: () => void;
  rotateImageSize: () => void;
  clampImageCountToFit: () => void;
  recalcLayout: () => void;
}

function createInitialImages(count: number, w: number, h: number): ImageItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `img-${i}-${Date.now()}`,
    width: w,
    height: h,
    x: 0,
    y: 0,
    overrideSize: false,
  }));
}

export const useFrameStore = create<FrameState & FrameActions>((set, get) => ({
  frameThickness: DEFAULT_FRAME_THICKNESS,
  frameWidth: DEFAULT_FRAME_WIDTH,
  frameHeight: DEFAULT_FRAME_HEIGHT,
  matEnabled: false,
  matOpeningWidth: DEFAULT_MAT_OPENING_WIDTH,
  matOpeningHeight: DEFAULT_MAT_OPENING_HEIGHT,
  frameColor: '#1a1a1a',
  matColor: '#f5f5f0',
  defaultImageWidth: DEFAULT_IMAGE_WIDTH,
  defaultImageHeight: DEFAULT_IMAGE_HEIGHT,
  imageCount: 1,
  rowAlignment: 'center',
  verticalAlignment: 'center',
  images: createInitialImages(1, DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT),
  selectedPaperId: 'a3',
  showMargins: true,
  showCenterAxis: false,
  showSpacingGuides: false,
  editingImageId: null,
  gridResult: null,
  containerSize: { width: 0, height: 0 },

  setFrameThickness: (v) => {
    set({ frameThickness: Math.max(1, Math.min(80, v)) });
    get().clampImageCountToFit();
    get().recalcLayout();
  },
  setFrameSize: (w, h) => {
    set({ frameWidth: w, frameHeight: h });
    get().clampImageCountToFit();
    get().recalcLayout();
  },
  setMatEnabled: (v) => {
    set({ matEnabled: v });
    get().clampImageCountToFit();
    get().recalcLayout();
  },
  setMatOpening: (w, h) => {
    set({ matOpeningWidth: w, matOpeningHeight: h });
    get().clampImageCountToFit();
    get().recalcLayout();
  },
  setFrameColor: (v) => set({ frameColor: v }),
  setMatColor: (v) => set({ matColor: v }),
  setDefaultImageSize: (w, h) => {
    const width = Math.max(1, w);
    const height = Math.max(1, h);
    set({ defaultImageWidth: width, defaultImageHeight: height });
    get().clampImageCountToFit();
    get().recalcLayout();
  },
  setImageCount: (n) => {
    const s = get();
    const containerWidth = s.matEnabled ? s.matOpeningWidth : s.frameWidth;
    const containerHeight = s.matEnabled ? s.matOpeningHeight : s.frameHeight;
    const maxFit =
      Math.floor(containerWidth / s.defaultImageWidth) *
      Math.floor(containerHeight / s.defaultImageHeight);
    const count = Math.max(
      1,
      Math.min(100, Math.round(n), Math.max(1, maxFit))
    );
    const prev = s.images;
    const defW = s.defaultImageWidth;
    const defH = s.defaultImageHeight;
    let next: ImageItem[];
    if (count > prev.length) {
      next = [...prev];
      for (let i = prev.length; i < count; i++) {
        next.push({
          id: `img-${i}-${Date.now()}`,
          width: defW,
          height: defH,
          x: 0,
          y: 0,
          overrideSize: false,
        });
      }
    } else {
      next = prev.slice(0, count);
    }
    set({ imageCount: count, images: next });
    get().recalcLayout();
  },
  setRowAlignment: (v) => {
    set({ rowAlignment: v });
    get().recalcLayout();
  },
  setVerticalAlignment: (v) => {
    set({ verticalAlignment: v });
    get().recalcLayout();
  },
  setSelectedPaperId: (id) => set({ selectedPaperId: id }),
  setShowMargins: (v) => set({ showMargins: v }),
  setShowCenterAxis: (v) => set({ showCenterAxis: v }),
  setShowSpacingGuides: (v) => set({ showSpacingGuides: v }),
  setEditingImageId: (id) => set({ editingImageId: id }),
  setImageOverride: (id, width, height) => {
    set((s) => {
      const next = s.images.map((img) =>
        img.id === id ? { ...img, width, height, overrideSize: true } : img
      );
      const singleImageSync =
        s.imageCount === 1
          ? { defaultImageWidth: width, defaultImageHeight: height }
          : {};
      return { images: next, ...singleImageSync };
    });
    get().recalcLayout();
  },
  resetImageSize: (id) => {
    const defW = get().defaultImageWidth;
    const defH = get().defaultImageHeight;
    set((s) => ({
      images: s.images.map((img) =>
        img.id === id ? { ...img, overrideSize: false, width: defW, height: defH } : img
      ),
    }));
    get().recalcLayout();
  },
  rotateLayout: () => {
    const s = get();
    set({
      frameWidth: s.frameHeight,
      frameHeight: s.frameWidth,
      matOpeningWidth: s.matOpeningHeight,
      matOpeningHeight: s.matOpeningWidth,
      selectedPaperId: null,
    });
    get().recalcLayout();
  },
  rotateImageSize: () => {
    const s = get();
    set({
      defaultImageWidth: s.defaultImageHeight,
      defaultImageHeight: s.defaultImageWidth,
    });
    get().clampImageCountToFit();
    get().recalcLayout();
  },
  clampImageCountToFit: () => {
    const s = get();
    const containerWidth = s.matEnabled ? s.matOpeningWidth : s.frameWidth;
    const containerHeight = s.matEnabled ? s.matOpeningHeight : s.frameHeight;
    const maxFit =
      Math.floor(containerWidth / s.defaultImageWidth) *
      Math.floor(containerHeight / s.defaultImageHeight);
    const maxCount = Math.max(1, Math.min(100, maxFit));
    if (s.imageCount > maxCount) {
      set({
        imageCount: maxCount,
        images: s.images.slice(0, maxCount),
      });
    }
  },
  recalcLayout: () => {
    const s = get();
    const containerWidth = s.matEnabled ? s.matOpeningWidth : s.frameWidth;
    const containerHeight = s.matEnabled ? s.matOpeningHeight : s.frameHeight;
    const result = computeGridLayout(
      s.imageCount,
      containerWidth,
      containerHeight,
      s.defaultImageWidth,
      s.defaultImageHeight
    );
    const overrides = new Map(
      s.images.filter((i) => i.overrideSize).map((i) => [i.id, { w: i.width, h: i.height }])
    );
    const getWidth = (img: ImageItem) => overrides.get(img.id)?.w ?? s.defaultImageWidth;
    const getHeight = (img: ImageItem) => overrides.get(img.id)?.h ?? s.defaultImageHeight;
    const newImages: ImageItem[] = [];
    let idx = 0;
    const { layout, imageHeight, spacingH, spacingV } = result;
    const totalGridHeight =
      result.rows * imageHeight + (result.rows - 1) * spacingV;
    // Row y = spacingV + row*(imageHeight+spacingV) + vertOffset, so grid top is at spacingV + vertOffset
    const vertOffset =
      s.verticalAlignment === 'top'
        ? 0
        : s.verticalAlignment === 'bottom'
          ? containerHeight - totalGridHeight - spacingV
          : (containerHeight - totalGridHeight) / 2 - spacingV;
    for (let row = 0; row < result.rows; row++) {
      const countInRow = layout[row] ?? 0;
      const rowStartIdx = idx;
      const rowWidths: number[] = [];
      for (let col = 0; col < countInRow; col++) {
        const img = s.images[idx];
        if (!img) break;
        rowWidths.push(getWidth(img));
        idx++;
      }
      const actualRowWidth =
        rowWidths.reduce((a, w) => a + w, 0) + (countInRow - 1) * spacingH;
      const rowOffset = getRowOffsetByWidth(
        actualRowWidth,
        s.rowAlignment,
        containerWidth
      );
      idx = rowStartIdx;
      let x = rowOffset;
      for (let col = 0; col < countInRow; col++) {
        const img = s.images[idx];
        if (!img) break;
        const w = getWidth(img);
        const h = getHeight(img);
        const y = spacingV + row * (imageHeight + spacingV) + vertOffset;
        newImages.push({
          ...img,
          x,
          y,
          width: w,
          height: h,
          overrideSize: !!overrides.get(img.id),
        });
        x += w + spacingH;
        idx++;
      }
    }
    set({
      images: newImages,
      gridResult: result,
      containerSize: { width: containerWidth, height: containerHeight },
    });
  },
}));
