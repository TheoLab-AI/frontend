"use client";

import { type ReactElement, useEffect, useRef } from "react";
import { useConversationStore } from "@/lib/conversation-store";

/* =========================================================================
 * BackgroundAura — halo dorado reactivo a la voz del Teo
 *
 * UNA sola capa de gradient radial dorado cuya opacity escala con audioLevel
 * cuando status='speaking'. En listening queda en un brillo muy sutil. En
 * idle se apaga totalmente.
 *
 * Se monta encima del BeamsBackground (motion ambiental) pero detras del
 * Canvas R3F del robot. Le da al fondo "presencia" reactiva cuando el
 * Teo habla, sin saturar el resto del tiempo.
 *
 * Se complementa con un vignette inferior sutil para anclar visualmente la
 * composicion al fondo onyx.
 *
 * Capa pointer-events-none, no interfiere con interacciones.
 * ========================================================================= */

const SPEAKING_BASE_OPACITY = 0.0;
const SPEAKING_MAX_OPACITY = 0.42;
const LISTENING_HALO_OPACITY = 0.06;
const HALO_LERP = 0.12;

export function BackgroundAura(): ReactElement {
	const haloRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		let rafId: number | null = null;
		let current = SPEAKING_BASE_OPACITY;

		const tick = (): void => {
			const { status, audioLevel } = useConversationStore.getState();

			let target = SPEAKING_BASE_OPACITY;
			if (status === "speaking") {
				target = SPEAKING_BASE_OPACITY + audioLevel * SPEAKING_MAX_OPACITY;
			} else if (status === "listening") {
				target = LISTENING_HALO_OPACITY;
			}

			current += (target - current) * HALO_LERP;

			if (haloRef.current) {
				haloRef.current.style.opacity = current.toFixed(3);
			}

			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	}, []);

	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
			{/* Halo reactivo — opacity manipulada por useEffect en cada frame */}
			<div
				ref={haloRef}
				className="absolute inset-0 transition-opacity"
				style={{
					opacity: 0,
					background:
						"radial-gradient(ellipse 55% 45% at 50% 45%, color-mix(in oklab, var(--color-gold) 35%, transparent) 0%, transparent 65%)",
				}}
			/>

			{/* Vignette inferior para anclar al fondo onyx */}
			<div
				className="absolute inset-x-0 bottom-0 h-1/3"
				style={{
					background:
						"linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--color-onyx) 70%, transparent) 100%)",
				}}
			/>
		</div>
	);
}
