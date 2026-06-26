/**
 * voice-client.ts — Gemini Live API client for Protolab
 *
 * Factory: createVoiceClient() → VoiceClientInstance
 *
 * Responsibilities:
 *   - Fetch an ephemeral session token from /api/protolab/token (POST)
 *   - Open a Gemini Live WebSocket session via @google/genai browser SDK
 *   - Capture microphone audio, downsample 48kHz Float32 → 16kHz Int16,
 *     and stream via session.sendRealtimeInput()
 *   - Receive 24kHz PCM Int16 audio chunks from Gemini, decode to Float32,
 *     queue them through a Web Audio output graph, and animate audioLevel
 *     via an AnalyserNode
 *   - Write status transitions and transcripts into the Zustand store
 *
 * Audio pipeline summary:
 *
 *   MIC (48kHz Float32)
 *     └─ MediaStreamSource
 *          └─ AudioWorkletNode (DownsampleProcessor)   ← downsamples off main thread
 *               └─ port.onmessage → Int16Array (16kHz)
 *                    └─ session.sendRealtimeInput({ audio: Blob })
 *
 *   GEMINI OUTPUT (24kHz PCM Int16 chunks)
 *     └─ decode → Float32 → AudioBuffer
 *          └─ AudioBufferSourceNode
 *               └─ AnalyserNode ─── getByteFrequencyData() → setAudioLevel()
 *                    └─ AudioContext.destination
 *
 * Downsample rationale: AudioWorkletNode runs in a dedicated rendering thread.
 * Unlike ScriptProcessorNode (main-thread, deprecated), it never blocks UI and
 * meets the low-latency requirement for streaming audio to Gemini. The
 * DownsampleProcessor is injected as a data: URL to avoid needing a separate
 * static file served under a restrictive CSP.
 *
 * Exposure: this module is pure TypeScript with no React. The React component
 * (VoiceClient.tsx) owns lifecycle (connect on mount, disconnect on unmount)
 * and exposes start/stop via a forwarded imperative ref.
 */

import type { Blob as GenAIBlob, Session } from "@google/genai";
import { GoogleGenAI } from "@google/genai";
import { useConversationStore } from "@/lib/conversation-store";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Input sample rate expected by Gemini Live API */
const GEMINI_INPUT_SAMPLE_RATE = 16_000;

/** Output sample rate from Gemini Live API audio responses */
const GEMINI_OUTPUT_SAMPLE_RATE = 24_000;

/** FFT size for the AnalyserNode — 256 gives 128 frequency bins, low overhead */
const ANALYSER_FFT_SIZE = 256;

/**
 * How many milliseconds of output silence before we consider the robot done
 * speaking and flip status back to 'idle'.
 */
const SPEAKING_DRAIN_TIMEOUT_MS = 300;

/**
 * MIME type that Gemini Live expects for realtime audio input.
 * The SDK Blob_2 type uses base64 data strings, not DOM Blobs.
 */
const AUDIO_INPUT_MIME = "audio/pcm;rate=16000";

// ---------------------------------------------------------------------------
// AudioWorklet processor source (injected as data: URL)
//
// Runs in the audio rendering thread. Takes Float32 input from the browser
// microphone (typically 48 000 Hz) and resamples to 16 000 Hz using simple
// averaging decimation (factor = ceil(inputRate / 16000)). Then converts to
// signed Int16 little-endian and posts the ArrayBuffer back to the main thread.
//
// Averaging (rather than drop-n-samples) avoids aliasing artifacts for the
// frequency range of human speech (80 Hz – 8 kHz), which is well within the
// Nyquist limit of 8 kHz at 16 kHz sample rate.
// ---------------------------------------------------------------------------

