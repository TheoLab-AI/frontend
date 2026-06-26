/**
 * VoiceClient.tsx — React lifecycle wrapper for the Gemini Live voice client
 *
 * This component renders nothing visible. Its sole responsibility is to:
 *   1. Create a VoiceClientInstance on mount (createVoiceClient())
 *   2. Connect to Gemini LAZILY on the first start() call (NOT on mount).
 *      This keeps the initial page load fast — no token fetch + WS handshake
 *      until the user actually wants to talk. Cold path adds ~1-2s to the
 *      first mic press, but subsequent presses are instant.
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

	// Tracks whether connect() has already opened a session (or is in flight).
	// Used for the lazy-connect pattern: the FIRST start() triggers connect,
	// subsequent start() calls skip it. Also serves as the StrictMode guard
	// against concurrent connects in dev.
	const connectedRef = useRef(false);

	useEffect(() => {
		// Create a fresh instance on (re-)mount. NO connect() here — we defer
		// the network round-trip (token fetch + WebSocket handshake) until the
		// user actually presses the mic button. This keeps initial page load
		// fast and avoids burning Gemini quota for visitors who never speak.
		const client = createVoiceClient();
		clientRef.current = client;

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
				const client = clientRef.current;
				if (!client) return;
				// Lazy connect on first start. Subsequent starts skip this branch.
				// If connect() fails internally it sets store.error and clears
				// connectedRef so the next start can retry.
				if (!connectedRef.current) {
					connectedRef.current = true;
					try {
						await client.connect();
					} catch (err) {
						connectedRef.current = false;
						throw err;
					}
				}
				await client.startListening();
			},
			stop: () => {
				clientRef.current?.stopListening();
			},
			reconnect: async () => {
				connectedRef.current = false;
				await clientRef.current?.reconnect();
				connectedRef.current = true;
			},
		}),
		[],
	);

	// Renders nothing — purely imperative
	return null;
});
