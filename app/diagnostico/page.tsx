"use client";

import { motion } from "motion/react";
import { type ReactElement, useEffect, useState } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { DiagnosticoFooter } from "@/components/sections/DiagnosticoFooter";
import { DiagnosticoHeader } from "@/components/sections/DiagnosticoHeader";
import { Diferenciadores } from "@/components/sections/Diferenciadores";
import { Espejo } from "@/components/sections/Espejo";
import { FAQ } from "@/components/sections/FAQ";
import { HeroSplite } from "@/components/sections/HeroSplite";
import { ParaQuien } from "@/components/sections/ParaQuien";

/* =========================================================================
 * /diagnostico — Rediseño v3
 *
 * Estructura de 9 secciones (orden HTML v3):
 *   F01 Hero Splite          (componente HeroSplite — PR6)
 *   F02 El Espejo            (componente Espejo — PR3)
 *   F03 Cómo trabajamos      (placeholder hasta PR4: embudo + pricing)
 *   F04 El Diagnóstico       (placeholder hasta PR5: sticky scroll narrativo)
 *   F05 Diferenciadores      (componente Diferenciadores — PR3)
 *   F06 Para quién           (componente ParaQuien — PR3)
 *   F07 CTA final            (componente CTAFinal — PR3)
 *   F08 FAQ                  (componente FAQ — PR3)
 *   F09 Footer               (componente DiagnosticoFooter — PR3)
 *
 * Toda la copy es literal del prototipo HTML v3:
 *   C:/Users/juanj/Downloads/TheoLab Design System (1)/
 *     design_handoff_consultoria_hero_3d/reference-prototype/
 *     TheoLab - Consultoría v3.html
 * ========================================================================= */

export default function DiagnosticoPage(): ReactElement {
	// Cupos restantes para la edición fundadora — el header muestra el widget
	// "CUPOS X/10 DISPONIBLES" cuando spotsLeft > 0. Hoy hardcodeado a 3.
	const [spotsLeft, setSpotsLeft] = useState<number>(3);
	useEffect(() => {
		// Hook reservado para conectar conteo real (Firestore / API) cuando exista.
		const timer = setTimeout(() => setSpotsLeft(3), 1000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="bg-[var(--color-onyx)] text-[var(--color-alabaster)] min-h-screen selection:bg-[var(--color-burgundy)] selection:text-[var(--color-alabaster)]">
			<DiagnosticoHeader spotsLeft={spotsLeft} />

			{/* F01 — Hero Splite (PR6, intacto) */}
			<HeroSplite />

			{/* F02 — El Espejo */}
			<Espejo />

			{/* F03 — Cómo trabajamos (placeholder PR4) */}
			<SectionPlaceholder
				id="como"
				eyebrow="Cómo trabajamos"
				title="Tres peldaños. Cada uno responde una pregunta distinta."
				note="Próximamente — embudo con pricing inline (PR4)."
				tone="onyx"
			/>

			{/* F04 — El Diagnóstico (placeholder PR5) */}
			<SectionPlaceholder
				id="diagnostico"
				eyebrow="Lo que se lleva"
				title="«El Diagnóstico» no es un PDF. Es un activo."
				note="Próximamente — sticky scroll MAPEAR / PRIORIZAR / ENTREGAR (PR5)."
				tone="alabaster"
			/>

			{/* F05 — Diferenciadores */}
			<Diferenciadores />

			{/* F06 — Para quién */}
			<ParaQuien />

			{/* F07 — CTA final */}
			<CTAFinal />

			{/* F08 — FAQ */}
			<FAQ />

			{/* F09 — Footer */}
			<DiagnosticoFooter />
		</div>
	);
}

/* -------------------------------------------------------------------------
 * SectionPlaceholder
 *
 * Render mínimo de F03 y F04 mientras PR4 y PR5 se construyen. Mantiene la
 * estructura editorial (eyebrow + título + nota mono) para que la página
 * lea como una secuencia coherente aunque dos secciones estén pendientes.
 * ------------------------------------------------------------------------- */

interface SectionPlaceholderProps {
	id: string;
	eyebrow: string;
	title: string;
	note: string;
	tone: "onyx" | "alabaster";
}

function SectionPlaceholder({
	id,
	eyebrow,
	title,
	note,
	tone,
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
				</motion.div>
			</div>
		</section>
	);
}