const WORKLET_SOURCE = /* js */ `
class DownsampleProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._inputRate = options.processorOptions?.inputRate ?? 48000;
    this._outputRate = 16000;
    this._factor = Math.round(this._inputRate / this._outputRate);
    this._buffer = [];
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    for (let i = 0; i < channel.length; i += this._factor) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < this._factor && i + j < channel.length; j++) {
        sum += channel[i + j];
        count++;
      }
      this._buffer.push(sum / count);
    }

    // Post whenever we have accumulated at least 160 samples (~10 ms at 16 kHz)
    if (this._buffer.length >= 160) {
      const int16 = new Int16Array(this._buffer.length);
      for (let k = 0; k < this._buffer.length; k++) {
        const clamped = Math.max(-1, Math.min(1, this._buffer[k]));
        int16[k] = Math.round(clamped * 32767);
      }
      this.port.postMessage(int16.buffer, [int16.buffer]);
      this._buffer = [];
    }

    return true;
  }
}

registerProcessor("downsample-processor", DownsampleProcessor);
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoiceClientInstance {
	/** Connect to Gemini Live: fetch token, open WebSocket. Sets status 'idle'. */
	connect(): Promise<void>;
	/** Start capturing microphone and streaming to Gemini. Sets status 'listening'. */
	startListening(): Promise<void>;
	/** Stop microphone capture. Does NOT close the WebSocket. */
	stopListening(): void;
	/**
	 * Close the WebSocket and release all Audio resources. Safe to call multiple
	 * times — subsequent calls are no-ops.
	 */
	disconnect(): void;
	/**
	 * Disconnect then reconnect. Does NOT loop automatically — caller decides
	 * whether to retry after an error.
	 */
	reconnect(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Decode a base64 PCM Int16 chunk to a Float32Array suitable for AudioBuffer */
function decodeInt16Chunk(base64: string): Float32Array<ArrayBuffer> {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i) & 0xff;
	}
	// Int16Array view over a plain ArrayBuffer (not SharedArrayBuffer)
	const ab = bytes.buffer.slice(0) as ArrayBuffer;
	const int16 = new Int16Array(ab);
	const float32 = new Float32Array(new ArrayBuffer(int16.length * 4));
	for (let i = 0; i < int16.length; i++) {
		// Int16 range: -32768..32767 → Float32 range: -1..1
		float32[i] = (int16[i] ?? 0) / 32768;
	}
	return float32;
}

/** Convert an ArrayBuffer to a base64 string (browser-safe, no Buffer) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i] ?? 0);
	}
	return btoa(binary);
}

/** Register the DownsampleProcessor worklet on an AudioContext (once per context) */
async function ensureWorkletRegistered(ctx: AudioContext): Promise<void> {
	const blob = new Blob([WORKLET_SOURCE], { type: "application/javascript" });
	const url = URL.createObjectURL(blob);
	try {
		await ctx.audioWorklet.addModule(url);
	} finally {
		URL.revokeObjectURL(url);
	}
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createVoiceClient(): VoiceClientInstance {
	// Zustand store selectors — accessed at call time to avoid stale closures
	const store = () => useConversationStore.getState();

	// Live session handle (set after connect())
	let session: Session | null = null;

	// AudioContext is created lazily on first user gesture (browser policy)
	let audioCtx: AudioContext | null = null;

	// AnalyserNode connected between output sources and destination
	let analyserNode: AnalyserNode | null = null;

	// Animation frame ID for the audioLevel polling loop
	let levelRafId: number | null = null;

	// Timer handle for the drain detection (speaking → idle transition)
	let drainTimer: ReturnType<typeof setTimeout> | null = null;

	// Microphone-related handles
	let micStream: MediaStream | null = null;
	let micSourceNode: MediaStreamAudioSourceNode | null = null;
	let workletNode: AudioWorkletNode | null = null;

	// Whether the worklet module has been registered on the current context
	let workletRegistered = false;

	// Tracks whether disconnect() has been called so we skip teardown twice
	let disconnected = false;

	// -------------------------------------------------------------------
	// Audio level polling (reads AnalyserNode, writes store.audioLevel)
	// -------------------------------------------------------------------

	function startLevelPolling(): void {
		if (!analyserNode || !audioCtx) return;
		const freqData = new Uint8Array(analyserNode.frequencyBinCount);

		function tick(): void {
			if (!analyserNode) return;
			analyserNode.getByteFrequencyData(freqData);
			let sum = 0;
			for (let i = 0; i < freqData.length; i++) {
				sum += freqData[i] ?? 0;
			}
			const rms = sum / (freqData.length * 255); // normalise 0-1
			store().setAudioLevel(rms);
			levelRafId = requestAnimationFrame(tick);
		}
		levelRafId = requestAnimationFrame(tick);
	}

	function stopLevelPolling(): void {
		if (levelRafId !== null) {
			cancelAnimationFrame(levelRafId);
			levelRafId = null;
		}
		store().setAudioLevel(0);
	}

	// -------------------------------------------------------------------
	// Output audio: schedule a PCM Int16 chunk through the Web Audio graph
	// -------------------------------------------------------------------

	// We keep a simple sequential scheduler: track when the currently queued
	// audio will finish so we can chain chunks without gaps.
	let nextStartTime = 0;

	function scheduleOutputChunk(base64: string): void {
		if (!audioCtx || !analyserNode) return;

		const float32 = decodeInt16Chunk(base64);
		const buffer = audioCtx.createBuffer(1, float32.length, GEMINI_OUTPUT_SAMPLE_RATE);
		buffer.copyToChannel(float32, 0);

		const source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(analyserNode);

		// Chain chunks back-to-back
		const startAt = Math.max(audioCtx.currentTime, nextStartTime);
		source.start(startAt);
		nextStartTime = startAt + buffer.duration;

		// Flip status to 'speaking' on first chunk
		if (store().status !== "speaking") {
			store().setStatus("speaking");
		}

		// Reset the drain timer each time a new chunk arrives
		if (drainTimer !== null) clearTimeout(drainTimer);
		drainTimer = setTimeout(() => {
			// Output queue has drained — return to idle if still in speaking
			if (store().status === "speaking") {
				store().setStatus("idle");
			}
			drainTimer = null;
		}, SPEAKING_DRAIN_TIMEOUT_MS);
	}

	// -------------------------------------------------------------------
	// Initialise AudioContext (call inside a user gesture)
	// -------------------------------------------------------------------

	async function ensureAudioContext(): Promise<void> {
		if (audioCtx) {
			// Resume if browser suspended the context
			if (audioCtx.state === "suspended") {
				await audioCtx.resume();
			}
			return;
		}

		audioCtx = new AudioContext();
		analyserNode = audioCtx.createAnalyser();
		analyserNode.fftSize = ANALYSER_FFT_SIZE;
		analyserNode.connect(audioCtx.destination);

		startLevelPolling();
	}

	// -------------------------------------------------------------------
	// Message handler for incoming LiveServerMessages
	// -------------------------------------------------------------------

	function handleServerMessage(msg: import("@google/genai").LiveServerMessage): void {
		const content = msg.serverContent;
		if (!content) return;

		// Output transcription (the Archivist's response text, streamed)
		if (content.outputTranscription?.text) {
			const chunk = content.outputTranscription.text;
			if (content.outputTranscription.finished) {
				// Final segment — ensure we have an assistant entry and close it
				store().appendToLastAssistant(chunk);
			} else {
				store().appendToLastAssistant(chunk);
			}
		}

		// Input transcription (the user's speech, arrives when VAD detects end)
		if (content.inputTranscription?.text && content.inputTranscription.finished) {
			store().appendTranscript({ role: "user", text: content.inputTranscription.text });
		}

		// Audio data: modelTurn parts that carry inline base64 PCM
		if (content.modelTurn?.parts) {
			for (const part of content.modelTurn.parts) {
				if (part.inlineData?.mimeType?.startsWith("audio/") && part.inlineData.data) {
					scheduleOutputChunk(part.inlineData.data);
				}
			}
		}

		// If the model signals it finished the turn and we are still speaking,
		// allow the drain timer to handle the idle transition naturally.
		if (content.turnComplete && store().status === "listening") {
			// User turn ended without audio (text-only edge case)
			store().setStatus("idle");
		}
	}

	// -------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------

	async function connect(): Promise<void> {
		if (session) return; // already connected

		let tokenValue: string;
		let modelValue: string;

		try {
			const resp = await fetch("/api/protolab/token", { method: "POST" });
			if (!resp.ok) {
				const body = (await resp.json().catch(() => ({}))) as { error?: string };
				throw new Error(body.error ?? `Token endpoint devolvió ${resp.status}`);
			}
			const data = (await resp.json()) as { token: string; model: string; expireAt: string };
			tokenValue = data.token;
			modelValue = data.model;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			store().setError(`No fue posible iniciar la sesión: ${msg}`);
			store().setStatus("idle");
			return;
		}

		try {
			// The ephemeral token is passed as apiKey. The SDK then injects it as
			// the bearer credential in the WebSocket upgrade headers via v1alpha.
			const ai = new GoogleGenAI({
				apiKey: tokenValue,
				httpOptions: { apiVersion: "v1alpha" },
			});

			disconnected = false;

			// eslint-disable-next-line no-console
			console.info(`[voice-client] connecting to model: ${modelValue}`);
			session = await ai.live.connect({
				model: modelValue,
				callbacks: {
					onopen: () => {
						// eslint-disable-next-line no-console
						console.info("[voice-client] session opened");
						store().setStatus("idle");
					},
					onmessage: (msg) => {
						handleServerMessage(msg);
					},
					onerror: (e: ErrorEvent) => {
						const detail = e.message ?? "Error de conexión con Gemini";
						// eslint-disable-next-line no-console
						console.error("[voice-client] WS error:", detail, e);
						store().setError(detail);
						store().setStatus("idle");
					},
					onclose: (e) => {
						// eslint-disable-next-line no-console
						console.warn(
							`[voice-client] session closed (disconnected=${disconnected})`,
							e?.reason ?? "",
						);
						if (!disconnected) {
							store().setError(
								"La conexión se cerró inesperadamente. Puede reconectar con el botón de micrófono.",
							);
							store().setStatus("idle");
						}
						session = null;
					},
				},
			});
			// eslint-disable-next-line no-console
			console.info("[voice-client] live.connect() returned session");
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			// eslint-disable-next-line no-console
			console.error("[voice-client] live.connect() threw:", err);
			store().setError(`No fue posible abrir la sesión de voz: ${msg}`);
			store().setStatus("idle");
		}
	}

	async function startListening(): Promise<void> {
		if (!session) {
			store().setError("Aún no hay sesión activa. Espere un momento y vuelva a intentarlo.");
			return;
		}

		// Check browser support
		if (!navigator.mediaDevices?.getUserMedia) {
			store().setError(
				"Su navegador no admite captura de micrófono. Use Chrome, Edge o Safari actualizado.",
			);
			return;
		}

		try {
			// AudioContext must be created/resumed inside a user gesture
			await ensureAudioContext();
			if (!audioCtx) throw new Error("AudioContext no disponible");

			// Register worklet module once per AudioContext instance
			if (!workletRegistered) {
				await ensureWorkletRegistered(audioCtx);
				workletRegistered = true;
			}

			micStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: GEMINI_INPUT_SAMPLE_RATE,
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
			});

			micSourceNode = audioCtx.createMediaStreamSource(micStream);

			workletNode = new AudioWorkletNode(audioCtx, "downsample-processor", {
				processorOptions: { inputRate: audioCtx.sampleRate },
			});

			workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
				if (!session) return;
				// The SDK Blob type (Blob_2) expects base64 data, not a DOM Blob.
				const base64 = arrayBufferToBase64(event.data);
				const genAiBlob: GenAIBlob = { data: base64, mimeType: AUDIO_INPUT_MIME };
				session.sendRealtimeInput({ audio: genAiBlob });
			};

			// Connect: mic → worklet (worklet does NOT connect to destination — we
			// do not want to hear ourselves). The worklet only forwards data to the
			// port for sending to Gemini.
			micSourceNode.connect(workletNode);

			store().setStatus("listening");
			// Ensure the assistant transcript entry is ready for the first response
			store().appendTranscript({ role: "assistant", text: "" });
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			// DOMException name for permission denial
			if (err instanceof DOMException && err.name === "NotAllowedError") {
				store().setError(
					"Permiso de micrófono denegado. Habilite el micrófono en la configuración del navegador.",
				);
			} else {
				store().setError(`No fue posible activar el micrófono: ${msg}`);
			}
			store().setStatus("idle");
		}
	}

	function stopListening(): void {
		// El segundo apretón del botón mic solo CORTA el mic localmente.
		// NO enviamos audioStreamEnd:true porque en Gemini 3.x ese flag
		// dispara el cierre del WebSocket sin respuesta (en 2.5 funcionaba
		// pero rompía 3.x). El VAD automático de Gemini detecta el silencio
		// natural cuando deja de llegar audio y cierra el turno solo.
		// Trade-off: ~0.5-1s extra de latencia para que el VAD detecte el
		// silencio vs el cierre rápido forzado. Estabilidad > velocidad.

		workletNode?.disconnect();
		workletNode = null;
		micSourceNode?.disconnect();
		micSourceNode = null;
		if (micStream) {
			for (const track of micStream.getTracks()) {
				track.stop();
			}
			micStream = null;
		}
		if (store().status === "listening") {
			store().setStatus("idle");
		}
	}

	function disconnect(): void {
		disconnected = true;
		stopListening();
		stopLevelPolling();
		if (drainTimer !== null) {
			clearTimeout(drainTimer);
			drainTimer = null;
		}
		session?.close();
		session = null;
		if (audioCtx) {
			void audioCtx.close();
			audioCtx = null;
			analyserNode = null;
			workletRegistered = false;
		}
	}

	async function reconnect(): Promise<void> {
		disconnect();
		store().setError(null);
		await connect();
	}

	return { connect, startListening, stopListening, disconnect, reconnect };
}
