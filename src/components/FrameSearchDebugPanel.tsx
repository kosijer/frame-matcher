/**
 * Temporary debug panel: shows last payload, response, and prompt for frame search.
 * Remove this component when you no longer need to control changes.
 */
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useFrameSearchDebugStore } from '../store/useFrameSearchDebugStore';

export function FrameSearchDebugPanel() {
  const payload = useFrameSearchDebugStore((s) => s.payload);
  const response = useFrameSearchDebugStore((s) => s.response);
  const prompt = useFrameSearchDebugStore((s) => s.prompt);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const payloadStr = payload != null ? JSON.stringify(payload, null, 2) : '';
    const responseStr = response != null ? JSON.stringify(response, null, 2) : '';
    const text = `This payload\n${payloadStr}\nReturns this\n${responseStr}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (payload == null && response == null && prompt == null) {
    return null;
  }

  return (
    <section className="border-t border-gray-300 bg-gray-200 p-4 text-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-800">Frame search debug (remove when done)</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded border border-gray-400 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {copied ? 'Copied' : 'Copy for debugging'}
        </button>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium text-gray-700">This payload</p>
          <pre className="max-h-40 overflow-auto rounded bg-gray-100 p-2 font-mono text-xs">
            {payload != null ? JSON.stringify(payload, null, 2) : '—'}
          </pre>
          <p className="font-medium text-gray-700">Returns this response</p>
          <pre className="max-h-48 overflow-auto rounded bg-gray-100 p-2 font-mono text-xs">
            {response != null ? JSON.stringify(response, null, 2) : '—'}
          </pre>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium text-gray-700">Prompt preview</p>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-gray-100 p-2 font-mono text-xs">
            {prompt ?? '—'}
          </pre>
        </div>
      </div>
    </section>
  );
}
