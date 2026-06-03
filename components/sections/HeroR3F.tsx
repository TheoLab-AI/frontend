"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";
import type { MouseFollowRef } from "@/components/r3f/RobotLookAt";
import { HeroR3FScene } from "@/components/sections/HeroR3FScene";
import { Card } from "@/components/ui/Card";
import { Spotlight } from "@/components/ui/Spotlight";
import { TextShimmer } from "@/components/ui/TextShimmer";

/* =========================================================================
 * HeroR3F — Hero de producción · Fase 3 R3F
 *
 * Reemplaza HeroSplite.tsx en /consultoria. Mantiene la ARQUITECTURA VISUAL
 * idéntica (Card variant=dark, Spotlight gold upper-left, HeroVeil de
 * legibilidad, layout split 50/50 en lg, copy column con typewriter +
 * pills + banner reactivo). Lo único que cambia es el bloque 3D:
 *
 *   Spline (<SpliteScene>) → Canvas R3F (<HeroR3FScene>)
 *
 * Ventajas vs la versión Spline:
 *   - Sin watermark, sin suscripción ($0/mes vs Basic $9/mes)
 *   - LookAt rota SOLO la cabeza (head bone "tripo::Head_0") — no el cuerpo
 *     entero como hacía Spline. Movimiento más natural.
 *   - Control total del rendering en TS — exposure, environment, bloom
 *   - GLB optimizado 5.16 MB con meshopt + WebP 2K (vs ~14 MB del .splinecode)
 *
 * HeroSplite.tsx se conserva en el repo como fallback de emergencia durante
 * 1-2 sprints; después se borra.
 *
 * Constantes y sub-componentes (TypedTitle, SymptomPill, HeroVeil, SYMPTOMS,
 * etc.) están DUPLICADOS desde HeroSplite intencionalmente para mantener
 * los dos componentes aislados durante el período de fallback. Cuando
 * HeroSplite se elimine, se pueden extraer a un módulo compartido si vale.
 * ========================================================================= */

const ROBOT_NAME_CANDIDATES_DOC = "tripo::Head_0 (cabeza única que se rota)";
void ROBOT_NAME_CANDIDATES_DOC; // referencia documentacional, no es código activo

const TITLE_LINE_ONE = "Usted sabe el qué.";
const TITLE_LINE_TWO_PREFIX = "Nosotros, el ";
const TITLE_LINE_TWO_KEY = "cómo";
const TITLE_LINE_TWO_SUFFIX = ".";
const TITLE_TOTAL =
	TITLE_LINE_ONE.length +
	1 + // newline
	TITLE_LINE_TWO_PREFIX.length +
	TITLE_LINE_TWO_KEY.length +
	TITLE_LINE_TWO_SUFFIX.length;

const TYPEWRITER_DELAY_MS = 520;
const TYPEWRITER_STEP_MS = 42;

const SYMPTOMS = ["Horas", "Riesgo", "Propuestas", "Otro"] as const;
type Symptom = (typeof SYMPTOMS)[number];

interface TypedTitleProps {
	count: number;
	done: boolean;
}

function TypedTitle({ count, done }: TypedTitleProps): ReactElement {
	const lineOneVisible = TITLE_LINE_ONE.slice(0, count);
	const remainderAfterLineOne = Math.max(0, count - TITLE_LINE_ONE.length - 1);
	const showLineTwo = count > TITLE_LINE_ONE.length;
	const lineTwoPrefixVisible = TITLE_LINE_TWO_PREFIX.slice(0, remainderAfterLineOne);
	const remainderAfterPrefix = Math.max(0, remainderAfterLineOne - TITLE_LINE_TWO_PREFIX.length);
	const keyVisible = TITLE_LINE_TWO_KEY.slice(0, remainderAfterPrefix);
	const remainderAfterKey = Math.max(0, remainderAfterPrefix - TITLE_LINE_TWO_KEY.length);
	const suffixVisible = TITLE_LINE_TWO_SUFFIX.slice(0, remainderAfterKey);

	return (
		<h1
			className="text-display text-[var(--color-alabaster)] tracking-tight [font-family:var(--font-display)] [text-wrap:balance]"
			style={{ minHeight: "2.2em", lineHeight: 1.05 }}
		>
			<span aria-hidden={!done}>
				{lineOneVisible}
				{showLineTwo && (
					<>
						<br />
						{lineTwoPrefixVisible}
						{keyVisible.length > 0 && (
							<TextShimmer variant="crimson" asChild>
								<span>{keyVisible}</span>
							</TextShimmer>
						)}
						{suffixVisible}
					</>
				)}
			</span>
			{!done && (
				<span
					aria-hidden="true"
					className="ml-[0.05ch] inline-block w-[0.5ch] translate-y-[0.08em] bg-[var(--color-crimson)] align-baseline"
					style={{
						height: "0.95em",
						animation: "theolab-blink 1s step-end infinite",
					}}
				/>
			)}
			<span className="sr-only">
				{TITLE_LINE_ONE} {TITLE_LINE_TWO_PREFIX}
				{TITLE_LINE_TWO_KEY}
				{TITLE_LINE_TWO_SUFFIX}
			</span>
			<style>{`@keyframes theolab-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }`}</style>
		</h1>
	);
}

