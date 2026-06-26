"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactElement } from "react";

/* =========================================================================
 * ProtolabAmbience — decoracion editorial sobria sobre la escena del robot
 *
 * Tres capas decorativas sutiles para que el fondo no se sienta vacio sin
 * competir con el robot ni con la conversacion:
 *
 *   1. Grid blueprint sutil — lineas verticales y horizontales muy tenues
 *      (opacity ~4%) que dan referencia espacial sin saturar.
 *
 *   2. Crosshair decorativo upper-right — marca tecnica tipo HUD que ancla
 *      visualmente la esquina sin texto. Indica "interfaz, no escena vacia".
 *
 *   3. Side label vertical — texto editorial rotado 90° en el costado
 *      izquierdo: "Conversación viva · TheoLab Protolab · 2026". Anima
 *      apareciendo con fade.
 *
 * Z-index 5: encima de BeamsBackground y BackgroundAura, debajo del Canvas
 * R3F (z-10) y del Header (z-30). pointer-events-none en todo.
 *
 * prefers-reduced-motion: el fade del label aparece instantaneo, sin motion.
 * ========================================================================= */

export function ProtolabAmbience(): ReactElement {
	const reduce = useReducedMotion();

	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
			{/* 1. Grid blueprint — pattern de lineas verticales+horizontales muy tenues */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"linear-gradient(to right, color-mix(in oklab, var(--color-alabaster) 4%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-alabaster) 4%, transparent) 1px, transparent 1px)",
					backgroundSize: "80px 80px",
					maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 90%)",
					WebkitMaskImage:
						"radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 90%)",
				}}
			/>

			{/* 2. Crosshair decorativo upper-right — marca tecnica HUD */}
			<svg
				className="absolute top-[60px] right-6 lg:top-[72px] lg:right-10"
				width="42"
				height="42"
				viewBox="0 0 42 42"
				fill="none"
				aria-hidden="true"
			>
				<title>Marca tecnica decorativa</title>
				<path
					d="M 21 4 L 21 16 M 21 26 L 21 38 M 4 21 L 16 21 M 26 21 L 38 21"
					stroke="var(--color-gold)"
					strokeOpacity="0.45"
					strokeWidth="1"
				/>
				<circle
					cx="21"
					cy="21"
					r="2.5"
					stroke="var(--color-gold)"
					strokeOpacity="0.6"
					fill="none"
				/>
				<circle
					cx="21"
					cy="21"
					r="11"
					stroke="var(--color-gold)"
					strokeOpacity="0.18"
					fill="none"
				/>
			</svg>

			{/* 3. Side label vertical izquierdo — texto editorial rotado */}
			<motion.div
				initial={reduce ? undefined : { opacity: 0 }}
				animate={reduce ? undefined : { opacity: 1 }}
				transition={reduce ? undefined : { duration: 1.2, delay: 0.6, ease: "easeOut" }}
				className="absolute top-1/2 left-4 hidden -translate-y-1/2 lg:block"
				style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateY(50%)" }}
			>
				<p className="text-mono text-[0.6875rem] uppercase tracking-[0.32em] text-[var(--color-alabaster)]/35">
					Conversación viva · TheoLab Protolab · 2026
				</p>
			</motion.div>

			{/* 4. Tag inferior-derecho: numero de sesion + status estatico */}
			<div className="absolute right-6 bottom-5 hidden items-center gap-2 lg:flex">
				<span
					aria-hidden="true"
					className="block h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]"
					style={{
						boxShadow: "0 0 8px color-mix(in oklab, var(--color-gold) 60%, transparent)",
					}}
				/>
				<span className="text-mono text-[0.625rem] uppercase tracking-[0.22em] text-[var(--color-alabaster)]/50">
					Sesión activa
				</span>
			</div>
		</div>
	);
}
