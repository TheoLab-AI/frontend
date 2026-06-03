"use client";

import { motion } from "motion/react";
import { type ReactElement, useId } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";
import {
	FOUNDER_FRAME,
	FOUNDER_SPOTS_TOTAL,
	STEPS,
	type Step,
	type StepOption,
} from "@/lib/oferta";

/* =========================================================================
 * F03 · OfferLadderV3 — Embudo Cómo trabajamos
 *
 * Tres peldaños editorial en tema onyx con grid 3-6-3 (peldaño 02
 * Consultoría wide con dos tiers Inicial + Completa). Pricing inline
 * simultáneo: cada tier muestra precio regular tachado en menor jerarquía
 * y precio fundador en gold display si `option.founderPrice` está presente.
 * Si no hay precio fundador, sólo se renderiza el regular sin tachón.
 *
 * Fuente única: `lib/oferta.ts` (consume STEPS + FOUNDER_FRAME +
 * FOUNDER_SPOTS_TOTAL). El componente original `OfferLadder.tsx` (Alexis)
 * sigue intacto y lo consume el home institucional con precios regulares.
 *
 * Copy editorial literal del prototipo HTML v3
 * (design_handoff_consultoria_hero_3d/reference-prototype/
 *  TheoLab - Consultoría v3.html, sección F03).
 * ========================================================================= */

const formatStepIndex = (i: number): string => String(i + 1).padStart(2, "0");

const SECTION_COPY = {
	eyebrow: "Cómo trabajamos",
	headline: "Tres peldaños. Cada uno responde una pregunta distinta.",
	sub: "TheoLab no vende una herramienta de IA. Vende criterio sobre dónde aplicarla — y la mano que la implementa cuando la decisión ya está tomada, sobre los números de su firma.",
} as const;

export function OfferLadderV3(): ReactElement {
	return (
		<section
			id="como"
			aria-labelledby="como-headline"
			className="border-b border-[var(--color-divider)] bg-[var(--color-onyx)] text-[var(--color-alabaster)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="flex flex-col gap-14 md:gap-16"
				>
					{/* Header */}
					<motion.div variants={fadeUp} className="flex flex-col gap-5 max-w-3xl">
						<div className="flex items-center gap-3 text-meta uppercase tracking-[0.22em] text-[var(--color-alabaster)]/75">
							<span aria-hidden="true" className="text-[var(--color-gold)]">
								●
							</span>
							<span>{SECTION_COPY.eyebrow}</span>
						</div>
						<h2
							id="como-headline"
							className="text-headline text-[var(--color-alabaster)] [text-wrap:balance]"
						>
							{SECTION_COPY.headline}
						</h2>
						<p className="text-body-lg text-[var(--color-alabaster)]/75 [text-wrap:pretty] max-w-2xl leading-[1.6]">
							{SECTION_COPY.sub}
						</p>
					</motion.div>

					{/* Embudo — grid 3-6-3 (peldaño 02 wide).
					    role="list" explícito porque Safari + VoiceOver descartan el rol
					    implícito del <ol> cuando se aplica list-style:none vía Tailwind. */}
					<motion.ol
						role="list"
						variants={stagger(0.12)}
						className="grid grid-cols-1 md:grid-cols-12 list-none"
					>
						{STEPS.map((step, i) => (
							<PeldanoCell key={step.name} step={step} index={i} total={STEPS.length} />
						))}
					</motion.ol>
				</motion.div>
			</div>
		</section>
	);
}

/* -------------------------------------------------------------------------
 * PeldanoCell
 *
 * Render de cada peldaño. Tag mono uniforme "Peldaño 0X" + h3 con
 * `step.name`. Despacha render interno según presencia de `step.options`:
 *   - Sin options → "single" (Reunión, Implementación) — meta global del
 *     peldaño usa step.price.
 *   - Con options → "wide" (Consultoría) — note + dos tiers + frame
 *     editorial fundador.
 * Sólo debe renderizarse dentro de OfferLadderV3.
 * ------------------------------------------------------------------------- */

