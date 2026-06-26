"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactElement, useCallback, useEffect, useRef } from "react";
import {
	type ConversationStatus,
	type TranscriptEntry,
	useConversationStore,
} from "@/lib/conversation-store";

/* =========================================================================
 * ConversationUI — Interfaz de voz del Protolab
 *
 * Responsabilidades de este componente:
 *   - Botón de micrófono con tres estados visuales: idle / listening / speaking
 *   - Indicador de error con enlace de reintento
 *   - Región de transcript accesible (últimas 7 entradas, auto-scroll)
 *   - Hint inicial cuando no hay conversación activa
 *
 * Lo que NO hace este componente:
 *   - Gestión de WebSocket o AudioContext (responsabilidad de VoiceClient)
 *   - Render del robot 3D (responsabilidad de RobotScene)
 *
 * Props contract: onStart / onStop vienen de VoiceClient (componente hermano).
 * El estado de la conversación se lee del store Zustand (conversation-store).
 * ========================================================================= */

// Cantidad máxima de entradas visibles en el transcript
const MAX_VISIBLE_TURNS = 7;

/* -------------------------------------------------------------------------
 * MicIcon — icono SVG del micrófono dibujado inline para control total
 * sobre color y tamaño sin depender de Lucide (que añadiría tree-shake overhead).
 * ------------------------------------------------------------------------- */
function MicIcon({ size = 28 }: { size?: number }): ReactElement {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
			<path d="M19 10a7 7 0 0 1-14 0" />
			<line x1="12" y1="19" x2="12" y2="23" />
			<line x1="8" y1="23" x2="16" y2="23" />
		</svg>
	);
}

/* -------------------------------------------------------------------------
 * SpeakingDots — animación de tres puntos que indica que el Teo habla.
 * Respeta prefers-reduced-motion: sin animación, muestra los tres puntos
 * estáticos.
 * ------------------------------------------------------------------------- */
function SpeakingDots(): ReactElement {
	const reduce = useReducedMotion();

	const dotVariants = {
		initial: { opacity: 0.3, y: 0 },
		animate: { opacity: 1, y: -4 },
	};

	const dots = [0, 1, 2];

	return (
		<span className="inline-flex items-end gap-[3px]" aria-hidden="true">
			{dots.map((i) => (
				<motion.span
					key={i}
					variants={reduce ? undefined : dotVariants}
					initial={reduce ? undefined : "initial"}
					animate={reduce ? undefined : "animate"}
					transition={
						reduce
							? undefined
							: {
									duration: 0.5,
									repeat: Number.POSITIVE_INFINITY,
									repeatType: "reverse",
									ease: "easeInOut",
									delay: i * 0.15,
								}
					}
					className="block h-[5px] w-[5px] rounded-full bg-current"
				/>
			))}
		</span>
	);
}

/* -------------------------------------------------------------------------
 * PulseRing — anillo animado alrededor del botón mic en estado listening.
 * Dos anillos concéntricos con phase offset producen el efecto sonar.
 * Con reduced-motion: no se renderiza.
 * ------------------------------------------------------------------------- */
function PulseRing(): ReactElement | null {
	const reduce = useReducedMotion();

	if (reduce) return null;

	return (
		<span className="pointer-events-none absolute inset-0 rounded-full" aria-hidden="true">
			{[0, 1].map((i) => (
				<motion.span
					key={i}
					className="absolute inset-0 rounded-full border border-[var(--color-crimson)]/40"
					initial={{ opacity: 0.6, scale: 1 }}
					animate={{ opacity: 0, scale: 1.6 }}
					transition={{
						duration: 1.6,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeOut",
						delay: i * 0.8,
					}}
				/>
			))}
		</span>
	);
}