interface SymptomPillProps {
	value: Symptom;
	active: boolean;
	onToggle: (value: Symptom) => void;
}

function SymptomPill({ value, active, onToggle }: SymptomPillProps): ReactElement {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={() => onToggle(value)}
			className={[
				"inline-flex items-center gap-2 rounded-[2px] border px-[18px] py-[11px]",
				"text-[0.9375rem] transition-[background,color,border-color,transform,box-shadow] duration-300",
				"ease-[var(--ease-brand)] focus-visible:outline-none focus-visible:ring-2",
				"focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-2",
				"focus-visible:ring-offset-[var(--color-onyx)]",
				active
					? "border-transparent bg-[var(--color-alabaster)] text-[var(--color-onyx)] shadow-[0_8px_24px_-12px_rgba(229,228,226,0.45)] -translate-y-[1px]"
					: "border-[rgba(229,228,226,0.22)] bg-white/[0.05] text-[var(--color-alabaster)] hover:bg-white/[0.08]",
			].join(" ")}
		>
			{active && (
				<motion.svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="none"
					aria-hidden="true"
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						duration: 0.28,
						ease: [0.34, 1.56, 0.64, 1],
					}}
					className="h-[14px] w-[14px]"
				>
					<path
						d="M3 8.5l3.2 3.2L13 5"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="square"
						strokeLinejoin="miter"
					/>
				</motion.svg>
			)}
			<span>{value}</span>
		</button>
	);
}

function HeroVeil(): ReactElement {
	return (
		<div
			className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
			aria-hidden="true"
			style={{
				background:
					"linear-gradient(90deg, var(--color-onyx) 0%, var(--color-onyx) 28%, color-mix(in oklab, var(--color-onyx) 75%, transparent) 52%, transparent 66%)",
			}}
		/>
	);
}

function R3FFallback(): ReactElement {
	return (
		<div
			className="flex h-full w-full items-center justify-center bg-[var(--color-onyx)]"
			aria-hidden="true"
		>
			<span className="text-mono text-[0.65rem] text-[var(--color-fg-muted)] tracking-[0.18em] uppercase">
				Cargando escena…
			</span>
		</div>
	);
}

