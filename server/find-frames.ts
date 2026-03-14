/**
 * Calls Gemini API with Google Search grounding to find picture frames
 * on eBay UK and Amazon UK matching the given dimensions.
 */

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface FrameSearchResult {
  title: string;
  url: string;
  reason: string;
  /** Frame outer size in mm when known (for UI preview) */
  widthMm?: number;
  heightMm?: number;
}

export interface FindFramesParams {
  frameWidth: number;
  frameHeight: number;
  /** Optional: mat opening (visible area) in mm – used to suggest smaller frames that could fit the photo with a mat */
  matOpeningWidth?: number;
  matOpeningHeight?: number;
  /** Optional: default photo/image size in mm – if provided, suggest frames where this would fit (e.g. with mat) */
  defaultImageWidth?: number;
  defaultImageHeight?: number;
  /** Optional: also search eBay UK (default false = Amazon only) */
  includeEbay?: boolean;
  /** Optional: also search Etsy UK */
  includeEtsy?: boolean;
  /** Optional: also search AliExpress UK */
  includeAliExpress?: boolean;
}

export interface FindFramesResponse {
  results: FrameSearchResult[];
  prompt: string;
}

export async function findFrames(
  params: FindFramesParams,
  apiKey: string
): Promise<FindFramesResponse> {
  const {
    frameWidth,
    frameHeight,
    matOpeningWidth,
    matOpeningHeight,
    defaultImageWidth,
    defaultImageHeight,
    includeEbay = false,
    includeEtsy = false,
    includeAliExpress = false,
  } = params;

  // Ignore orientation: use canonical (smaller × larger) so 458×324 and 324×458 produce the same search.
  const canonicalWidth = Math.min(frameWidth, frameHeight);
  const canonicalHeight = Math.max(frameWidth, frameHeight);
  const photoMin = defaultImageWidth != null && defaultImageHeight != null ? Math.min(defaultImageWidth, defaultImageHeight) : null;
  const photoMax = defaultImageWidth != null && defaultImageHeight != null ? Math.max(defaultImageWidth, defaultImageHeight) : null;

  const cmSmall = Math.round(canonicalWidth / 10);
  const cmLarge = Math.round(canonicalHeight / 10);
  const hasPhotoSize = defaultImageWidth != null && defaultImageHeight != null && defaultImageWidth > 0 && defaultImageHeight > 0;
  const frameEqualsImage =
    hasPhotoSize &&
    canonicalWidth === (defaultImageWidth ?? 0) &&
    canonicalHeight === (defaultImageHeight ?? 0);

  const targetFrameDesc = `${canonicalWidth}×${canonicalHeight} mm (${cmSmall}×${cmLarge} cm)`;
  const imageDesc = hasPhotoSize
    ? ` Image size: ${defaultImageWidth}×${defaultImageHeight} mm. Only suggest frames that can fit this image (inner opening ≥ image).`
    : '';

  // Derived example sizes for "in between" and "bigger" (from frame/image only) so the model searches different bands.
  const imgSmall = hasPhotoSize ? Math.round((defaultImageWidth ?? 0) / 10) : 0;
  const imgLarge = hasPhotoSize ? Math.round((defaultImageHeight ?? 0) / 10) : 0;
  const inBetweenCm =
    hasPhotoSize && !frameEqualsImage
      ? `${Math.round((imgSmall + cmSmall) / 2)}×${Math.round((imgLarge + cmLarge) / 2)} cm`
      : null;
  const biggerCm = `${cmSmall + 2}×${cmLarge + 3} cm`;

  const imgMm = hasPhotoSize ? `${defaultImageWidth}×${defaultImageHeight}` : null;
  const inBetweenNote =
    hasPhotoSize && !frameEqualsImage && inBetweenCm
      ? `, 1–2 between ${imgMm} and ${canonicalWidth}×${canonicalHeight} (e.g. ${inBetweenCm})`
      : '';
  const biggerNote = `, 1–2 larger than ${targetFrameDesc} (e.g. ${biggerCm})`;
  const searchExamples =
    hasPhotoSize && !frameEqualsImage && inBetweenCm
      ? `"A3 frame", "A4 frame", "${inBetweenCm} frame", "${biggerCm} frame"`
      : (() => {
          const standard: string | null =
            canonicalWidth === 210 && canonicalHeight === 297 ? 'A4'
            : canonicalWidth === 297 && canonicalHeight === 420 ? 'A3'
            : canonicalWidth === 420 && canonicalHeight === 594 ? 'A2'
            : canonicalWidth === 594 && canonicalHeight === 841 ? 'A1'
            : canonicalWidth === 250 && canonicalHeight === 353 ? 'B4'
            : canonicalWidth === 353 && canonicalHeight === 500 ? 'B3'
            : canonicalWidth === 500 && canonicalHeight === 707 ? 'B2'
            : canonicalWidth === 707 && canonicalHeight === 1000 ? 'B1'
            : null;
          return standard
            ? `"${standard} frame", "${cmSmall}x${cmLarge} cm frame", "${biggerCm} frame"`
            : `"${cmSmall}x${cmLarge} cm frame", "${biggerCm} frame"`;
        })();

  const includeLine = hasPhotoSize
    ? `Include: 1 product frame size ${canonicalWidth}×${canonicalHeight} mm, 1 product image size ${defaultImageWidth}×${defaultImageHeight} mm${inBetweenNote}${biggerNote}.`
    : `Include: 2–3 products frame size ${canonicalWidth}×${canonicalHeight} mm${biggerNote}.`;

  const imageSizeRequirement =
    hasPhotoSize && !frameEqualsImage
      ? ` You must include at least one frame that matches the image size (${defaultImageWidth}×${defaultImageHeight} mm)—search for "A4 frame" or "${imgSmall}x${imgLarge} cm frame" (or the equivalent for this image size) and add one result.`
      : '';

  const sources: string[] = ['Amazon UK'];
  if (includeEbay) sources.push('eBay UK');
  if (includeEtsy) sources.push('Etsy UK');
  if (includeAliExpress) sources.push('AliExpress UK');
  const sourcesLine = sources.join(', ');
  const searchInstruction =
    sources.length === 1
      ? `Search Amazon UK only. Get all 5 results from amazon.co.uk (search e.g. "${cmSmall}x${cmLarge} cm frame" or "A3 frame" on amazon.co.uk).`
      : `Search ${sourcesLine}. Prefer Amazon: include at least 3 products from amazon.co.uk when you find matching sizes. Then add results from ${sources.slice(1).join(' and ')} to reach 5 total.`;

  const urlInstructions: string[] = ['Amazon: https://www.amazon.co.uk/dp/ASIN or /gp/product/...'];
  if (includeEbay) urlInstructions.push('eBay: https://www.ebay.co.uk/itm/ then the listing id (8–12 digits)');
  if (includeEtsy) urlInstructions.push('Etsy: https://www.etsy.com/uk/listing/... or etsy.com/listing/...');
  if (includeAliExpress) urlInstructions.push('AliExpress: https://www.aliexpress.com/item/... or uk.aliexpress.com/item/...');

  const prompt = `Find 5 picture frames. User: frame ${targetFrameDesc}.${imageDesc}

${searchInstruction}

Return a JSON array of exactly 5 objects. ${includeLine}${imageSizeRequirement} Search for each size (e.g. ${searchExamples}).

CRITICAL – each url must be a full product page URL from one of these sites only: ${sourcesLine}. ${urlInstructions.join('. ')} Do not use redirect URLs (vertexaisearch, grounding-api-redirect, google.com). Every url must be a different real listing.

Each object: "title", "url", "reason", "widthMm", "heightMm". Reply with only the JSON array, no other text.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => (typeof p.text === 'string' ? p.text : ''))
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = parseJsonArray(text);

  const buildResults = (
    urlValidator: (url: string) => boolean,
    opts: { skipGenericFilter?: boolean; skipPhotoSizeFilter?: boolean } = {}
  ): FrameSearchResult[] => {
    const { skipGenericFilter = false, skipPhotoSizeFilter = false } = opts;
    const out: FrameSearchResult[] = [];
    for (const item of parsed) {
      if (item && typeof item === 'object' && 'title' in item && 'url' in item && 'reason' in item) {
        let url = String(item.url);
        const replaceMatch = url.match(/\.replace\s*\(\s*["']NUMERIC_ID["']\s*,\s*["'](\d+)["']\s*\)/);
        if (replaceMatch) url = `https://www.ebay.co.uk/itm/${replaceMatch[1]}`;
        if (!urlValidator(url)) continue;

        const title = String(item.title);
        if (!skipGenericFilter && isGenericMultiSizeListing(title)) continue;

        const raw = item as { widthMm?: unknown; heightMm?: unknown };
        const widthMm = typeof raw.widthMm === 'number' ? raw.widthMm : undefined;
        const heightMm = typeof raw.heightMm === 'number' ? raw.heightMm : undefined;

        if (
          !skipPhotoSizeFilter &&
          photoMin != null &&
          photoMax != null &&
          widthMm != null &&
          heightMm != null
        ) {
          const frameMin = Math.min(widthMm, heightMm);
          const frameMax = Math.max(widthMm, heightMm);
          if (frameMin < photoMin || frameMax < photoMax) continue;
        }

        out.push({
          title,
          url,
          reason: String(item.reason),
          ...(widthMm != null && widthMm > 0 && { widthMm }),
          ...(heightMm != null && heightMm > 0 && { heightMm }),
        });
      }
    }
    return out.slice(0, 5);
  };

  const urlValidator = (minEbayDigits = 8) => (url: string) =>
    isProductPageUrlForSources(url, { amazon: true, ebay: includeEbay, etsy: includeEtsy, aliexpress: includeAliExpress }, minEbayDigits);

  let results = buildResults(urlValidator(8));
  if (results.length === 0 && parsed.length > 0) {
    results = buildResults(urlValidator(6), { skipGenericFilter: true });
  }
  if (results.length === 0 && parsed.length > 0) {
    results = buildResults(urlValidator(6), {
      skipGenericFilter: true,
      skipPhotoSizeFilter: true,
    });
  }

  if (results.length > 0 && photoMin != null && photoMax != null) {
    results = prioritizeBySizeBands(results, canonicalWidth, canonicalHeight, photoMin, photoMax);
  }

  if (results.length > 0) {
    results = results.map((r) => ({
      ...r,
      reason: getSizeReason(r, canonicalWidth, canonicalHeight, photoMin, photoMax),
    }));
  }

  const out: { results: FrameSearchResult[]; prompt: string; debug?: { parsedCount: number; responsePreview: string } } =
    { results, prompt };
  if (results.length === 0 || (process.env.DEBUG === 'true' && results.length < 5)) {
    out.debug = { parsedCount: parsed.length, responsePreview: text.slice(0, 500) };
  }
  return out;
}

