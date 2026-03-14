import { useState } from 'react';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import { useFrameStore } from '../store/useFrameStore';
import { useFrameSearchDebugStore } from '../store/useFrameSearchDebugStore';
import { fetchFindFrames } from '../api/findFrames';
import type { FrameSearchResult } from '../api/findFrames';

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

export function FrameSearch() {
  const frameWidth = useFrameStore((s) => s.frameWidth);
  const frameHeight = useFrameStore((s) => s.frameHeight);
  const defaultImageWidth = useFrameStore((s) => s.defaultImageWidth);
  const defaultImageHeight = useFrameStore((s) => s.defaultImageHeight);
  const imageCount = useFrameStore((s) => s.imageCount);

  const [status, setStatus] = useState<SearchStatus>('idle');
  const [results, setResults] = useState<FrameSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [includeEbay, setIncludeEbay] = useState(false);
  const [includeEtsy, setIncludeEtsy] = useState(false);
  const [includeAliExpress, setIncludeAliExpress] = useState(false);
  const setDebug = useFrameSearchDebugStore((s) => s.setDebug);

  const handleSearch = async () => {
    setStatus('loading');
    setErrorMessage(null);
    setResults([]);
    const payload = {
      frameWidth,
      frameHeight,
      ...(imageCount <= 1 && {
        defaultImageWidth,
        defaultImageHeight,
      }),
      ...(includeEbay && { includeEbay: true }),
      ...(includeEtsy && { includeEtsy: true }),
      ...(includeAliExpress && { includeAliExpress: true }),
    };
    try {
      const data = await fetchFindFrames(payload);
      setResults(data.results);
      setStatus('done');
      setDebug(
        payload,
        { results: data.results, ...(data.debug && { debug: data.debug }) },
        data.prompt ?? null
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Search failed');
      setStatus('error');
    }
  };

  return (
    <section className="mt-3 w-full">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Matching frames (Amazon UK)
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeEbay}
                onChange={(e) => setIncludeEbay(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              eBay
            </label>
            <label className="inline-flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeEtsy}
                onChange={(e) => setIncludeEtsy(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Etsy
            </label>
            <label className="inline-flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeAliExpress}
                onChange={(e) => setIncludeAliExpress(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              AliExpress
            </label>
            <button
              type="button"
              onClick={handleSearch}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Search className="h-4 w-4" aria-hidden />
              )}
              Find matching frames
            </button>
          </div>
        </div>

        {status === 'loading' && (
          <p className="py-4 text-sm text-gray-500">Searching for frames…</p>
        )}

        {status === 'error' && errorMessage && (
          <div className="py-4">
            <p className="text-sm text-red-600">{errorMessage}</p>
            <button
              type="button"
              onClick={handleSearch}
              className="mt-2 text-sm font-medium text-gray-600 underline hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        )}

        {status === 'done' && results.length > 0 && (
          <ul
            className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
            role="list"
          >
            {results.map((item, i) => (
              <li
                key={`${item.url}-${i}`}
                className="flex flex-col rounded border border-gray-200 bg-gray-50 p-3"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 font-medium text-gray-800 hover:text-gray-600 hover:underline"
                >
                  <span className="line-clamp-2">{item.title}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
                <p className="mt-1 text-sm text-gray-600">{item.reason}</p>
              </li>
            ))}
          </ul>
        )}

        {status === 'done' && results.length === 0 && (
          <p className="py-4 text-sm text-gray-500">No results returned.</p>
        )}

        {status !== 'idle' && (
          <p className="mt-3 text-xs text-gray-400">
            Powered by Gemini (Google Search grounding)
          </p>
        )}
      </div>
    </section>
  );
}
