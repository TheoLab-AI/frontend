/**
 * VoiceClient.tsx — React lifecycle wrapper for the Gemini Live voice client
 *
 * This component renders nothing visible. Its sole responsibility is to:
 *   1. Create a VoiceClientInstance on mount (createVoiceClient())
 *   2. Connect to Gemini on mount (eager). NOTE: tried lazy-connect on the
 *      first start() call to speed up initial page load, but it broke the
 *      mic — browsers require new AudioContext() to be created INSIDE the
 *      user gesture handler. Putting `await connect()` before
 *      startListening() consumes the gesture context, so the subsequent
 *      AudioContext creation gets rejected. Eager connect on mount keeps
 *      the gesture path clean (start() only calls startListening, which
 *      creates the AudioContext inline within the click handler).
 *   3. Expose start() / stop() / reconnect() to the parent via a forwarded ref
 *   4. Call disconnect() on unmount to release all Audio and WebSocket resources
 *
 * ---------------------------------------------------------------------------
 * EXPOSURE MECHANISM — imperative ref (React.forwardRef + useImperativeHandle)
 * ---------------------------------------------------------------------------
 *
 * ConversationUI.tsx receives a `voiceRef: React.RefObject<VoiceClientHandle>`
 * prop and calls voiceRef.current.start() / voiceRef.current.stop() on button
 * press. app/protolab/page.tsx owns the ref:
 *
 *   const voiceRef = useRef<VoiceClientHandle>(null);
 *   <VoiceClient ref={voiceRef} />
 *   <ConversationUI voiceRef={voiceRef} />
 *
 * Rationale for choosing forwardRef over alternatives:
 *   - Context: adds a Provider wrapper and a separate hook; overkill for 3
 *     methods shared by 2 components.
 *   - Singleton module instance: breaks StrictMode double-mount isolation and
 *     makes server-side imports unreliable.
 *   - Store actions: mixing audio imperative concerns into the Zustand store
 *     couples UI state management to Web Audio lifecycle.
 *   - forwardRef: minimal surface, co-located with the component, no extra
 *     providers, cleanly destroyed on unmount.
 *
 * ---------------------------------------------------------------------------
 * StrictMode double-mount (React 19 dev)
 * ---------------------------------------------------------------------------
 *
 * React 19 StrictMode mounts → unmounts → remounts every effect in dev.
 * We guard with a `connectedRef` boolean so the second mount does not attempt
 * to connect while the first is still in flight, and disconnect() is
 * idempotent (calling it twice is safe).
 */

"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { VoiceClientInstance } from "@/lib/voice-client";
import { createVoiceClient } from "@/lib/voice-client";

// ---------------------------------------------------------------------------
// Public handle type (imported by ConversationUI and app/protolab/page.tsx)
// ---------------------------------------------------------------------------

export interface VoiceClientHandle {
	/** Activate the microphone and begin streaming audio to Gemini. */
	start(): Promise<void>;
	/** Stop the microphone stream. Does not close the WebSocket. */
	stop(): void;
	/**
	 * Close the current session and reconnect with a fresh ephemeral token.
	 * Call this when the user wants to retry after a connection error.
	 */
	reconnect(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const VoiceClient = forwardRef<VoiceClientHandle>(function VoiceClient(_props, ref) {
	const clientRef = useRef<VoiceClientInstance | null>(null);

	// Guard against StrictMode double-mount race in dev: track whether
	// connect() was already initiated so the re-mount after the dev teardown
	// does not fire a second concurrent connect.
	const connectedRef = useRef(false);

	useEffect(() => {
		const client = createVoiceClient();
		clientRef.current = client;

		if (!connectedRef.current) {
			connectedRef.current = true;
			void client.connect();
		}

		return () => {
			connectedRef.current = false;
			client.disconnect();
			clientRef.current = null;
		};
	}, []);

	useImperativeHandle(
		ref,
		(): VoiceClientHandle => ({
			start: async () => {
				// startListening() must run inline within the click handler so
				// the AudioContext + getUserMedia retain the user gesture
				// context. No awaits before this.
				await clientRef.current?.startListening();
			},
			stop: () => {
				clientRef.current?.stopListening();
			},
			reconnect: async () => {
				await clientRef.current?.reconnect();
			},
		}),
		[],
	);

	return null;
});
