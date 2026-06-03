"use client";

import type { Application } from "@splinetool/runtime";
import { motion, useReducedMotion } from "motion/react";
import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { Card } from "@/components/ui/Card";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SpliteScene } from "@/components/ui/Splite";
import { Spotlight } from "@/components/ui/Spotlight";
import { TextShimmer } from "@/components/ui/TextShimmer";

/* =========================================================================
 * HeroSplite — PR6 (hardened)
 *
 * Hero de /consultoria. Card oscuro a sangrado completo, Spotlight dorado,
 * veil de legibilidad para la columna izquierda y layout split 50/50 con la
 * escena Spline a la derecha. La copy izquierda usa un typewriter editorial
 * con cursor crimson; las pills permiten al socio marcar dolores y el banner
 * inferior reacciona con la lista de los términos seleccionados.
 *
 * Hardening (2026-06-03):
 *   - Typewriter resilient: render full text en SSR/no-JS/reduced-motion;
 *     efecto typewriter como enhancement post-hydrate. sr-only ya no duplica.
 *   - Symptom persistence: sync con ?sintomas= en URL. Sobrevive scroll,
 *     refresh, navegación back/forward y deep-link.
 *   - Spline failure isolation: ErrorBoundary + timeout 10s. Fallback
 *     geométrico con retry sin bloquear el resto del hero.
 *   - Mouse-follow safety: RAF solo arranca con robot resuelto; pointerleave
 *     en document; matchMedia fallback compatible Safari < 14.
 *   - Reduced motion honrado también en SymptomPill check icon.
 *   - Copy sin em-dash (DESIGN.md ban) y overflow defensivo en banner.
 * ========================================================================= */

const SPLINE_SCENE = "https://prod.spline.design/cNuv3mbYZVR2Citm/scene.splinecode";
const SPLINE_LOAD_TIMEOUT_MS = 10_000;

// Candidatos para localizar el root del robot en la escena Spline. Se prueba
// por name en orden; el primero que matchee es el que rotamos.
const ROBOT_NAME_CANDIDATES = ["922f8171beff441b", "Robot", "robot", "Body", "Character", "Scene"];

// Límites de rotación (radianes) y velocidad de lerp para suavizado.
const ROBOT_MAX_YAW = 0.55; // ~31° horizontal
const ROBOT_MAX_PITCH = 0.28; // ~16° vertical
const ROBOT_LERP = 0.09;

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
const TITLE_FULL_TEXT = `${TITLE_LINE_ONE} ${TITLE_LINE_TWO_PREFIX}${TITLE_LINE_TWO_KEY}${TITLE_LINE_TWO_SUFFIX}`;

const TYPEWRITER_DELAY_MS = 520;
const TYPEWRITER_STEP_MS = 42;

const SYMPTOMS = ["Horas", "Riesgo", "Propuestas", "Otro"] as const;
type Symptom = (typeof SYMPTOMS)[number];
const SYMPTOMS_SET: ReadonlySet<string> = new Set<string>(SYMPTOMS);
const SYMPTOMS_QUERY_KEY = "sintomas";

/* -------------------------------------------------------------------------
 * URL <-> Set helpers (idempotentes, SSR-safe)
 * ------------------------------------------------------------------------- */

function parseSymptomsFromQuery(value: string | null | undefined): Set<Symptom> {
	const next = new Set<Symptom>();
	if (!value) return next;
	for (const raw of value.split(",")) {
		const trimmed = raw.trim();
		if (SYMPTOMS_SET.has(trimmed)) next.add(trimmed as Symptom);
	}
	return next;
}

function serializeSymptoms(active: ReadonlySet<Symptom>): string {
	// Orden canónico (no por inserción) para URLs estables y compartibles.
	return SYMPTOMS.filter((s) => active.has(s)).join(",");
}

interface TypedTitleProps {
	count: number;
	done: boolean;
}