export function HeroR3F(): ReactElement {
	const prefersReducedMotion = useReducedMotion();
	const [typedCount, setTypedCount] = useState<number>(prefersReducedMotion ? TITLE_TOTAL : 0);
	const [selected, setSelected] = useState<Set<Symptom>>(() => new Set());

	// Mouse-follow shared ref. Mutado por el listener DOM, leído por el Canvas
	// vía useFrame en RobotLookAt. NO dispara re-renders.
	const mouseRef = useRef<MouseFollowRef>({ targetX: 0, targetY: 0, x: 0, y: 0 });

	// Mouse-follow DOM listener: el motivo de hacerlo aquí (no en el Canvas) es que
	// el Canvas R3F captura mousemove SOLO sobre su rect; el original Spline tenía
	// el mismo problema. Aquí lo escuchamos globalmente sobre el viewport completo
	// y normalizamos a -1..1, igual que hacía HeroSplite.
	useEffect(() => {
		if (prefersReducedMotion) return;
		if (typeof window === "undefined") return;

		const handleMove = (e: MouseEvent) => {
			mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
			mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
		};

		const handleLeave = () => {
			mouseRef.current.targetX = 0;
			mouseRef.current.targetY = 0;
		};

		window.addEventListener("mousemove", handleMove, { passive: true });
		window.addEventListener("mouseout", handleLeave);

		return () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseout", handleLeave);
		};
	}, [prefersReducedMotion]);

	// Typewriter — chained setTimeouts respect prefers-reduced-motion
	useEffect(() => {
		if (prefersReducedMotion) {
			setTypedCount(TITLE_TOTAL);
			return;
		}
		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;
		const tick = (n: number) => {
			if (cancelled) return;
			setTypedCount(n);
			if (n < TITLE_TOTAL) {
				timer = setTimeout(() => tick(n + 1), TYPEWRITER_STEP_MS);
			}
		};
		const initial = setTimeout(() => tick(1), TYPEWRITER_DELAY_MS);
		return () => {
			cancelled = true;
			clearTimeout(initial);
			if (timer) clearTimeout(timer);
		};
	}, [prefersReducedMotion]);

	// SSR-safe media query lg+ — mismo patrón que HeroSplite para evitar montar
	// dos Canvas (desktop + mobile) en simultáneo. UNA sola instancia activa
	// según viewport.
	const [isLgUp, setIsLgUp] = useState<boolean | null>(null);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(min-width: 1024px)");
		const update = () => setIsLgUp(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	const toggleSymptom = useCallback((value: Symptom) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			return next;
		});
	}, []);

	const activeList = useMemo<Symptom[]>(() => SYMPTOMS.filter((s) => selected.has(s)), [selected]);

	const typedDone = typedCount >= TITLE_TOTAL;

	return (
		<section id="hero-consultoria" aria-label="Consultoría TheoLab — apertura" className="relative">
			<Card
				variant="dark"
				padding="none"
				overflow="hidden"
				className="relative isolate min-h-[108svh] border-b border-[var(--color-divider)]"
			>
				{/* Top-left gold spotlight (z-[1]) */}
				<Spotlight fill="var(--color-gold)" className="-top-[24%] -left-[12%] z-[1]" />

				{/* Legibility veil on left column for lg+ (z-[2]) */}
				<HeroVeil />

				{/* R3F scene container — full bleed on lg, stacked beneath copy on mobile.
				    Wider on lg+ to fit the full character; slight top offset so the
				    head doesn't crowd the navbar. */}
				<div className="absolute inset-0 z-0 hidden lg:block" aria-hidden="false">
					<div className="absolute top-[clamp(56px,8vh,96px)] bottom-0 right-0 w-full lg:w-[64%] xl:w-[60%]">
						{isLgUp === true ? (
							<HeroR3FScene mouseRef={mouseRef} lookAtEnabled={!prefersReducedMotion} />
						) : (
							<R3FFallback />
						)}
					</div>
				</div>

				{/* Foreground content (z-10) */}
				<div
					className={[
						"container-brand relative z-10 grid gap-10",
						"pt-[clamp(96px,12vh,132px)] pb-12",
						"items-center lg:grid-cols-2 lg:gap-8",
					].join(" ")}
				>
					{/* Left column — copy stack */}
					<motion.div
						initial="hidden"
						animate="visible"
						variants={stagger(0.1)}
						className="flex flex-col gap-7 max-w-xl"
					>
						<motion.div
							variants={fadeUp}
							className="flex items-center gap-2 text-meta uppercase tracking-[0.22em] text-[var(--color-gold)]/70"
						>
							<span aria-hidden="true" className="text-[var(--color-gold)]">
								●
							</span>
							<span>Consultoría de IA · Firmas legales · Colombia</span>
						</motion.div>

						<motion.div variants={fadeUp}>
							<TypedTitle count={typedCount} done={typedDone} />
						</motion.div>

						<motion.p
							variants={fadeUp}
							className="text-body-lg max-w-[30rem] text-[var(--color-alabaster)]/70"
							style={{ lineHeight: 1.6 }}
						>
							Del expediente al sistema. Analizamos su firma, identificamos dónde la IA recupera
							horas y baja riesgo, y entregamos el plan. Con cifras antes de adjetivos.
						</motion.p>

						{/* Pills block */}
						<motion.div variants={fadeUp} className="flex flex-col gap-3.5 pt-2">
							<div className="flex flex-col gap-1">
								<h2
									className="font-semibold text-[var(--color-alabaster)]"
									style={{ fontSize: "clamp(1.125rem, 1.4vw, 1.375rem)" }}
								>
									¿Qué le pesa hoy?
								</h2>
								<span className="text-mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--color-alabaster)]/55">
									Seleccione lo que aplique
								</span>
							</div>

							<div className="flex flex-wrap gap-2.5">
								{SYMPTOMS.map((s) => (
									<SymptomPill
										key={s}
										value={s}
										active={selected.has(s)}
										onToggle={toggleSymptom}
									/>
								))}
							</div>

							{/* Reactive banner */}
							<div role="status" aria-live="polite" className="pt-2">
								{activeList.length === 0 ? (
									<p className="italic text-[var(--color-alabaster)]/55 text-[0.9375rem]">
										Seleccione lo que más le pese — sin compromiso.
									</p>
								) : (
									<motion.div
										key={activeList.join("|")}
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.32,
											ease: [0.16, 1, 0.3, 1],
										}}
										className={[
											"flex items-center gap-3 rounded-[4px] px-5 py-3.5",
											"border border-[var(--color-alabaster)]/22",
											"bg-[color-mix(in_oklab,var(--color-paper)_8%,transparent)]",
										].join(" ")}
									>
										<span
											aria-hidden="true"
											className="block h-2 w-2 shrink-0 rounded-[1px]"
											style={{
												background:
													"linear-gradient(90deg, var(--color-crimson) 0%, oklch(0.72 0.2 60) 50%, var(--color-gold) 100%)",
											}}
										/>
										<p className="text-[0.9375rem] text-[var(--color-alabaster)]/85">
											<span>Reconocido. Lo abordamos en el Diagnóstico: </span>
											<span className="text-[var(--color-gold)]">{activeList.join(", ")}</span>
										</p>
									</motion.div>
								)}
							</div>
						</motion.div>
					</motion.div>

					{/* Mobile / <lg R3F column — stacked under copy */}
					<div className="relative aspect-square w-full overflow-hidden border border-[var(--color-divider)]/40 bg-[var(--color-onyx)] lg:hidden">
						{isLgUp === false ? (
							<HeroR3FScene mouseRef={mouseRef} lookAtEnabled={!prefersReducedMotion} />
						) : (
							<R3FFallback />
						)}
					</div>

					{/* Right column placeholder — keeps grid balance on lg; actual scene
					   is absolutely positioned above for full bleed. */}
					<div className="hidden lg:block" aria-hidden="true" />
				</div>
			</Card>
		</section>
	);
}
