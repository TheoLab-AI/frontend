import type { LiveConnectConfig } from "@google/genai";
import { GoogleGenAI, Modality } from "@google/genai";
import { NextResponse } from "next/server";

import { buildTeoSystemPrompt } from "@/lib/protolab-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const TOKEN_TTL_MS = 30 * 60 * 1000;
const SESSION_START_WINDOW_MS = 2 * 60 * 1000;
const DEFAULT_VOICE = "Charon";
const DEFAULT_LANGUAGE_CODE = "es-US";

// Modelos Live de la familia 3.x. Doc oficial:
//   "enableAffectiveDialog is not supported in Gemini 3.1 Flash Live."
// Si enviamos ese flag a un modelo 3.x, el backend responde con
// "Internal error encountered" al abrir el WebSocket. Construimos el
// config dinamicamente segun el modelo para evitarlo.
function isV3LiveModel(modelId: string): boolean {
	return /^gemini-3(\.|-)/.test(modelId);
}

function buildLiveConfig(params: {
	modelId: string;
	systemInstruction: string;
	voiceName: string;
	languageCode: string;
}): LiveConnectConfig {
	const { modelId, systemInstruction, voiceName, languageCode } = params;

	// Modelos 3.x Live: config minimo alineado al ejemplo oficial de la doc.
	// La doc explicitamente dice que native audio "automatically choose the
	// appropriate language and don't support explicitly setting the language
	// code", asi que NO enviamos languageCode. Si enviamos solo voiceName en
	// voiceConfig, la doc dice que los modelos audio nativo "support any of
	// the voices available for our Text-to-Speech (TTS) models" — por eso
	// intentamos fijar la voz aqui sin tocar languageCode.
	// Trade-off: sin transcripciones de UI en 3.x (audio si reproduce).
	if (isV3LiveModel(modelId)) {
		return {
			responseModalities: [Modality.AUDIO],
			systemInstruction,
			speechConfig: {
				voiceConfig: {
					prebuiltVoiceConfig: { voiceName },
				},
			},
		};
	}

	// Modelos 2.5 native audio: config completo con voz Charon, languageCode
	// es-US, transcripciones para UI, y enableAffectiveDialog (solo 2.5).
	return {
		responseModalities: [Modality.AUDIO],
		systemInstruction,
		speechConfig: {
			languageCode,
			voiceConfig: {
				prebuiltVoiceConfig: { voiceName },
			},
		},
		inputAudioTranscription: {},
		outputAudioTranscription: {},
		enableAffectiveDialog: true,
	};
}

export async function POST(): Promise<NextResponse> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "Server misconfigured: GEMINI_API_KEY missing" },
			{ status: 500 },
		);
	}

	const model = process.env.PROTOLAB_GEMINI_MODEL ?? DEFAULT_MODEL;
	const voiceName = process.env.PROTOLAB_GEMINI_VOICE ?? DEFAULT_VOICE;
	const languageCode = process.env.PROTOLAB_GEMINI_LANGUAGE ?? DEFAULT_LANGUAGE_CODE;

	try {
		const ai = new GoogleGenAI({
			apiKey,
			httpOptions: { apiVersion: "v1alpha" },
		});

		const systemInstruction = await buildTeoSystemPrompt();
		const now = Date.now();
		const expireTime = new Date(now + TOKEN_TTL_MS).toISOString();
		const newSessionExpireTime = new Date(now + SESSION_START_WINDOW_MS).toISOString();

		const liveConfig = buildLiveConfig({
			modelId: model,
			systemInstruction,
			voiceName,
			languageCode,
		});

		const token = await ai.authTokens.create({
			config: {
				uses: 1,
				expireTime,
				newSessionExpireTime,
				liveConnectConstraints: {
					model,
					config: liveConfig,
				},
			},
		});

		if (!token.name) {
			return NextResponse.json({ error: "Token creation returned empty name" }, { status: 502 });
		}

		return NextResponse.json({
			token: token.name,
			model,
			expireAt: expireTime,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("[protolab/token] Failed to create ephemeral token:", message);
		return NextResponse.json({ error: "Failed to create session token" }, { status: 500 });
	}
}