/**
 * Return an accurate size-band reason from dimensions so the UI shows correct labels
 * even when the model mislabels (e.g. "between" for something that is bigger than frame).
 */
function getSizeReason(
  r: FrameSearchResult,
  frameSmall: number,
  frameLarge: number,
  photoMin: number | null,
  photoMax: number | null
): string {
  const w = r.widthMm ?? 0;
  const h = r.heightMm ?? 0;
  if (w <= 0 || h <= 0) return r.reason;
  const small = Math.min(w, h);
  const large = Math.max(w, h);
  const sizeStr = `${small}×${large} mm`;
  if (photoMin != null && photoMax != null) {
    if (small === photoMin && large === photoMax) return `Image size (${sizeStr}).`;
    if (small === frameSmall && large === frameLarge) return `Frame size (${sizeStr}).`;
    if (small > photoMin && large > photoMax && small < frameSmall && large < frameLarge)
      return `Between image and frame (${sizeStr}).`;
    if (small >= frameSmall && large >= frameLarge && (small > frameSmall || large > frameLarge))
      return `Larger than frame (${sizeStr}).`;
  } else {
    if (small === frameSmall && large === frameLarge) return `Frame size (${sizeStr}).`;
    if (small >= frameSmall && large >= frameLarge && (small > frameSmall || large > frameLarge))
      return `Larger than frame (${sizeStr}).`;
  }
  return r.reason;
}

