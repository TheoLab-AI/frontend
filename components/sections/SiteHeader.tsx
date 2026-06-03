"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/Button";
import { Navbar, type NavbarItem } from "@/components/ui/Navbar";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand } from "@/lib/tokens";

/* =========================================================================
 * SiteHeader — Compositor global de la superficie institucional.
 *
 * Monta la primitiva Navbar (tema alabaster) con las anclas del home + el
 * enlace a la landing legal `/consultoria-legal` (puerta de entrada activa
 * y estable para socios de firmas legales).
 *
 * `/consultoria-legal` vive fuera del route group (institucional) y monta su
 * propio <ConsultoriaHeader/>, así que no hay headers apilados: este
 * compositor solo se inyecta en el layout institucional.
 * ========================================================================= */

const items: readonly NavbarItem[] = [
	{ href: "#services", label: "Servicios" },
	{ href: "#evidence", label: "Evidencia" },
	{ href: "#philosophy", label: "Filosofía" },
	{ href: "/consultoria-legal", label: "Consultoría legal" },
];

// Solo las anclas hash las observa el IntersectionObserver — las rutas se omiten.
const anchors = items.filter((i) => i.href.startsWith("#")).map((i) => i.href);

const Brand = (): ReactElement => <Wordmark size="sm" />;

const CTA = (): ReactElement => (
	<Button size="sm" variant="solid" asChild>
		<a href={brand.github} target="_blank" rel="noopener noreferrer">
			GitHub
		</a>
	</Button>
);

export function SiteHeader(): ReactElement {
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
