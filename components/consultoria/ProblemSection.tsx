"use client";

import { Clock, FileWarning, type LucideIcon, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionLabel";

interface Pain {
	idx: string;
	body: string;
	icon: LucideIcon;
}

const PAINS: readonly Pain[] = [
	{
		idx: "01",
		body: "Una propuesta perdida porque el competidor respondió primero.",
		icon: Clock,
	},
	{
		idx: "02",
		body: "Un junior usando ChatGPT con información confidencial de sus clientes, sin control.",
		icon: ShieldAlert,
	},
	{
		idx: "03",
		body: "El equipo desbordado en tareas que no facturan.",
		icon: FileWarning,
	},
] as const;

export function ProblemSection() {
	return (
		<section
			id="problema"
			aria-labelledby="problema-headline"
			className="border-b border-[var(--color-divider)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="flex flex-col gap-12"
				>
					<motion.div variants={fadeUp} className="flex flex-col gap-4">
						<SectionLabel index="01" label="El problema" />
						<SectionHeading>
							<span id="problema-headline">
								Lo que ya está pasando en su firma, lo nombre o no.
							</span>
						</SectionHeading>
					</motion.div>

					<motion.div variants={stagger(0.08)} className="grid grid-cols-1 md:grid-cols-3 -mx-px">
						{PAINS.map((pain) => (
							<PainCard key={pain.idx} pain={pain} />
						))}
					</motion.div>

					<motion.p
						variants={fadeUp}
						className="text-body-lg max-w-2xl text-[var(--color-fg)] [text-wrap:pretty]"
					>
						La IA mal adoptada es riesgo.{" "}
						<span className="text-brand-gradient font-semibold">
							Bien adoptada, son horas recuperadas.
						</span>
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
}

function PainCard({ pain }: { pain: Pain }) {
	const Icon = pain.icon;
	return (
		<motion.article
			variants={fadeUp}
			className="
				group relative flex flex-col gap-6
				border border-[var(--color-divider)] -ml-px -mt-px
				p-7 md:p-10 min-h-[220px]
				bg-[var(--color-bg)]
				transition-colors duration-500 ease-[var(--ease-brand)]
				hover:bg-[var(--color-bg-elevated)]
			"
		>
			<div className="flex items-start justify-between">
				<span className="text-mono text-[0.75rem] text-[var(--color-fg-muted)]">
					{pain.idx} / 03
				</span>
				<Icon
					className="h-5 w-5 text-[var(--color-fg-muted)] transition-colors duration-500 group-hover:text-[var(--color-crimson)]"
					aria-hidden="true"
				/>
			</div>

			<p className="text-title text-[var(--color-fg)] [text-wrap:balance] leading-snug">
				{pain.body}
			</p>

			<span className="mt-auto block h-px w-6 bg-[var(--color-crimson)]" aria-hidden="true" />
		</motion.article>
	);
}
