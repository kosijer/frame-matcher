export interface FrameSearchResult {
  title: string;
  url: string;
  reason: string;
  /** Frame outer size in mm when known (for UI preview) */
  widthMm?: number;
  heightMm?: number;
}

export interface FindFramesPayload {
  frameWidth: number;
  frameHeight: number;
  matOpeningWidth?: number;
  matOpeningHeight?: number;
  defaultImageWidth?: number;
  defaultImageHeight?: number;
}

export interface FindFramesApiResponse {
  results: FrameSearchResult[];
  prompt?: string;
  /** Present when results are empty: parsed item count and start of raw model response for debugging */
  debug?: { parsedCount: number; responsePreview: string };
}

export async function fetchFindFrames(
  payload: FindFramesPayload
): Promise<FindFramesApiResponse> {
  const res = await fetch('/api/find-frames', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as FindFramesApiResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  return {
    results: Array.isArray(data.results) ? data.results : [],
    prompt: data.prompt,
    debug: data.debug,
  };
}
