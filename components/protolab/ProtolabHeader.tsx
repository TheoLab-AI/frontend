import type { ReactElement } from "react";
import { Wordmark } from "@/components/ui/Wordmark";

/* =========================================================================
 * ProtolabHeader — header minimo de /protolab
 *
 * Wordmark de TheoLab arriba a la izquierda con link externo a theolab.tech.
 * Discreto, sin nav, sin CTAs — el foco de la pagina es la conversacion.
 *
 * z-30 para vivir encima del Canvas R3F, BackgroundAura y BeamsBackground.
 * ========================================================================= */

export function ProtolabHeader(): ReactElement {
	return (
		<header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
			<a
				href="https://theolab.tech"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Abrir theolab.tech en una pestaña nueva"
				className="pointer-events-auto inline-flex items-center text-[var(--color-alabaster)] opacity-85 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-onyx)]"
			>
				<Wordmark size="sm" />
			</a>

			<span className="text-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-alabaster)]/55">
				Protolab
			</span>
		</header>
	);
}
