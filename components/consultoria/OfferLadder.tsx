"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionHeading } from "@/components/ui/SectionLabel";
import type { Step } from "@/lib/oferta";
import { STEPS } from "@/lib/oferta";

export function OfferLadder() {
	return (
		<section
			id="oferta"
			aria-labelledby="oferta-headline"
			className="border-b border-[var(--color-divider)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.05)}
					className="flex flex-col gap-12"
				>
					<motion.div variants={fadeUp} className="flex flex-col gap-4">
						<span className="text-meta text-[var(--color-fg-muted)]">Cómo trabajamos</span>
						<SectionHeading>
							<span id="oferta-headline">
								Tres pasos. Cada uno entrega valor antes de pedir el siguiente.
							</span>
						</SectionHeading>
					</motion.div>

					<motion.ol variants={stagger(0.08)} className="grid grid-cols-1 md:grid-cols-3 -mx-px">
						{STEPS.map((step, i) => (
							<StepCard key={step.name} step={step} index={i + 1} />
						))}
					</motion.ol>
				</motion.div>
			</div>
		</section>
	);
}

function StepCard({ step, index }: { step: Step; index: number }) {
	const stepNumber = String(index).padStart(2, "0");
	return (
		<motion.li
			variants={fadeUp}
			className="
				group relative flex flex-col gap-6
				border border-[var(--color-divider)] -ml-px -mt-px
				p-7 md:p-10 min-h-[320px]
				bg-[var(--color-bg)]
				transition-colors duration-500 ease-[var(--ease-brand)]
				hover:bg-[var(--color-bg-elevated)]
			"
		>
			{/* Top row: step index + headline price */}
			<div className="flex items-start justify-between">
				<span className="text-mono text-[0.75rem] text-[var(--color-fg-muted)]">
					{stepNumber} / 03
				</span>
				{step.price ? (
					<span className="text-mono text-[0.75rem] text-[var(--color-crimson)]">{step.price}</span>
				) : null}
			</div>

			{/* Name */}
			<h3 className="text-title text-[var(--color-fg)] [text-wrap:balance]">{step.name}</h3>

			{/* Single-detail steps (Reunión, Implementación) */}
			{step.detail ? (
				<p className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed">
					{step.detail}
				</p>
			) : null}

			{/* Two-option step (Consultoría) */}
			{step.options ? (
				<div className="flex flex-col gap-5">
					{step.options.map((option) => (
						<div key={option.label} className="flex flex-col gap-1">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-body font-semibold text-[var(--color-fg)]">
									{option.label}
								</span>
								<span className="text-body-lg font-semibold text-brand-gradient">
									{option.price}
								</span>
							</div>
							<p className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed">
								{option.detail}
							</p>
						</div>
					))}
				</div>
			) : null}

			{/* Note line — pinned to bottom */}
			{step.note ? (
				<div className="mt-auto flex items-start gap-3 pt-4">
					<span
						className="mt-2 block h-px w-6 shrink-0 bg-[var(--color-crimson)]"
						aria-hidden="true"
					/>
					<span className="text-meta text-[var(--color-fg-muted)] [text-wrap:pretty]">
						{step.note}
					</span>
				</div>
			) : null}
		</motion.li>
	);
}
