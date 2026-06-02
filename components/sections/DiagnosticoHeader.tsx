"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/Button";
import { Navbar, type NavbarItem } from "@/components/ui/Navbar";
import { Wordmark } from "@/components/ui/Wordmark";

/* =========================================================================
 * DiagnosticoHeader
 *
 * Specialized variant of the global Navbar for /diagnostico. Uses the same
 * composable primitive (Navbar.Root + Brand/Items/Status/CTA/Mobile) but
 * carries the page-specific Status slot — a live availability widget that
 * renders dynamic remaining slots ("CUPOS JUNIO {n}/10 DISPONIBLES").
 *
 * Mobile collapses the menu via Radix Dialog (handled by Navbar.Mobile);
 * the CUPOS widget is intentionally desktop-only (>= lg) to preserve hierarchy.
 * ========================================================================= */

interface DiagnosticoHeaderProps {
	spotsLeft: number;
}

const items: readonly NavbarItem[] = [
	{ href: "#proceso", label: "Metodología" },
	{ href: "#entregable", label: "El Entregable" },
	{ href: "#valores", label: "Garantías" },
	{ href: "#calificacion", label: "Test" },
	{ href: "#faq", label: "Preguntas" },
];

const anchors = items.map((i) => i.href);

const Brand = (): ReactElement => (
	<Link href="/" aria-label="Volver al inicio de TheoLab">
		<Wordmark size="sm" />
	</Link>
);

const CTA = (): ReactElement => (
	<Button size="sm" variant="accent" asChild>
		<Link href="#calificacion">Agendar Calificación</Link>
	</Button>
);

interface SpotsWidgetProps {
	spotsLeft: number;
}

const SpotsWidget = ({ spotsLeft }: SpotsWidgetProps): ReactElement => (
	<div
		className="hidden lg:flex items-center gap-2 border border-[var(--color-divider)] px-3 py-1"
		role="status"
		aria-live="polite"
		aria-label={`Cupos junio: ${spotsLeft} de 10 disponibles`}
	>
		<span aria-hidden="true" className="relative flex h-1.5 w-1.5">
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-crimson)] opacity-75" />
			<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-crimson)]" />
		</span>
		<span className="text-mono text-[0.65rem] text-[var(--color-fg-muted)]">
			CUPOS JUNIO {spotsLeft}/10 DISPONIBLES
		</span>
	</div>
);

export function DiagnosticoHeader({ spotsLeft }: DiagnosticoHeaderProps): ReactElement {
	return (
		<Navbar.Root theme="onyx" anchors={anchors} ariaLabel="Diagnóstico">
			<Navbar.Brand>
				<Brand />
			</Navbar.Brand>
			<Navbar.Items items={items} />
			<Navbar.Status>
				<SpotsWidget spotsLeft={spotsLeft} />
			</Navbar.Status>
			<Navbar.CTA>
				<CTA />
			</Navbar.CTA>
			<Navbar.Mobile items={items} brand={<Brand />} cta={<CTA />} />
		</Navbar.Root>
	);
}
