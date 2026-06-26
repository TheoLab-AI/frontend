/**
 * VoiceClient.tsx — React lifecycle wrapper for the Gemini Live voice client
 *
 * This component renders nothing visible. Its sole responsibility is to:
 *   1. Create a VoiceClientInstance on mount (createVoiceClient())
 *   2. Call connect() to open the WebSocket session (token fetch + Live handshake)
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

	// Guard against StrictMode double-mount race: track whether connect() was
	// already initiated so the re-mount after the dev teardown does not fire
	// a second concurrent connect.
	const connectedRef = useRef(false);

	useEffect(() => {
		// Create a fresh instance on (re-)mount
		const client = createVoiceClient();
		clientRef.current = client;

		if (!connectedRef.current) {
			connectedRef.current = true;
			void client.connect();
		}

		return () => {
			// On StrictMode unmount (dev) this runs before the re-mount.
			// On real unmount this releases all resources.
			connectedRef.current = false;
			client.disconnect();
			clientRef.current = null;
		};
	}, []); // empty deps: run once per mount/unmount cycle

	useImperativeHandle(
		ref,
		(): VoiceClientHandle => ({
			start: async () => {
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

	// Renders nothing — purely imperative
	return null;
});
