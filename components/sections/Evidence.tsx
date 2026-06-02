"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { TextShimmer } from "@/components/ui/TextShimmer";

interface Metric {
	label: string;
	value: string;
	hint: string;
	/** Optional accent — render label via TextShimmer to draw the eye once per viewport. */
	accent?: boolean;
}

const METRICS: readonly Metric[] = [
	{
		label: "Coverage",
		value: "0.975",
		hint: "% generación válida",
		accent: true,
	},
	{
		label: "Strict pass",
		value: "0.675",
		hint: "criterios completos cumplidos",
	},
	{
		label: "False positive",
		value: "0.091",
		hint: "tasa controlada bajo 0.1",
	},
] as const;

export function Evidence() {
	return (
		<section
			id="evidence"
			aria-labelledby="evidence-headline"
			className="border-b border-[var(--color-divider)] bg-[var(--color-onyx)] text-[var(--color-alabaster)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.06)}
					className="flex flex-col gap-14"
				>
					{/* Header */}
					<motion.div variants={fadeUp} className="flex flex-col gap-4">
						<div className="flex items-center gap-3 text-meta text-[var(--color-alabaster)]/60">
							<span className="text-mono text-[0.7rem]">03</span>
							<span aria-hidden="true">·</span>
							<span>Evidencia</span>
						</div>
						<h2
							id="evidence-headline"
							className="text-headline max-w-3xl text-[var(--color-alabaster)] [text-wrap:balance]"
						>
							Construimos con métricas a la vista — no con promesas.
						</h2>
					</motion.div>

					{/* Metric grid */}
					<motion.div
						variants={stagger(0.1)}
						className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-alabaster)]/10"
					>
						{METRICS.map((m) => (
							<MetricCard key={m.label} metric={m} />
						))}
					</motion.div>

					{/* Citation row */}
					<motion.div
						variants={fadeUp}
						className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
					>
						<div className="flex flex-col gap-3">
							<span className="text-meta text-[var(--color-alabaster)]/60">Repositorio fuente</span>
							<a
								href="https://github.com/TheoLab-AI/harness"
								target="_blank"
								rel="noreferrer noopener"
								className="
									inline-flex items-center gap-2 text-body-lg
									underline decoration-[var(--color-crimson)] decoration-2
									underline-offset-4 transition-colors
									hover:text-[var(--color-gold)]
								"
							>
								TheoLab-AI/harness
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</a>
							<span className="text-mono text-[0.75rem] text-[var(--color-alabaster)]/50">
								tag v0.1.0 · sha 7044c4f
							</span>
						</div>
						<p className="max-w-md text-body text-[var(--color-alabaster)]/70">
							Métricas tomadas del run de validación oficial. Reproducibles desde el repositorio
							público con el tag indicado.
						</p>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

function MetricCard({ metric }: { metric: Metric }) {
	return (
		<motion.div
			variants={fadeUp}
			className="
				bg-[var(--color-onyx)] p-8 md:p-10
				flex flex-col gap-5
				min-h-[180px]
			"
		>
			<span className="text-meta text-[var(--color-alabaster)]/60">
				{metric.accent ? (
					<TextShimmer variant="brand" asChild>
						<span>{metric.label}</span>
					</TextShimmer>
				) : (
					metric.label
				)}
			</span>
			<span className="text-display [font-family:var(--font-display)] font-bold text-brand-gradient leading-none">
				{metric.value}
			</span>
			<span className="text-body text-[var(--color-alabaster)]/70">{metric.hint}</span>
		</motion.div>
	);
}
