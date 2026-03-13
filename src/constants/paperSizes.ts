import type { PaperSize } from '../types/types';

/** Standard A, B, and C paper formats (dimensions in mm) */
export const PAPER_SIZES: PaperSize[] = [
  // A series
  { id: 'a0', name: 'A0', width: 841, height: 1189 },
  { id: 'a1', name: 'A1', width: 594, height: 841 },
  { id: 'a2', name: 'A2', width: 420, height: 594 },
  { id: 'a3', name: 'A3', width: 297, height: 420 },
  { id: 'a4', name: 'A4', width: 210, height: 297 },
  { id: 'a5', name: 'A5', width: 148, height: 210 },
  { id: 'a6', name: 'A6', width: 105, height: 148 },
  // B series
  { id: 'b0', name: 'B0', width: 1000, height: 1414 },
  { id: 'b1', name: 'B1', width: 707, height: 1000 },
  { id: 'b2', name: 'B2', width: 500, height: 707 },
  { id: 'b3', name: 'B3', width: 353, height: 500 },
  { id: 'b4', name: 'B4', width: 250, height: 353 },
  { id: 'b5', name: 'B5', width: 176, height: 250 },
  { id: 'b6', name: 'B6', width: 125, height: 176 },
  // C series
  { id: 'c0', name: 'C0', width: 917, height: 1297 },
  { id: 'c1', name: 'C1', width: 648, height: 917 },
  { id: 'c2', name: 'C2', width: 458, height: 648 },
  { id: 'c3', name: 'C3', width: 324, height: 458 },
  { id: 'c4', name: 'C4', width: 229, height: 324 },
  { id: 'c5', name: 'C5', width: 162, height: 229 },
  { id: 'c6', name: 'C6', width: 114, height: 162 },
];

export const DEFAULT_IMAGE_WIDTH = 210;
export const DEFAULT_IMAGE_HEIGHT = 297;
export const DEFAULT_SPACING = 10;
export const DEFAULT_FRAME_THICKNESS = 15;