/* -------------------------------------------------------------------------
 * MicButton — botón principal de acción.
 *
 * Tres variantes visuales según status:
 *   idle      → outline alabaster/40, hover fondo onyx/08
 *   listening → fondo crimson, anillos pulsantes
 *   speaking  → botón reducido, deshabilitado, color slate
 *
 * El aria-label es dinámico para que lectores de pantalla comuniquen
 * el estado actual y la acción disponible.
 * ------------------------------------------------------------------------- */
interface MicButtonProps {
	status: ConversationStatus;
	onStart: () => void;
	onStop: () => void;
}

function MicButton({ status, onStart, onStop }: MicButtonProps): ReactElement {
	const isSpeaking = status === "speaking";
	const isListening = status === "listening";

	const ariaLabel =
		status === "idle"
			? "Iniciar conversación con el Teo"
			: status === "listening"
				? "Detener conversación"
				: "El Teo está respondiendo";

	const handleClick = useCallback(() => {
		if (status === "idle") onStart();
		else if (status === "listening") onStop();
		// speaking: sin acción (barge-in fuera de scope v1)
	}, [status, onStart, onStop]);

	return (
		<div className="relative flex items-center justify-center">
			{/* Anillos de pulso — solo en listening */}
			{isListening && <PulseRing />}

			<motion.button
				type="button"
				onClick={handleClick}
				disabled={isSpeaking}
				aria-label={ariaLabel}
				aria-pressed={isListening}
				aria-live="polite"
				animate={
					isSpeaking
						? { scale: 0.72, opacity: 0.45 }
						: isListening
							? { scale: 1 }
							: { scale: 1, opacity: 1 }
				}
				transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
				className={[
					"relative z-10 flex h-20 w-20 items-center justify-center rounded-full",
					"transition-[background,border,color,box-shadow] duration-300 ease-[var(--ease-brand)]",
					"focus-visible:outline-none focus-visible:ring-2",
					"focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-4",
					"focus-visible:ring-offset-[var(--color-onyx)]",
					"disabled:cursor-not-allowed",
					isListening
						? [
								"border-2 border-[var(--color-crimson)]",
								"bg-[var(--color-crimson)]",
								"text-[var(--color-alabaster)]",
								"shadow-[0_0_32px_-4px_var(--color-crimson)]",
							].join(" ")
						: isSpeaking
							? [
									"border-2 border-[var(--color-slate)]/40",
									"bg-transparent",
									"text-[var(--color-slate)]",
								].join(" ")
							: [
									"border-2 border-[var(--color-alabaster)]/40",
									"bg-transparent",
									"text-[var(--color-alabaster)]",
									"hover:border-[var(--color-alabaster)]/70",
									"hover:bg-white/[0.06]",
								].join(" "),
				].join(" ")}
			>
				<MicIcon size={28} />
			</motion.button>
		</div>
	);
}

/* -------------------------------------------------------------------------
 * StatusLabel — texto de estado debajo del botón mic.
 * En idle: no se renderiza (el hint inicial lo sustituye).
 * ------------------------------------------------------------------------- */
function StatusLabel({ status }: { status: ConversationStatus }): ReactElement | null {
	if (status === "idle") return null;

	return (
		<motion.div
			key={status}
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
			className="flex items-center gap-2 text-[var(--color-fg-muted)] text-[var(--text-ui)]"
		>
			{status === "listening" && (
				<>
					<span
						className="block h-2 w-2 rounded-full bg-[var(--color-crimson)]"
						aria-hidden="true"
					/>
					<span>Escuchando</span>
				</>
			)}
			{status === "speaking" && (
				<>
					<SpeakingDots />
					<span>El Teo está hablando</span>
				</>
			)}
		</motion.div>
	);
}

/* -------------------------------------------------------------------------
 * ErrorBanner — visible cuando error !== null.
 * Tono sobrio, sin términos de marketing. Ofrece reintento.
 * ------------------------------------------------------------------------- */