/**
 * Reorder and dedupe results so we prefer one per size band (image, frame, in-between, bigger).
 * Stops the same size (e.g. three 297×420) dominating; keeps an "in between" only if dimensions are actually between.
 */
function prioritizeBySizeBands(
  results: FrameSearchResult[],
  frameSmall: number,
  frameLarge: number,
  photoMin: number,
  photoMax: number
): FrameSearchResult[] {
  type Band = 'image' | 'frame' | 'between' | 'bigger';
  const bandOf = (r: FrameSearchResult): Band | null => {
    const w = r.widthMm ?? 0;
    const h = r.heightMm ?? 0;
    if (w <= 0 || h <= 0) return null;
    const small = Math.min(w, h);
    const large = Math.max(w, h);
    if (small === photoMin && large === photoMax) return 'image';
    if (small === frameSmall && large === frameLarge) return 'frame';
    if (small > photoMin && large > photoMax && small < frameSmall && large < frameLarge) return 'between';
    if (small >= frameSmall && large >= frameLarge && (small > frameSmall || large > frameLarge)) return 'bigger';
    return null;
  };

  const byBand: Record<Band, FrameSearchResult[]> = { image: [], frame: [], between: [], bigger: [] };
  const unclassified: FrameSearchResult[] = [];
  for (const r of results) {
    const band = bandOf(r);
    if (band == null) {
      unclassified.push(r);
      continue;
    }
    const limit = band === 'image' || band === 'frame' ? 1 : 2;
    if (byBand[band].length < limit) byBand[band].push(r);
    /* else skip: duplicate band, so we don't show three "frame size" results */
  }

  const out: FrameSearchResult[] = [];
  out.push(...byBand.image, ...byBand.frame, ...byBand.between, ...byBand.bigger, ...unclassified);
  return out.slice(0, 5);
}

