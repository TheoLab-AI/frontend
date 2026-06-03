"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactElement, useState } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";

/* =========================================================================
 * F08 · FAQ
 *
 * 5 Q&A en acordeón. Copy literal del prototipo HTML v3. Incluye la
 * pregunta "¿Por qué precio fundador?" como ancla narrativa para PR4.
 * Tema alabaster con dividers editoriales.
 * ========================================================================= */

interface FaqItem {
	num: string;
	question: string;
	answer: string;
}

const FAQS: readonly FaqItem[] = [
	{
		num: "Q1",
		question: "¿Cuánto tarda ver resultados?",
		answer:
			"El Diagnóstico se entrega en una a tres semanas, según el plan. Ahí ya tiene criterio y cifras. Las horas recuperadas llegan en la Implementación, cuando los agentes corren en producción — medidas contra la línea base, no estimadas.",
	},
	{
		num: "Q2",
		question: "¿Mis datos quedan en infraestructura de TheoLab?",
		answer:
			"Su entorno y sus datos son suyos. Trabajamos sobre su infraestructura o sobre un entorno dedicado bajo su control, respetando el secreto profesional y la Ley 1581 de habeas data. El motor que opera los agentes es licencia nuestra; sus datos, no.",
	},
	{
		num: "Q3",
		question: "¿Qué pasa si quiero salir del contrato?",
		answer:
			"El Diagnóstico es suyo desde el día uno y se queda con usted. La Implementación opera por plan de 6 o 12 meses; si decide no continuar, conserva todo lo documentado y la firma no queda atada a una caja negra.",
	},
	{
		num: "Q4",
		question: "¿Por qué precio fundador?",
		answer:
			"Los primeros diez clientes nos ayudan a calibrar el método sobre casos reales. A cambio acceden a precio fundador. No es un descuento de marketing — es el precio de ser primeros, y se cierra cuando se llenen los cupos.",
	},
	{
		num: "Q5",
		question: "¿Trabajan en español?",
		answer:
			"Sí. Toda la consultoría, el Diagnóstico y la operación son en español, sobre derecho y práctica colombianos. El inglés lo reservamos para los frameworks técnicos establecidos, no para hablar con su firma.",
	},
] as const;

export function FAQ(): ReactElement {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section
			id="faq"
			aria-labelledby="faq-headline"
			className="border-b border-[var(--color-divider)] bg-[var(--color-alabaster)] text-[var(--color-onyx)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="flex flex-col gap-12 md:gap-14"
				>
					{/* Heading visible — el acordeón necesita un ancla escaneable
					   sin recurrir al eyebrow tracked (banido por Eyebrow Discipline
					   Rule en secciones que no abren bloque temático nuevo). */}
					<motion.h2
						id="faq-headline"
						variants={fadeUp}
						className="text-headline [text-wrap:balance]"
					>
						Preguntas frecuentes
					</motion.h2>

					{/* Accordion */}
					<motion.div
						variants={stagger(0.06)}
						className="flex flex-col divide-y divide-[var(--color-divider)] border-t border-[var(--color-divider)]"
					>
						{FAQS.map((f, idx) => {
							const open = openIndex === idx;
							return (
								<motion.div key={f.num} variants={fadeUp} className="py-1">
									<button
										type="button"
										aria-expanded={open}
										aria-controls={`faq-panel-${f.num}`}
										onClick={() => setOpenIndex(open ? null : idx)}
										className="w-full flex items-baseline gap-4 md:gap-6 py-6 md:py-7 text-left transition-colors hover:text-[var(--color-crimson)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-crimson)]/40"
									>
										<span className="text-mono text-[0.85rem] tracking-[0.12em] text-[var(--color-crimson)] shrink-0">
											{f.num}
										</span>
										<span
											aria-hidden="true"
											className="hidden md:inline text-mono text-[0.65rem] tracking-[0.4em] text-[var(--color-slate)]/40 shrink-0"
										>
											————
										</span>
										<span className="flex-1 text-title text-[var(--color-onyx)]">{f.question}</span>
										<motion.span
											aria-hidden="true"
											animate={{ rotate: open ? 45 : 0 }}
											transition={{
												duration: 0.32,
												ease: [0.16, 1, 0.3, 1],
											}}
											className="shrink-0 text-[var(--color-slate)]"
										>
											<Plus className="h-5 w-5" strokeWidth={1.8} />
										</motion.span>
									</button>
									<AnimatePresence initial={false}>
										{open && (
											<motion.div
												id={`faq-panel-${f.num}`}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{
													duration: 0.32,
													ease: [0.16, 1, 0.3, 1],
												}}
												className="overflow-hidden"
											>
												<p
													className="text-body-lg text-[var(--color-slate)] [text-wrap:pretty] max-w-3xl pb-6 md:pb-8 pl-0 md:pl-[6.5rem]"
													style={{ lineHeight: 1.65 }}
												>
													{f.answer}
												</p>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							);
						})}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