function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }): ReactElement {
	return (
		<motion.div
			role="alert"
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
			className={[
				"w-full rounded-[2px] border border-[var(--color-crimson)]/30",
				"bg-[color-mix(in_oklab,var(--color-crimson)_6%,var(--color-onyx))]",
				"px-4 py-3 text-[var(--text-ui)]",
			].join(" ")}
		>
			<p className="text-[var(--color-alabaster)]/80">
				No fue posible conectar. <span className="text-[var(--color-fg-muted)]">{error}</span>
			</p>
			<button
				type="button"
				onClick={onRetry}
				className={[
					"mt-1.5 text-[var(--color-gold)] underline-offset-2 hover:underline",
					"focus-visible:outline-none focus-visible:ring-2",
					"focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-2",
					"focus-visible:ring-offset-[var(--color-onyx)]",
				].join(" ")}
			>
				Reintentar
			</button>
		</motion.div>
	);
}

/* -------------------------------------------------------------------------
 * InitialHint — visible cuando el transcript está vacío y no hay error.
 * Texto literal del spec. Ubicado sobre el botón mic.
 * ------------------------------------------------------------------------- */
function InitialHint(): ReactElement {
	return (
		<motion.p
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className={[
				"max-w-[22rem] text-center",
				"text-[var(--text-ui)] text-[var(--color-fg-muted)]",
				"leading-[1.55]",
			].join(" ")}
		>
			Pulse el micrófono y diga su primera pregunta. Hable como hablaría con un consultor.
		</motion.p>
	);
}

/* -------------------------------------------------------------------------
 * TranscriptRegion — lista scrollable de los últimos MAX_VISIBLE_TURNS turnos.
 *
 * - role="log" + aria-live="polite" para que lectores de pantalla anuncien
 *   entradas nuevas sin interrumpir el flujo de voz.
 * - Auto-scroll al final cuando llegan entradas nuevas.
 * - Usuario: alineado a la derecha, etiqueta "Usted".
 * - Teo: alineado a la izquierda, etiqueta "Teo".
 * - Fuente: Inter Variable (body font, text-ui size) — NO display font.
 * ------------------------------------------------------------------------- */
function TranscriptRegion({ entries }: { entries: TranscriptEntry[] }): ReactElement {
	const bottomRef = useRef<HTMLDivElement>(null);
	// Siempre mostramos los últimos MAX_VISIBLE_TURNS, calculando el offset global
	// para que la key de cada elemento sea estable y no dependa del índice local.
	const totalCount = entries.length;
	const startIdx = Math.max(0, totalCount - MAX_VISIBLE_TURNS);
	const visible = entries.slice(startIdx);

	// Auto-scroll: usamos un ref con el conteo previo para disparar scroll
	// solo cuando llegan entradas nuevas, sin incluir entries en las deps.
	const prevCountRef = useRef(totalCount);
	useEffect(() => {
		if (totalCount !== prevCountRef.current) {
			prevCountRef.current = totalCount;
			bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
		}
	});

	return (
		<div
			role="log"
			aria-label="Transcript de la conversación"
			aria-live="polite"
			aria-atomic="false"
			className={[
				"flex-1 min-h-0 overflow-y-auto",
				"flex flex-col gap-3",
				"px-1 py-2",
				// Scrollbar sutil con brand tones
				"[scrollbar-width:thin]",
				"[scrollbar-color:var(--color-divider)_transparent]",
			].join(" ")}
		>
			{visible.map((entry, localIdx) => {
				// La key usa el índice global (startIdx + localIdx) para ser estable
				// mientras el transcript crece — no cambia al recortar `visible`.
				const globalIdx = startIdx + localIdx;
				return <TranscriptTurn key={`${globalIdx}-${entry.role}`} entry={entry} />;
			})}
			<div ref={bottomRef} aria-hidden="true" />
		</div>
	);
}

