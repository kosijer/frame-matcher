import type { RowAlignment } from '../types/types';

/**
 * Compute horizontal offset for a row based on its actual total width.
 * Used for both uniform rows and rows with overridden image widths.
 */
export function getRowOffsetByWidth(
  rowWidth: number,
  alignment: RowAlignment,
  containerWidth: number
): number {
  if (alignment === 'left') return 0;
  if (alignment === 'right') return containerWidth - rowWidth;
  return (containerWidth - rowWidth) / 2;
}

/**
 * Compute horizontal offset for the last (incomplete) row based on alignment.
 * Uses uniform image width (legacy / when no overrides).
 */
export function getRowOffset(
  itemsInRow: number,
  _maxColumns: number,
  imageWidth: number,
  spacing: number,
  alignment: RowAlignment,
  containerWidth: number
): number {
  const rowWidth = itemsInRow * imageWidth + (itemsInRow - 1) * spacing;
  return getRowOffsetByWidth(rowWidth, alignment, containerWidth);
}

/**
 * Compute margin (mat border) around the image area inside mat opening.
 * Assumes image grid is centered in container.
 */
export function getMargins(
  containerWidth: number,
  containerHeight: number,
  gridWidth: number,
  gridHeight: number
): { top: number; right: number; bottom: number; left: number } {
  const horizontalMargin = Math.max(0, (containerWidth - gridWidth) / 2);
  const verticalMargin = Math.max(0, (containerHeight - gridHeight) / 2);
  return {
    top: verticalMargin,
    right: horizontalMargin,
    bottom: verticalMargin,
    left: horizontalMargin,
  };
}
