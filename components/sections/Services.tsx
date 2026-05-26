"use client";

import { Compass, Cpu, type LucideIcon, Scale, Workflow } from "lucide-react";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionLabel";

interface Service {
	index: string;
	title: string;
	summary: string;
	proof: string;
	icon: LucideIcon;
}

const SERVICES: readonly Service[] = [
	{
		index: "01",
		title: "Infraestructura IA",
		summary:
			"Diseño y operación de modelos, harnesses de evaluación y plataforma para inteligencia artificial.",
		proof: "Harness v0.1.0 en producción — TheoLab-AI/harness@5681603",
		icon: Cpu,
	},
	{
		index: "02",
		title: "Adopción IA empresarial",
		summary:
			"Identificación, incorporación y aprovechamiento medible de IA en organizaciones de cualquier vertical.",
		proof: "Powered by harness — playbook en construcción",
		icon: Compass,
	},
	{
		index: "03",
		title: "Automatización y agentes",
		summary:
			"Implementaciones a medida y agentes de inteligencia artificial para operaciones empresariales críticas.",
		proof: "Caso vivo · Asesora de Gases de Occidente",
		icon: Workflow,
	},
	{
		index: "04",
		title: "Tecnología jurídica",
		summary: "Desarrollo de tecnologías especializadas para el ámbito legal colombiano.",
		proof: "Vertical especializada · pipeline abierto",
		icon: Scale,
	},
] as const;

export function Services() {
	return (
		<section
			id="services"
			aria-labelledby="services-headline"
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
						<SectionLabel index="02" label="Servicios" />
						<SectionHeading>
							<span id="services-headline">
								Cuatro líneas de trabajo. Una misma exigencia: evidencia antes que promesa.
							</span>
						</SectionHeading>
					</motion.div>

					<motion.div variants={stagger(0.08)} className="grid grid-cols-1 md:grid-cols-2 -mx-px">
						{SERVICES.map((service) => (
							<ServiceCard key={service.index} service={service} />
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

function ServiceCard({ service }: { service: Service }) {
	const Icon = service.icon;
	return (
		<motion.article
			variants={fadeUp}
			className="
				group relative flex flex-col gap-6
				border border-[var(--color-divider)] -ml-px -mt-px
				p-7 md:p-10 min-h-[280px]
				bg-[var(--color-bg)]
				transition-colors duration-500 ease-[var(--ease-brand)]
				hover:bg-[var(--color-bg-elevated)]
			"
		>
			{/* Top row: index + icon */}
			<div className="flex items-start justify-between">
				<span className="text-mono text-[0.75rem] text-[var(--color-fg-muted)]">
					{service.index} / 04
				</span>
				<Icon
					className="h-5 w-5 text-[var(--color-fg-muted)] transition-colors duration-500 group-hover:text-[var(--color-crimson)]"
					aria-hidden="true"
				/>
			</div>

			{/* Title */}
			<h3 className="text-title text-[var(--color-fg)] [text-wrap:balance]">{service.title}</h3>

			{/* Summary */}
			<p className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed">
				{service.summary}
			</p>

			{/* Proof line — pinned to bottom */}
			<div className="mt-auto flex items-center gap-3 pt-4">
				<span className="block h-px w-6 bg-[var(--color-crimson)]" aria-hidden="true" />
				<span className="text-mono text-[0.7rem] text-[var(--color-fg-muted)]">
					{service.proof}
				</span>
			</div>
		</motion.article>
	);
}
