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
	const cfg: LiveConnectConfig = {
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
	};
	// Affective dialog: solo modelos 2.5 native audio. 3.x lo rechaza.
	if (!isV3LiveModel(modelId)) {
		cfg.enableAffectiveDialog = true;
	}
	return cfg;
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
