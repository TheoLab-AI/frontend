"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { fadeUp, stagger } from "@/components/motion/variants";
import { ContactCTA } from "@/components/ui/ContactCTA";

export function HomeCTA() {
	return (
		<section
			id="home-cta"
			aria-labelledby="home-cta-headline"
			className="border-b border-[var(--color-divider)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="flex max-w-2xl flex-col gap-8"
				>
					<motion.div variants={fadeUp} className="flex flex-col gap-4">
						<h2
							id="home-cta-headline"
							className="text-headline text-[var(--color-fg)] [text-wrap:balance]"
						>
							Demos el primer paso.
						</h2>
						<p className="text-body-lg text-[var(--color-fg-muted)] [text-wrap:pretty]">
							La reunión de introducción es gratuita y sin compromiso.
						</p>
					</motion.div>

					<motion.div variants={fadeUp}>
						<ContactCTA
							whatsappText="Hola, quiero agendar una reunión de introducción con TheoLab."
							emailSubject="Reunión de introducción — TheoLab"
						/>
					</motion.div>

					<motion.div variants={fadeUp}>
						<Link
							href="/consultoria"
							className="
								group inline-flex items-center gap-2
								text-meta text-[var(--color-fg-muted)]
								transition-colors duration-300 ease-[var(--ease-brand)]
								hover:text-[var(--color-crimson)]
							"
						>
							¿Dirige una firma legal? Vea la propuesta para su firma{" "}
							<span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
								→
							</span>
						</Link>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