function PeldanoCell({
	step,
	index,
	total,
}: {
	step: Step;
	index: number;
	total: number;
}): ReactElement {
	const isWide = Boolean(step.options);
	const spanClass = isWide ? "md:col-span-6" : "md:col-span-3";
	const isLast = index === total - 1;

	// En mobile: border-b entre peldaños (no en el último).
	// En md+: border-r en los peldaños que no son el último (separa columnas).
	// The Hairline-Not-Border Rule: 1px solid var(--color-divider).
	const dividerClass = [
		!isLast ? "border-b border-[var(--color-divider)]" : "",
		!isLast ? "md:border-b-0 md:border-r md:border-[var(--color-divider)]" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<motion.li
			role="listitem"
			variants={fadeUp}
			className={`relative bg-[var(--color-onyx)] p-8 md:p-10 flex flex-col gap-6 min-h-[320px] ${spanClass} ${dividerClass}`}
		>
			<p className="text-mono text-[0.75rem] uppercase tracking-[0.22em] text-[var(--color-gold)]">
				Peldaño {formatStepIndex(index)}
			</p>

			<h3 className="text-title text-[var(--color-alabaster)] [text-wrap:balance]">{step.name}</h3>

			{isWide ? <WidePeldano step={step} /> : <SinglePeldano step={step} />}
		</motion.li>
	);
}

/* -------------------------------------------------------------------------
 * SinglePeldano — Reunión + Implementación
 * Sólo debe renderizarse dentro de PeldanoCell (depende del gap-6 padre).
 * ------------------------------------------------------------------------- */

function SinglePeldano({ step }: { step: Step }): ReactElement {
	return (
		<>
			{step.price ? (
				<p className="text-mono text-[0.75rem] uppercase tracking-[0.2em] text-[var(--color-alabaster)]/75">
					{step.price}
				</p>
			) : null}

			{step.detail ? (
				<p className="text-body text-[var(--color-alabaster)]/80 [text-wrap:pretty] leading-[1.65]">
					{step.detail}
				</p>
			) : null}

			{step.note ? (
				<div className="mt-auto flex items-start gap-3 pt-2">
					<span
						aria-hidden="true"
						className="mt-2 block h-px w-6 shrink-0 bg-[var(--color-gold)]"
					/>
					<span className="text-meta text-[var(--color-alabaster)]/75 [text-wrap:pretty] normal-case tracking-[0.04em]">
						{step.note}
					</span>
				</div>
			) : null}
		</>
	);
}

/* -------------------------------------------------------------------------
 * WidePeldano — Consultoría (2 tiers Inicial + Completa)
 * Sólo debe renderizarse dentro de PeldanoCell.
 * ------------------------------------------------------------------------- */

function WidePeldano({ step }: { step: Step }): ReactElement {
	const options = step.options ?? [];
	return (
		<>
			{step.note ? (
				<p className="text-body text-[var(--color-alabaster)]/80 [text-wrap:pretty] max-w-xl leading-[1.55]">
					{step.note}
				</p>
			) : null}

			<div className="grid grid-cols-1 md:grid-cols-2 mt-2">
				{options.map((option, idx) => (
					<TierBlock key={option.label} option={option} isFirst={idx === 0} />
				))}
			</div>

			<FounderFrame />
		</>
	);
}

/* -------------------------------------------------------------------------
 * TierBlock — Inicial / Completa
 *
 * Layout: h4 con nombre del tier + detail mono + price row. role="group"
 * con aria-labelledby al h4 para que SR anuncie el bloque agrupado al
 * navegar al tier. Si hay founderPrice, render StrikethroughPrice +
 * DisplayPrice (split fundador). Si no, sólo DisplayPrice.
 * ------------------------------------------------------------------------- */

