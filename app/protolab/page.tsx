"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { type ReactElement, useCallback, useRef } from "react";

import { BackgroundAura } from "@/components/protolab/BackgroundAura";
import { BeamsBackground } from "@/components/protolab/BeamsBackground";
import { ConversationUI } from "@/components/protolab/ConversationUI";
import { IntroDialog } from "@/components/protolab/IntroDialog";
import { ProtolabAmbience } from "@/components/protolab/ProtolabAmbience";
import { ProtolabHeader } from "@/components/protolab/ProtolabHeader";
import { VoiceClient, type VoiceClientHandle } from "@/components/protolab/VoiceClient";

/* =========================================================================
 * /protolab — Robot conversacional de TheoLab
 *
 * Integra tres piezas:
 *   - <VoiceClient/>      cliente Gemini Live (forwardRef, no render visible)
 *   - <RobotScene/>       Canvas R3F + RobotLookAt + nod sincronizado
 *   - <ConversationUI/>   botón mic + transcript + estados
 *
 * La página es el adapter del contrato ref/callbacks: posee el ref del
 * VoiceClient y entrega callbacks onStart/onStop a la UI, que ignora el ref.
 *
 * Layout: mobile stack (robot arriba 50svh, UI abajo 50svh), desktop split
 * (robot izquierda 1fr, UI derecha 400px). Background onyx para inmersión.
 * ========================================================================= */

const RobotScene = dynamic(
	() => import("@/components/protolab/RobotScene").then((m) => m.RobotScene),
	{
		ssr: false,
		// Fallback mientras descarga el chunk R3F + GLB. El BeamsBackground +
		// BackgroundAura + ProtolabAmbience ya estan visibles (viven fuera del
		// dynamic), asi que el usuario ve el fondo cinematico completo desde el
		// primer frame. Indicador mas prominente (anillo orbitando un nucleo
		// dorado) para que se sienta "vivo" mientras llega el modelo 3D.
		loading: () => (
			<div className="flex h-full w-full items-center justify-center">
				<div className="flex flex-col items-center gap-5">
					<div className="relative h-16 w-16">
						<div
							className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
							style={{
								borderTopColor: "var(--color-gold)",
								borderRightColor: "color-mix(in oklab, var(--color-gold) 30%, transparent)",
								animationDuration: "1.4s",
							}}
						/>
						<div
							className="absolute inset-[26%] animate-pulse rounded-full bg-[var(--color-gold)]"
							style={{ boxShadow: "0 0 24px var(--color-gold)" }}
						/>
					</div>
					<p className="text-mono text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-alabaster)]/55">
						Cargando modelo
					</p>
				</div>
			</div>
		),
	},
);

export default function ProtolabPage(): ReactElement {
	const reducedMotion = useReducedMotion() ?? false;
	const voiceRef = useRef<VoiceClientHandle>(null);

	const handleStart = useCallback(async () => {
		try {
			await voiceRef.current?.start();
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error("[protolab] start failed:", message);
		}
	}, []);

	const handleStop = useCallback(() => {
		voiceRef.current?.stop();
	}, []);

	return (
		<main className="relative grid h-svh w-full bg-[var(--color-onyx)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
			<IntroDialog />
			<ProtolabHeader />
			<VoiceClient ref={voiceRef} />

			<div className="relative min-h-[50svh] lg:min-h-0">
				<BeamsBackground intensity="medium" />
				<BackgroundAura />
				<ProtolabAmbience />
				<div className="relative z-10 h-full w-full">
					<RobotScene reducedMotion={reducedMotion} />
				</div>
			</div>

			<div className="relative min-h-[50svh] border-t border-[var(--color-divider)] lg:min-h-0 lg:border-t-0 lg:border-l">
				<ConversationUI onStart={handleStart} onStop={handleStop} />
			</div>
		</main>
	);
}
