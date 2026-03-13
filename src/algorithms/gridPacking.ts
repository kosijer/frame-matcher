import type { GridLayoutResult } from '../types/types';

/**
 * Generate candidate (rows, columns) pairs for a given image count.
 * Prefer grids where rows and columns are close (square-ish).
 */
function getCandidateGrids(imageCount: number): Array<{ rows: number; columns: number }> {
  const pairs: Array<{ rows: number; columns: number }> = [];
  const maxRows = Math.min(imageCount, 100);
  for (let rows = 1; rows <= maxRows; rows++) {
    const columns = Math.ceil(imageCount / rows);
    pairs.push({ rows, columns });
  }
  const seen = new Set<string>();
  return pairs
    .filter(({ rows, columns }) => {
      const key = `${rows}x${columns}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const diffA = Math.abs(a.rows - a.columns);
      const diffB = Math.abs(b.rows - b.columns);
      return diffA - diffB;
    });
}

/**
 * Build layout array: number of images per row.
 */
function buildLayoutArray(rows: number, columns: number, imageCount: number): number[] {
  const layout: number[] = [];
  let remaining = imageCount;
  for (let r = 0; r < rows; r++) {
    const inThisRow = Math.min(columns, remaining);
    layout.push(inThisRow);
    remaining -= inThisRow;
  }
  return layout;
}

/**
 * Fixed image size layout: images are NOT resized. Spacing is computed so that
 * the grid fits in the container with equal margins and gaps.
 * spacingH = (containerWidth - columns*imageWidth) / (columns + 1)
 * spacingV = (containerHeight - rows*imageHeight) / (rows + 1)
 */
export function computeGridLayout(
  imageCount: number,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): GridLayoutResult {
  if (imageCount <= 0 || containerWidth <= 0 || containerHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return {
      rows: 1,
      columns: 1,
      imageWidth,
      imageHeight,
      layout: [0],
      spacingH: 0,
      spacingV: 0,
    };
  }

  if (imageCount === 1) {
    const spacingH = Math.max(0, (containerWidth - imageWidth) / 2);
    const spacingV = Math.max(0, (containerHeight - imageHeight) / 2);
    return {
      rows: 1,
      columns: 1,
      imageWidth,
      imageHeight,
      layout: [1],
      spacingH,
      spacingV,
    };
  }

  const candidates = getCandidateGrids(imageCount);
  let best: GridLayoutResult | null = null;
  let bestScore = -Infinity;

  for (const { rows, columns } of candidates) {
    const totalW = columns * imageWidth;
    const totalH = rows * imageHeight;
    const spacingH = (containerWidth - totalW) / (columns + 1);
    const spacingV = (containerHeight - totalH) / (rows + 1);
    if (spacingH < 0 || spacingV < 0) continue;

    const layout = buildLayoutArray(rows, columns, imageCount);
    const balance = Math.abs(rows - columns);
    const minSpacing = Math.min(spacingH, spacingV);
    const s = -balance * 1e6 + minSpacing;
    if (s > bestScore) {
      bestScore = s;
      best = { rows, columns, imageWidth, imageHeight, layout, spacingH, spacingV };
    }
  }

  if (!best) {
    const { rows, columns } = candidates[0] ?? { rows: 1, columns: imageCount };
    const totalW = columns * imageWidth;
    const totalH = rows * imageHeight;
    const spacingH = Math.max(0, (containerWidth - totalW) / (columns + 1));
    const spacingV = Math.max(0, (containerHeight - totalH) / (rows + 1));
    best = {
      rows,
      columns,
      imageWidth,
      imageHeight,
      layout: buildLayoutArray(rows, columns, imageCount),
      spacingH,
      spacingV,
    };
  }

  return best;
}