/** Exclude generic "A1 A2 A3 A4 A5" / "multiple sizes" / size-range listings that don't state one specific frame size. */
function isGenericMultiSizeListing(title: string): boolean {
  const t = title.toUpperCase();
  const aCount = t.match(/\bA[1-5]\b/g)?.length ?? 0;
  const hasMultiSize =
    aCount >= 3 ||
    /MULTIPLE SIZES|VARIOUS SIZES|SELECT SIZE/i.test(title) ||
    /\d+x\d+cm\s+\d+x\d+cm\s*[-–]|\d+x\d+cm\s*[-–]\s*\d+/i.test(title); // e.g. "70x70cm 70x75cm-70x110cm"
  const hasSingleDimension =
    /\b\d+\s*[x×]\s*\d+\s*(cm|mm)\b/i.test(title) && !/\d+\s*[x×]\s*\d+\s*(cm|mm)\s*[-–]\s*\d+/i.test(title);
  const hasSingleStandardSize = aCount < 2 && /\b(C3|C2|B3|B4|A3|A4)\b/i.test(title);
  const hasSpecificSize = hasSingleDimension || hasSingleStandardSize;
  return hasMultiSize && !hasSpecificSize;
}

/** Reject search/listing pages; only allow product pages. eBay: id must contain at least minDigits digits (allows ids with hyphens). */
function isProductPageUrl(url: string, minDigits: number = 8): boolean {
  if (!url.startsWith('http')) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname;
    if (host.includes('ebay.co.uk')) {
      const itmMatch = path.match(/\/itm\/([^/?]+)/i);
      if (!itmMatch) return false;
      const digitsOnly = itmMatch[1].replace(/\D/g, '');
      return digitsOnly.length >= minDigits && /^\d+$/.test(digitsOnly);
    }
    if (host.includes('amazon.co.uk')) return path.includes('/dp/') || path.includes('/gp/product/');
    return false;
  } catch {
    return false;
  }
}

/** Allow product pages only from enabled sources. */
function isProductPageUrlForSources(
  url: string,
  sources: { amazon: boolean; ebay: boolean; etsy: boolean; aliexpress: boolean },
  minEbayDigits = 8
): boolean {
  if (!url.startsWith('http')) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname;
    if (sources.amazon && host.includes('amazon.co.uk'))
      return path.includes('/dp/') || path.includes('/gp/product/');
    if (sources.ebay && host.includes('ebay.co.uk')) {
      const itmMatch = path.match(/\/itm\/([^/?]+)/i);
      if (!itmMatch) return false;
      const digitsOnly = itmMatch[1].replace(/\D/g, '');
      return digitsOnly.length >= minEbayDigits && /^\d+$/.test(digitsOnly);
    }
    if (sources.etsy && (host.includes('etsy.com'))) {
      return /\/listing\/\d+/.test(path);
    }
    if (sources.aliexpress && (host.includes('aliexpress.com'))) {
      return /\/item\/[^/]+\.html/.test(path) || path.includes('/item/');
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Fix model output that uses JavaScript .replace() instead of the actual eBay URL.
 * Converts "https://...itm/NUMERIC_ID".replace("NUMERIC_ID", "123") to "https://...itm/123".
 */
function fixEbayUrlPlaceholders(text: string): string {
  return text.replace(
    /"https:\/\/www\.ebay\.co\.uk\/itm\/NUMERIC_ID"\.replace\s*\(\s*["']NUMERIC_ID["']\s*,\s*["'](\d+)["']\s*\)/g,
    '"https://www.ebay.co.uk/itm/$1"'
  );
}

/**
 * Parse a JSON array from model text. Tolerates markdown code blocks and surrounding text.
 */
function parseJsonArray(text: string): unknown[] {
  let trimmed = text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/g, '')
    .trim();

  trimmed = fixEbayUrlPlaceholders(trimmed);

  // Try to extract a JSON array if the response contains extra text
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    trimmed = arrayMatch[0];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}
