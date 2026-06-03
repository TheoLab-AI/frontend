"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/Button";
import { Navbar, type NavbarItem } from "@/components/ui/Navbar";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand } from "@/lib/tokens";

/* =========================================================================
 * SiteHeader — Global compositor for the marketing surface.
 *
 * Mounts the editorial Navbar primitive (alabaster theme, light scheme)
 * with the standard home anchors + a link to /diagnostico.
 *
 * Guard: /diagnostico mounts its own <DiagnosticoHeader/> inline in its
 * page.tsx (different anchors + Status slot for CUPOS). To avoid double
 * headers stacking at z-40, this compositor returns null on that route.
 *
 * The guard is client-side (usePathname) — Layout injects this unconditionally
 * and the component itself decides whether to render.
 * ========================================================================= */

const items: readonly NavbarItem[] = [
	{ href: "#services", label: "Servicios" },
	{ href: "#evidence", label: "Evidencia" },
	{ href: "#philosophy", label: "Filosofía" },
	{ href: "/diagnostico", label: "Diagnóstico" },
];

// Only hash hrefs are observed by IntersectionObserver — route hrefs are skipped.
const anchors = items.filter((i) => i.href.startsWith("#")).map((i) => i.href);

const Brand = (): ReactElement => <Wordmark size="sm" />;

const CTA = (): ReactElement => (
	<Button size="sm" variant="solid" asChild>
		<a href={brand.github} target="_blank" rel="noopener noreferrer">
			GitHub
		</a>
	</Button>
);

export function SiteHeader(): ReactElement | null {
	const pathname = usePathname();

	// /diagnostico mounts its own header inline — bail out to avoid stacking.
	if (pathname?.startsWith("/diagnostico")) {
		return null;
	}

	return (
		<Navbar.Root theme="alabaster" anchors={anchors} ariaLabel="Principal">
			<Navbar.Brand>
				<Link href="/" aria-label="Inicio TheoLab" className="inline-flex items-center">
					<Brand />
				</Link>
			</Navbar.Brand>
			<Navbar.Items items={items} />
			<Navbar.CTA>
				<CTA />
			</Navbar.CTA>
			<Navbar.Mobile items={items} brand={<Brand />} cta={<CTA />} />
		</Navbar.Root>
	);
}
