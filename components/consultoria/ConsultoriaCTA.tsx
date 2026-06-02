"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { ContactCTA } from "@/components/ui/ContactCTA";

export function ConsultoriaCTA() {
	return (
		<section id="cta-final" className="border-b border-[var(--color-divider)]">
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={stagger(0.08)}
					className="flex flex-col items-start gap-8"
				>
					<motion.p
						variants={fadeUp}
						className="text-headline text-[var(--color-fg)] max-w-3xl [text-wrap:balance]"
					>
						Conversemos. La reunión de introducción es gratuita y sin compromiso.
					</motion.p>

					<motion.div variants={fadeUp}>
						<ContactCTA whatsappText="Hola, quiero agendar la reunión de introducción para mi firma." />
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
