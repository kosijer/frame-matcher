/** Single image block in the layout (simulated, not uploaded) */
export interface ImageItem {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  overrideSize?: boolean;
}

/** Result of the grid packing algorithm (fixed image size, auto spacing) */
export interface GridLayoutResult {
  rows: number;
  columns: number;
  imageWidth: number;
  imageHeight: number;
  layout: number[]; // images per row, e.g. [4, 4, 3]
  /** Horizontal spacing (margins and gaps between images), mm */
  spacingH: number;
  /** Vertical spacing (margins and gaps between rows), mm */
  spacingV: number;
}

/** Row alignment for incomplete last row */
export type RowAlignment = 'left' | 'center' | 'right';

/** Vertical alignment of grid content in container */
export type VerticalAlignment = 'top' | 'center' | 'bottom';

/** Paper size definition for dropdown */
export interface PaperSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

/** Frame configuration */
export interface FrameConfig {
  frameThickness: number;
  frameWidth: number;
  frameHeight: number;
  matEnabled: boolean;
  matOpeningWidth: number;
  matOpeningHeight: number;
  frameColor: string;
  matColor: string;
}

/** Display toggles for preview */
export interface DisplayOptions {
  showMargins: boolean;
  showCenterAxis: boolean;
  showSpacingGuides: boolean;
}
