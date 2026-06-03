"use client";

import { motion } from "motion/react";
import type { ReactElement } from "react";
import { OfferLadderV3 } from "@/components/consultoria/OfferLadderV3";
import { fadeUp, stagger } from "@/components/motion/variants";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Diferenciadores } from "@/components/sections/Diferenciadores";
import { Espejo } from "@/components/sections/Espejo";
import { FAQ } from "@/components/sections/FAQ";
// Hero R3F renderizado en SSR (HTML inicial con copy + poster → LCP rápido). El
// Canvas three.js vive dentro como dynamic ssr:false (HeroR3FScene), así que el
// hero ya no toca three durante la evaluación del módulo y es SSR-safe.
import { HeroR3F } from "@/components/sections/HeroR3F";
import { ParaQuien } from "@/components/sections/ParaQuien";

/* =========================================================================
 * /consultoria-legal — Landing de conversión legal-first
 *
 * Secuencia editorial: Hero · El Espejo · Cómo trabajamos (embudo) ·
 * El Diagnóstico · Diferenciadores · Para quién · CTA final · FAQ.
 *
 * ConsultoriaHeader y ConsultoriaFooter se montan en el layout
 * (app/consultoria-legal/layout.tsx) junto con el JSON-LD del Service.
 * ========================================================================= */

export default function ConsultoriaPage(): ReactElement {
	return (
		<main id="main" className="flex-1">
			{/* Hero R3F */}
			<HeroR3F />

			{/* El Espejo */}
			<Espejo />

			{/* Cómo trabajamos — embudo con split fundador/regular */}
			<OfferLadderV3 />

			{/* El Diagnóstico — el activo entregable del cliente */}
			<DiagnosticoSection
				id="diagnostico"
				eyebrow="Lo que se lleva"
				title="«El Diagnóstico» no es un PDF. Es un activo."
				note="Suyo desde el primer día. Con métricas que usted puede auditar."
				tone="alabaster"
			/>

			{/* Diferenciadores */}
			<Diferenciadores />

			{/* Para quién */}
			<ParaQuien />

			{/* CTA final */}
			<CTAFinal />

			{/* FAQ */}
			<FAQ />
		</main>
	);
}

/* -------------------------------------------------------------------------
 * DiagnosticoSection
 *
 * Sección editorial mínima (eyebrow + título + nota) que presenta «El
 * Diagnóstico» como el activo entregable del que el cliente es dueño. Mantiene
 * la cadencia visual del resto de la página; su narrativa extendida (recorrido
 * MAPEAR / PRIORIZAR / ENTREGAR) se construirá más adelante.
 * ------------------------------------------------------------------------- */

interface DiagnosticoSectionProps {
	id: string;
	eyebrow: string;
	title: string;
	note: string;
	tone: "onyx" | "alabaster";
}

function DiagnosticoSection({
	id,
	eyebrow,
	title,
	note,
	tone,
}: DiagnosticoSectionProps): ReactElement {
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
				</motion.div>
			</div>
		</section>
	);
}