/* -------------------------------------------------------------------------
 * TranscriptTurn — una entrada del transcript.
 *
 * Usuario    → alineado a la derecha, menor peso visual.
 * Teo  → alineado a la izquierda, peso ligeramente mayor.
 * ------------------------------------------------------------------------- */
function TranscriptTurn({ entry }: { entry: TranscriptEntry }): ReactElement {
	const isUser = entry.role === "user";

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
			className={["flex flex-col gap-0.5", isUser ? "items-end" : "items-start"].join(" ")}
		>
			{/* Etiqueta de rol */}
			<span
				className={[
					"text-[0.6875rem] font-medium uppercase tracking-[0.1em]",
					isUser ? "text-[var(--color-fg-muted)]/60" : "text-[var(--color-gold)]/70",
				].join(" ")}
				aria-hidden="true"
			>
				{isUser ? "Usted" : "Teo"}
			</span>

			{/* Burbuja del mensaje */}
			<div
				className={[
					"max-w-[88%] rounded-[2px] px-3.5 py-2.5",
					"font-[var(--font-sans)] text-[var(--text-ui)] leading-[1.55]",
					isUser
						? [
								"bg-[color-mix(in_oklab,var(--color-alabaster)_7%,transparent)]",
								"border border-[var(--color-alabaster)]/12",
								"text-[var(--color-alabaster)]/75",
							].join(" ")
						: [
								"bg-[color-mix(in_oklab,var(--color-burgundy)_8%,transparent)]",
								"border border-[var(--color-burgundy)]/20",
								"text-[var(--color-alabaster)]/90",
							].join(" "),
				].join(" ")}
			>
				{entry.text}
			</div>
		</motion.div>
	);
}

/* =========================================================================
 * ConversationUI — componente raíz exportado
 *
 * Layout interno (flex column, fills assigned area):
 *   1. TranscriptRegion (flex-1, scrollable) — cuando hay transcript
 *   2. InitialHint        — cuando transcript vacío + idle + sin error
 *   3. MicButton + StatusLabel (centrado)
 *   4. ErrorBanner        — cuando error !== null
 *
 * El componente NO impone ancho fijo — se adapta al flex/grid cell de la
 * página que lo envuelva (app/protolab/page.tsx).
 * ========================================================================= */
export function ConversationUI({
	onStart,
	onStop,
}: {
	onStart: () => void;
	onStop: () => void;
}): ReactElement {
	const status = useConversationStore((s) => s.status);
	const transcript = useConversationStore((s) => s.transcript);
	const error = useConversationStore((s) => s.error);

	// Filtra entradas con texto vacío (VoiceClient crea una entry placeholder
	// para el acumulador de streaming — no debe aparecer como burbuja en blanco).
	const visibleTranscript = transcript.filter((t) => t.text.trim() !== "");
	const showHint = visibleTranscript.length === 0 && status === "idle" && error === null;
	const showTranscript = visibleTranscript.length > 0;

	return (
		// region semántica — nombrada para AT sin agregar encabezado visible.
		// Se usa <section> en lugar de <div> para que aria-label sea válido.
		<section
			aria-label="Conversación con el Teo"
			className={["flex h-full flex-col", "bg-[var(--color-onyx)]", "gap-5 px-4 py-6"].join(" ")}
		>
			{/* Transcript — crece para llenar el espacio disponible */}
			{showTranscript && <TranscriptRegion entries={visibleTranscript} />}

			{/* Zona central — hint + botón + estado */}
			<div
				className={[
					"flex flex-col items-center gap-4",
					// Si no hay transcript, centrar verticalmente en el espacio asignado
					showTranscript ? "" : "flex-1 justify-center",
				].join(" ")}
			>
				{showHint && <InitialHint />}

				<MicButton status={status} onStart={onStart} onStop={onStop} />

				<StatusLabel status={status} />
			</div>

			{/* Error — al final, separado del botón */}
			{error !== null && <ErrorBanner error={error} onRetry={onStart} />}
		</section>
	);
}