function TypedTitle({ count, done }: TypedTitleProps): ReactElement {
	// Compose the partially typed title across the two lines + the highlighted span.
	const lineOneVisible = TITLE_LINE_ONE.slice(0, count);
	const remainderAfterLineOne = Math.max(0, count - TITLE_LINE_ONE.length - 1); // -1 for newline
	const showLineTwo = count > TITLE_LINE_ONE.length;
	const lineTwoPrefixVisible = TITLE_LINE_TWO_PREFIX.slice(0, remainderAfterLineOne);
	const remainderAfterPrefix = Math.max(0, remainderAfterLineOne - TITLE_LINE_TWO_PREFIX.length);
	const keyVisible = TITLE_LINE_TWO_KEY.slice(0, remainderAfterPrefix);
	const remainderAfterKey = Math.max(0, remainderAfterPrefix - TITLE_LINE_TWO_KEY.length);
	const suffixVisible = TITLE_LINE_TWO_SUFFIX.slice(0, remainderAfterKey);

	return (
		<h1
			aria-label={TITLE_FULL_TEXT}
			className="text-display text-[var(--color-alabaster)] tracking-tight [font-family:var(--font-display)] [text-wrap:balance]"
			style={{ minHeight: "2.2em", lineHeight: 1.05 }}
		>
			{/* Visible content — aria-hidden true durante el typewriter para evitar
			    que el lector de pantalla narre un texto parcial. El aria-label arriba
			    carga el contenido completo, así que la accesibilidad nunca depende
			    del estado del typewriter. */}
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
			{/* Blinking cursor — hidden once typing completes */}
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
	const prefersReducedMotion = useReducedMotion();
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
					initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
					animate={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
					transition={
						prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }
					}
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

/* -------------------------------------------------------------------------
 * Spline fallbacks
 *   - SpliteSkeleton:   placeholder durante carga (Suspense).
 *   - SpliteErrorPanel: fallback estático cuando el chunk lazy o el .splinecode
 *                       fallan / timeout. NUNCA bloquea el resto del hero.
 * ------------------------------------------------------------------------- */

function SpliteSkeleton(): ReactElement {
	return (
		<div
			className="flex h-full w-full items-center justify-center bg-[var(--color-onyx)]"
			aria-hidden="true"
		>
			<span className="text-mono text-[0.65rem] text-[var(--color-fg-muted)] tracking-[0.18em] uppercase">
				Cargando escena
			</span>
		</div>
	);
}

interface SpliteErrorPanelProps {
	onRetry: () => void;
}

function SpliteErrorPanel({ onRetry }: SpliteErrorPanelProps): ReactElement {
	return (
		<div
			className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[var(--color-onyx)]"
			role="img"
			aria-label="Escena 3D no disponible"
		>
			{/* Hairline geométrico que llena el espacio sin caer en stock-3D fake. */}
			<svg
				className="absolute inset-0 h-full w-full opacity-40"
				viewBox="0 0 200 200"
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
			>
				<title>Patrón decorativo</title>
				<defs>
					<pattern id="grid-fallback" width="20" height="20" patternUnits="userSpaceOnUse">
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="var(--color-divider)"
							strokeWidth="0.5"
						/>
					</pattern>
				</defs>
				<rect width="200" height="200" fill="url(#grid-fallback)" />
				<circle cx="100" cy="100" r="36" fill="none" stroke="var(--color-gold)" strokeWidth="0.4" />
				<circle cx="100" cy="100" r="60" fill="none" stroke="var(--color-gold)" strokeWidth="0.3" />
			</svg>
			<button
				type="button"
				onClick={onRetry}
				className="relative z-10 inline-flex items-center gap-2 rounded-[2px] border border-[var(--color-alabaster)]/22 bg-white/[0.05] px-4 py-2 text-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-alabaster)]/80 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-onyx)]"
			>
				Reintentar escena
			</button>
		</div>
	);
}

/* -------------------------------------------------------------------------
 * SpliteSlot — wrapper que enlaza ErrorBoundary + timeout + retry. El timeout
 * dispara error sintético si la escena no notifica onLoad en SPLINE_LOAD_TIMEOUT_MS;
 * el ErrorBoundary lo captura y rinde el fallback con retry sin matar el árbol.
 * ------------------------------------------------------------------------- */

interface SpliteSlotProps {
	onLoad: (app: Application) => void;
}

function SpliteSlot({ onLoad }: SpliteSlotProps): ReactElement {
	// key remount-counter — incrementar fuerza al ErrorBoundary a re-instanciar
	// el árbol completo, re-disparando el lazy() y la descarga del .splinecode.
	const [attempt, setAttempt] = useState(0);
	const [timedOut, setTimedOut] = useState(false);

	useEffect(() => {
		setTimedOut(false);
		const id = window.setTimeout(() => setTimedOut(true), SPLINE_LOAD_TIMEOUT_MS);
		return () => window.clearTimeout(id);
	}, []);

	const handleLoad = useCallback(
		(app: Application) => {
			setTimedOut(false);
			onLoad(app);
		},
		[onLoad],
	);

	const retry = useCallback(() => setAttempt((n) => n + 1), []);

	if (timedOut) {
		return <SpliteErrorPanel onRetry={retry} />;
	}

	return (
		<ErrorBoundary
			key={attempt}
			fallback={({ retry: retryFromBoundary }) => (
				<SpliteErrorPanel
					onRetry={() => {
						retryFromBoundary();
						retry();
					}}
				/>
			)}
		>
			<SpliteScene
				scene={SPLINE_SCENE}
				className="h-full w-full"
				fallback={<SpliteSkeleton />}
				onLoad={handleLoad}
			/>
		</ErrorBoundary>
	);
}

export function HeroSplite(): ReactElement {
	const prefersReducedMotion = useReducedMotion();

	// Typewriter
	//
	// CRÍTICO: el SSR debe rendear el texto COMPLETO. Si arrancamos en 0 y JS
	// falla / es lento, el sighted user ve un h1 vacío (aria-label sigue dando
	// el texto al SR, pero la lectura visual queda rota). Defaulteamos a
	// TITLE_TOTAL y el useEffect rebobina sólo cuando confirmamos que motion
	// está permitido y estamos hidratados. El flash de 1 frame es preferible
	// a perder el contenido cuando JS no carga.
	const [typedCount, setTypedCount] = useState<number>(TITLE_TOTAL);

	// Selected symptoms — sync con URL (?sintomas=Horas,Riesgo). Inicializa
	// vacío en SSR/primer paint y se hidrata en useEffect leyendo
	// window.location.search directamente; el toggle escribe vía
	// history.replaceState para no disparar navegación ni re-fetch del RSC
	// tree. Leer window directo evita el bailout de useSearchParams() que
	// fuerza Suspense en prerender estático.
	const [selected, setSelected] = useState<Set<Symptom>>(() => new Set());

	// Refs para el mouse-follow React. Se actualizan dentro de un RAF sin
	// disparar re-renders.
	const robotObjRef = useRef<{
		rotation?: { x: number; y: number; z: number };
	} | null>(null);
	const mouseRef = useRef({ targetX: 0, targetY: 0, x: 0, y: 0 });
	const rafRef = useRef<number | null>(null);

	const handleSplineLoad = useCallback((app: Application) => {
		for (const name of ROBOT_NAME_CANDIDATES) {
			const obj = app.findObjectByName(name);
			if (obj) {
				robotObjRef.current = obj as never;
				return;
			}
		}
	}, []);

	// Hydrate selección desde la URL — leer al montar y suscribirse a
	// `popstate` para reaccionar a back/forward del navegador. No usamos
	// useSearchParams() para evitar el suspense-boundary bailout de Next.js
	// durante prerender estático.
	useEffect(() => {
		if (typeof window === "undefined") return;

		const sync = () => {
			const params = new URLSearchParams(window.location.search);
			const next = parseSymptomsFromQuery(params.get(SYMPTOMS_QUERY_KEY));
			setSelected((prev) => {
				if (prev.size === next.size) {
					let same = true;
					for (const s of prev) {
						if (!next.has(s)) {
							same = false;
							break;
						}
					}
					if (same) return prev;
				}
				return next;
			});
		};

		sync();
		window.addEventListener("popstate", sync);
		return () => window.removeEventListener("popstate", sync);
	}, []);

	// Mouse-follow React.
	// Captura mousemove global del viewport (no del canvas), normaliza a -1..1
	// y aplica rotación al root del robot con lerp suavizado. Esto bypasea la
	// limitación del Mouse Look nativo de Spline que solo opera dentro del
	// rectángulo del canvas.
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

		const tick = () => {
			const obj = robotObjRef.current;
			if (obj?.rotation) {
				const m = mouseRef.current;
				m.x += (m.targetX - m.x) * ROBOT_LERP;
				m.y += (m.targetY - m.y) * ROBOT_LERP;
				obj.rotation.y = m.x * ROBOT_MAX_YAW;
				// Pitch: este modelo GLB usa `rotation.x` positivo = mirar abajo
				// (convención opuesta a three.js estándar). Sin signo negativo
				// para mantener correspondencia natural con el cursor.
				obj.rotation.x = m.y * ROBOT_MAX_PITCH;
			}
			rafRef.current = requestAnimationFrame(tick);
		};

		window.addEventListener("mousemove", handleMove, { passive: true });
		// pointerleave en document es más confiable que mouseout en window;
		// no bubblea desde hijos y dispara una sola vez cuando el cursor
		// abandona la ventana.
		document.addEventListener("pointerleave", handleLeave);
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener("mousemove", handleMove);
			document.removeEventListener("pointerleave", handleLeave);
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [prefersReducedMotion]);

	// Typewriter effect — chained setTimeouts; respeta prefers-reduced-motion
	// arrancando en TITLE_TOTAL (sin animar). En el path "motion permitido"
	// rebobina a 0 y arranca; esto causa un flash de 1 frame (full → blank →
	// typing) que es preferible a perder el contenido del h1 cuando JS no
	// llega a ejecutarse.
	useEffect(() => {
		if (prefersReducedMotion) {
			setTypedCount(TITLE_TOTAL);
			return;
		}
		setTypedCount(0);
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

	// Media query lg+ SSR-safe. Mantiene UNA sola instancia viva del
	// SpliteScene según viewport y evita descargar el .splinecode dos veces.
	// Fallback a addListener para Safari < 14, que no soporta addEventListener
	// en MediaQueryList.
	const [isLgUp, setIsLgUp] = useState<boolean | null>(null);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(min-width: 1024px)");
		const update = () => setIsLgUp(mq.matches);
		update();
		if (typeof mq.addEventListener === "function") {
			mq.addEventListener("change", update);
			return () => mq.removeEventListener("change", update);
		}
		// Legacy fallback (Safari < 14, IE).
		mq.addListener(update);
		return () => mq.removeListener(update);
	}, []);

	const toggleSymptom = useCallback((value: Symptom) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			// Persistir en URL — replaceState evita poblar el back-stack
			// con cada toggle y no dispara navegación del router.
			if (typeof window !== "undefined") {
				const url = new URL(window.location.href);
				const serialized = serializeSymptoms(next);
				if (serialized) {
					url.searchParams.set(SYMPTOMS_QUERY_KEY, serialized);
				} else {
					url.searchParams.delete(SYMPTOMS_QUERY_KEY);
				}
				window.history.replaceState(window.history.state, "", url.toString());
			}
			return next;
		});
	}, []);

	const activeList = useMemo<Symptom[]>(() => SYMPTOMS.filter((s) => selected.has(s)), [selected]);

	const typedDone = typedCount >= TITLE_TOTAL;

	return (
		<section id="hero-diagnostico" aria-label="Diagnóstico TheoLab — apertura" className="relative">
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

				{/* Spline scene container — full bleed on lg, stacked beneath copy on mobile.
				    Wider on lg+ to fit the full character; slight top offset so la
				    cabeza no choca con la navbar. */}
				<div className="absolute inset-0 z-0 hidden lg:block">
					<div className="absolute top-[clamp(56px,8vh,96px)] bottom-0 right-0 w-full lg:w-[64%] xl:w-[60%]">
						{isLgUp === true ? <SpliteSlot onLoad={handleSplineLoad} /> : <SpliteSkeleton />}
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
						className="flex min-w-0 flex-col gap-7 max-w-xl"
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
						<motion.div variants={fadeUp} className="flex min-w-0 flex-col gap-3.5 pt-2">
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
										Seleccione lo que aplique. Sin compromiso.
									</p>
								) : (
									<motion.div
										key={activeList.join("|")}
										initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={
											prefersReducedMotion
												? { duration: 0 }
												: { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
										}
										className={[
											"flex min-w-0 items-center gap-3 rounded-[4px] px-5 py-3.5",
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
										<p className="min-w-0 break-words text-[0.9375rem] text-[var(--color-alabaster)]/85">
											<span>Reconocido. Lo abordamos en el Diagnóstico: </span>
											<span className="text-[var(--color-gold)]">{activeList.join(", ")}</span>
										</p>
									</motion.div>
								)}
							</div>
						</motion.div>
					</motion.div>

					{/* Mobile / <lg Spline column — stacked under copy. aspect 4/5
					   en vez de square mantiene el robot legible sin comerse el
					   viewport en pantallas chicas (~ 320-360 px de ancho). */}
					<div className="relative aspect-[4/5] w-full max-h-[60svh] overflow-hidden border border-[var(--color-divider)]/40 bg-[var(--color-onyx)] lg:hidden">
						{isLgUp === false ? <SpliteSlot onLoad={handleSplineLoad} /> : <SpliteSkeleton />}
					</div>

					{/* Right column placeholder — keeps grid balance on lg; actual scene
				   is absolutely positioned above for full bleed. */}
					<div className="hidden lg:block" aria-hidden="true" />
				</div>
			</Card>
		</section>
	);
}
