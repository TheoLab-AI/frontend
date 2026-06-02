"use client";

import { Award, type LucideIcon, Scale, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface Differentiator {
	index: string;
	title: string;
	summary: string;
	icon: LucideIcon;
}

const DIFFERENTIATORS: readonly Differentiator[] = [
	{
		index: "01",
		title: "Vertical legal",
		summary: "Hablamos el lenguaje del socio, no el del consultor de tecnología.",
		icon: Scale,
	},
	{
		index: "02",
		title: "Usted es dueño de lo suyo",
		summary: "Su entorno, sus datos y su Diagnóstico son suyos.",
		icon: ShieldCheck,
	},
	{
		index: "03",
		title: "ROI medido",
		summary: "Cifras reproducibles, no promesas de transformación.",
		icon: Award,
	},
] as const;

export function ValueProp() {
	return (
		<section id="valor" className="border-b border-[var(--color-divider)]">
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.06)}
					className="flex flex-col gap-12"
				>
					<motion.div variants={fadeUp}>
						<SectionLabel index="02" label="Qué hacemos" />
					</motion.div>

					<motion.div variants={stagger(0.08)} className="grid grid-cols-1 md:grid-cols-3 -mx-px">
						{DIFFERENTIATORS.map((item) => (
							<ValueCard key={item.index} item={item} />
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

function ValueCard({ item }: { item: Differentiator }) {
	const Icon = item.icon;
	return (
		<motion.article
			variants={fadeUp}
			className="
				group relative flex flex-col gap-6
				border border-[var(--color-divider)] -ml-px -mt-px
				p-7 md:p-10 min-h-[260px]
				bg-[var(--color-bg)]
				transition-colors duration-500 ease-[var(--ease-brand)]
				hover:bg-[var(--color-bg-elevated)]
			"
		>
			{/* Top row: index + icon */}
			<div className="flex items-start justify-between">
				<span className="text-mono text-[0.75rem] text-[var(--color-fg-muted)]">
					{item.index} / 03
				</span>
				<Icon
					className="h-5 w-5 text-[var(--color-fg-muted)] transition-colors duration-500 group-hover:text-[var(--color-crimson)]"
					aria-hidden="true"
				/>
			</div>

			{/* Title */}
			<h3 className="text-title text-[var(--color-fg)] [text-wrap:balance]">{item.title}</h3>

			{/* Summary */}
			<p className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed">
				{item.summary}
			</p>

			{/* Accent rule — pinned to bottom */}
			<div className="mt-auto flex items-center gap-3 pt-4">
				<span className="block h-px w-6 bg-[var(--color-crimson)]" aria-hidden="true" />
			</div>
		</motion.article>
	);
}