function TierBlock({ option, isFirst }: { option: StepOption; isFirst: boolean }): ReactElement {
	const hasFounder = Boolean(option.founderPrice);
	const tierLabelId = useId();

	// En mobile: border-b en el primer tier (separa Inicial de Completa).
	// En md+: border-r en el primer tier (columna izquierda / columna derecha).
	// The Hairline-Not-Border Rule: 1px solid var(--color-divider).
	const tierDivider = isFirst
		? "border-b border-[var(--color-divider)] md:border-b-0 md:border-r md:border-[var(--color-divider)]"
		: "";

	return (
		<article
			className={`bg-[var(--color-onyx)] p-6 md:p-7 flex flex-col gap-4 ${tierDivider}`}
			aria-labelledby={tierLabelId}
		>
			<div className="flex flex-col gap-1">
				<h4
					id={tierLabelId}
					className="text-[1.25rem] font-semibold text-[var(--color-alabaster)] [text-wrap:balance] leading-tight"
				>
					{option.label}
				</h4>
				<p className="text-mono text-[0.75rem] uppercase tracking-[0.22em] text-[var(--color-alabaster)]/75">
					{option.detail}
				</p>
			</div>

			<div className="flex flex-wrap items-end gap-x-5 gap-y-3">
				{hasFounder && option.founderPrice ? (
					<>
						<StrikethroughPrice price={option.price} />
						<DisplayPrice
							price={option.founderPrice}
							note={option.founderNote}
							srLabel="Precio fundador"
						/>
					</>
				) : (
					<DisplayPrice price={option.price} srLabel="Precio" />
				)}
			</div>
		</article>
	);
}

/* -------------------------------------------------------------------------
 * StrikethroughPrice — precio regular tachado cuando hay edición fundadora
 *
 * Usa `<del>` semántico (rol implícito deletion para SR) + texto sr-only
 * "Precio anterior:" que contextualiza al usuario ciego. Visual: line-
 * through con opacidad /65 (≈ 5.0:1 sobre onyx, pasa AA texto pequeño).
 * ------------------------------------------------------------------------- */

function StrikethroughPrice({ price }: { price: string }): ReactElement {
	return (
		<span className="flex flex-col gap-1">
			<span className="sr-only">Precio anterior: </span>
			<del className="text-body text-[var(--color-alabaster)]/65 tabular-nums leading-none decoration-[var(--color-alabaster)]/50 no-underline line-through">
				{price}
			</del>
			<span className="text-mono text-[0.75rem] uppercase tracking-[0.24em] text-[var(--color-alabaster)]/75">
				Regular
			</span>
		</span>
	);
}

/* -------------------------------------------------------------------------
 * DisplayPrice — precio prominente en gold display
 *
 * Caso general (sin fundador) o tier con edición fundadora activa. El
 * `srLabel` es leído por SR antes del precio para darle contexto sin
 * romper el flow visual.
 * ------------------------------------------------------------------------- */

interface DisplayPriceProps {
	price: string;
	note?: string;
	srLabel: string;
}

function DisplayPrice({ price, note, srLabel }: DisplayPriceProps): ReactElement {
	return (
		<span className="flex flex-col gap-1">
			<span className="sr-only">{srLabel}: </span>
			<span className="text-[1.75rem] font-semibold text-[var(--color-gold)] tabular-nums leading-none [font-family:var(--font-display)] tracking-[-0.01em]">
				{price}
			</span>
			{note ? (
				<span className="text-mono text-[0.75rem] uppercase tracking-[0.24em] text-[var(--color-gold)]/85">
					{note}
				</span>
			) : null}
		</span>
	);
}

/* -------------------------------------------------------------------------
 * FounderFrame
 *
 * Marco editorial del cierre del peldaño Consultoría. Wrappeado en
 * `<aside>` con aria-label "Edición fundadora" para que el SR lo anuncie
 * como bloque informativo cohesivo (escasez/urgencia).
 * ------------------------------------------------------------------------- */

function FounderFrame(): ReactElement {
	return (
		<aside
			aria-label="Edición fundadora"
			className="mt-auto flex flex-col gap-3 pt-4 border-t border-[var(--color-alabaster)]/12"
		>
			<p className="text-mono text-[0.75rem] uppercase tracking-[0.28em] text-[var(--color-gold)]/85">
				Edición fundadora · {FOUNDER_SPOTS_TOTAL} cupos
			</p>
			<p className="text-body text-[var(--color-alabaster)]/75 [text-wrap:pretty] max-w-2xl leading-[1.6]">
				{FOUNDER_FRAME}
			</p>
		</aside>
	);
}
