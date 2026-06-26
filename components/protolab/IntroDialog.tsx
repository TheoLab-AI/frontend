"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactElement, useEffect, useState } from "react";

/* =========================================================================
 * IntroDialog — modal de instrucciones la primera vez que se abre /protolab
 *
 * Aparece sobre un velo oscuro, centrado. Explica el flujo press-twice del
 * micrófono (pulse para empezar, hable, pulse otra vez para terminar). Botón
 * "Entendido" cierra y persiste un flag en localStorage para no volver a
 * mostrarse en visitas siguientes.
 *
 * No es un Radix Dialog: prefiere ser ligero (sin focus trap complejo, sin
 * portal). El uso es defensivo — si localStorage no está disponible (modo
 * incognito con cookies bloqueadas), se muestra siempre, sin romper.
 * ========================================================================= */

const STORAGE_KEY = "protolab:intro-seen";

export function IntroDialog(): ReactElement | null {
	const reduce = useReducedMotion();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		try {
			const seen = window.localStorage.getItem(STORAGE_KEY);
			if (!seen) setOpen(true);
		} catch {
			setOpen(true);
		}
	}, []);

	const handleClose = (): void => {
		try {
			window.localStorage.setItem(STORAGE_KEY, "1");
		} catch {
			// localStorage bloqueado: ignoramos, el modal se volverá a mostrar.
		}
		setOpen(false);
	};

	if (!open) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="protolab-intro-title"
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
		>
			<motion.div
				initial={reduce ? undefined : { opacity: 0 }}
				animate={reduce ? undefined : { opacity: 1 }}
				transition={reduce ? undefined : { duration: 0.25 }}
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={handleClose}
				aria-hidden="true"
			/>
			<motion.div
				initial={reduce ? undefined : { opacity: 0, y: 12 }}
				animate={reduce ? undefined : { opacity: 1, y: 0 }}
				transition={reduce ? undefined : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
				className="relative max-w-md rounded-[2px] border border-[var(--color-divider)] bg-[var(--color-onyx)] p-7 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]"
			>
				<p className="text-meta uppercase tracking-[0.18em] text-[var(--color-gold)]/75">
					Antes de empezar
				</p>
				<h2
					id="protolab-intro-title"
					className="mt-3 text-[1.375rem] font-semibold leading-tight text-[var(--color-alabaster)]"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Cómo hablar con Teo
				</h2>

				<ol className="mt-5 flex flex-col gap-3 text-[0.9375rem] text-[var(--color-alabaster)]/85">
					<li className="flex gap-3">
						<span
							aria-hidden="true"
							className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/40 text-mono text-[0.75rem] text-[var(--color-gold)]"
						>
							1
						</span>
						<span>Pulse el botón del micrófono una vez para empezar a hablar.</span>
					</li>
					<li className="flex gap-3">
						<span
							aria-hidden="true"
							className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/40 text-mono text-[0.75rem] text-[var(--color-gold)]"
						>
							2
						</span>
						<span>Diga su pregunta como se la diría a un consultor. Sin formalismos.</span>
					</li>
					<li className="flex gap-3">
						<span
							aria-hidden="true"
							className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/40 text-mono text-[0.75rem] text-[var(--color-gold)]"
						>
							3
						</span>
						<span>
							Pulse el botón <strong className="text-[var(--color-alabaster)]">otra vez</strong>{" "}
							para cerrar su turno. Teo le responderá.
						</span>
					</li>
				</ol>

				<p className="mt-5 text-[0.8125rem] leading-relaxed text-[var(--color-alabaster)]/60">
					La conversación abre preguntas. Las respuestas con cifras y plan a 90 días salen del
					diagnóstico de 75 minutos.
				</p>

				<button
					type="button"
					onClick={handleClose}
					className="mt-6 inline-flex items-center justify-center rounded-[2px] border border-[var(--color-alabaster)] bg-[var(--color-alabaster)] px-5 py-2.5 text-[0.9375rem] font-medium text-[var(--color-onyx)] transition-colors hover:bg-[var(--color-alabaster)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-onyx)]"
				>
					Entendido
				</button>
			</motion.div>
		</div>
	);
}
