import { create } from "zustand";

export type ConversationStatus = "idle" | "listening" | "speaking";

export interface TranscriptEntry {
	role: "user" | "assistant";
	text: string;
}

interface ConversationState {
	status: ConversationStatus;
	audioLevel: number;
	transcript: TranscriptEntry[];
	error: string | null;
	setStatus: (status: ConversationStatus) => void;
	setAudioLevel: (level: number) => void;
	appendTranscript: (entry: TranscriptEntry) => void;
	appendToLastAssistant: (chunk: string) => void;
	setError: (error: string | null) => void;
	reset: () => void;
}

const INITIAL: Pick<ConversationState, "status" | "audioLevel" | "transcript" | "error"> = {
	status: "idle",
	audioLevel: 0,
	transcript: [],
	error: null,
};

export const useConversationStore = create<ConversationState>((set) => ({
	...INITIAL,
	setStatus: (status) => set({ status }),
	setAudioLevel: (audioLevel) => set({ audioLevel: Math.max(0, Math.min(1, audioLevel)) }),
	appendTranscript: (entry) => set((s) => ({ transcript: [...s.transcript, entry] })),
	appendToLastAssistant: (chunk) =>
		set((s) => {
			const last = s.transcript[s.transcript.length - 1];
			if (last && last.role === "assistant") {
				const updated = s.transcript.slice(0, -1).concat({
					role: "assistant",
					text: last.text + chunk,
				});
				return { transcript: updated };
			}
			return { transcript: [...s.transcript, { role: "assistant", text: chunk }] };
		}),
	setError: (error) => set({ error }),
	reset: () => set(INITIAL),
}));
