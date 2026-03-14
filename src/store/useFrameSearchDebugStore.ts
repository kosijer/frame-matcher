import { create } from 'zustand';

export interface FrameSearchDebugState {
  payload: Record<string, unknown> | null;
  response: { results: unknown[] } | null;
  prompt: string | null;
  setDebug: (payload: Record<string, unknown>, response: { results: unknown[] }, prompt: string | null) => void;
}

export const useFrameSearchDebugStore = create<FrameSearchDebugState>((set) => ({
  payload: null,
  response: null,
  prompt: null,
  setDebug: (payload, response, prompt) => set({ payload, response, prompt }),
}));
