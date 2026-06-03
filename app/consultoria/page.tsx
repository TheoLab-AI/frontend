"use client";

import { motion } from "motion/react";
import { type ReactElement, useEffect, useState } from "react";
import { OfferLadderV3 } from "@/components/consultoria/OfferLadderV3";
import { fadeUp, stagger } from "@/components/motion/variants";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Diferenciadores } from "@/components/sections/Diferenciadores";
import { Espejo } from "@/components/sections/Espejo";
import { FAQ } from "@/components/sections/FAQ";
import { HeroSplite } from "@/components/sections/HeroSplite";
import { ParaQuien } from "@/components/sections/ParaQuien";

/* =========================================================================
 * /consultoria — Rediseño v3
 *
 * Estructura de 9 secciones (orden HTML v3):
 *   F01 Hero Splite          (componente HeroSplite — PR6)
 *   F02 El Espejo            (componente Espejo — PR3)
 *   F03 Cómo trabajamos      (componente OfferLadderV3 — PR4: embudo onyx
 *                              con pricing inline split fundador/regular)
 *   F04 El Diagnóstico       (placeholder hasta PR5: sticky scroll narrativo)
 *   F05 Diferenciadores      (componente Diferenciadores — PR3)
 *   F06 Para quién           (componente ParaQuien — PR3)
 *   F07 CTA final            (componente CTAFinal — PR3)
 *   F08 FAQ                  (componente FAQ — PR3)
 *
 * ConsultoriaHeader y ConsultoriaFooter están montados en el layout
 * (app/consultoria/layout.tsx) junto con el JSON-LD del Service.
 *
 * Toda la copy es literal del prototipo HTML v3:
 *   C:/Users/juanj/Downloads/TheoLab Design System (1)/
 *     design_handoff_consultoria_hero_3d/reference-prototype/
 *     TheoLab - Consultoría v3.html
 * ========================================================================= */

export default function ConsultoriaPage(): ReactElement {
	// `spotsLeft` también se podría leer aquí si la página necesitara presentarlo
	// fuera del header (ej. un widget inline en F07). Por ahora el único consumer
	// es ConsultoriaHeader, que ya recibe el valor desde el layout.
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => setHasMounted(true), []);
	// Reservamos el hook para PR4/PR5 que probablemente consumirán client state.
	void hasMounted;

	return (
		<main id="main" className="flex-1">
			{/* F01 — Hero Splite (PR6, intacto) */}
			<HeroSplite />

			{/* F02 — El Espejo */}
			<Espejo />

			{/* F03 — Cómo trabajamos · OfferLadderV3 (PR4) */}
			<OfferLadderV3 />

			{/* F04 — El Diagnóstico (placeholder PR5) */}
			<SectionPlaceholder
				id="diagnostico"
				eyebrow="Lo que se lleva"
				title="«El Diagnóstico» no es un PDF. Es un activo."
				note="Tres entregables concretos: mapa de brechas, priorización por impacto y plan de acción con responsables. El detalle completo se publica en las próximas semanas."
				tone="alabaster"
				cta={{ label: "Agendar la reunión de introducción", href: "#cta" }}
			/>

			{/* F05 — Diferenciadores */}
			<Diferenciadores />

			{/* F06 — Para quién */}
			<ParaQuien />

			{/* F07 — CTA final */}
			<CTAFinal />

			{/* F08 — FAQ */}
			<FAQ />
		</main>
	);
}

/* -------------------------------------------------------------------------
 * SectionPlaceholder
 *
 * Render mínimo de F03 y F04 mientras PR4 y PR5 se construyen. Mantiene la
 * estructura editorial (eyebrow + título + nota mono) para que la página
 * lea como una secuencia coherente aunque dos secciones estén pendientes.
 * ------------------------------------------------------------------------- */

interface SectionPlaceholderCta {
	label: string;
	href: string;
}

interface SectionPlaceholderProps {
	id: string;
	eyebrow: string;
	title: string;
	note: string;
	tone: "onyx" | "alabaster";
	cta?: SectionPlaceholderCta;
}

function SectionPlaceholder({
	id,
	eyebrow,
	title,
	note,
	tone,
	cta,
}: SectionPlaceholderProps): ReactElement {
	const isDark = tone === "onyx";
	const bg = isDark ? "var(--color-onyx)" : "var(--color-alabaster)";
	const fg = isDark ? "var(--color-alabaster)" : "var(--color-onyx)";
	const muted = isDark ? "rgba(229,228,226,0.55)" : "var(--color-slate)";
	const accent = isDark ? "var(--color-gold)" : "var(--color-crimson)";

	return (
		<section
			id={id}
			aria-labelledby={`${id}-headline`}
			className="border-b border-[var(--color-divider)]"
			style={{ background: bg, color: fg }}
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="flex flex-col gap-8 max-w-3xl"
				>
					<motion.div
						variants={fadeUp}
						className="flex items-center gap-3 text-meta uppercase tracking-[0.22em]"
						style={{ color: muted }}
					>
						<span aria-hidden="true" style={{ color: accent }}>
							●
						</span>
						<span>{eyebrow}</span>
					</motion.div>
					<motion.h2
						id={`${id}-headline`}
						variants={fadeUp}
						className="text-headline [text-wrap:balance]"
						style={{ color: fg }}
					>
						{title}
					</motion.h2>
					<motion.p
						variants={fadeUp}
						className="text-mono text-[0.7rem] uppercase tracking-[0.18em]"
						style={{ color: muted }}
					>
						{note}
					</motion.p>
					{cta && (
						<motion.a
							variants={fadeUp}
							href={cta.href}
							className="self-start text-body font-medium underline underline-offset-4 decoration-[var(--color-crimson)] transition-opacity duration-200 hover:opacity-70"
							style={{ color: fg }}
						>
							{cta.label}
						</motion.a>
					)}
				</motion.div>
			</div>
		</section>
	);
}
