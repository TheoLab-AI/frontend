"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

/* =========================================================================
 * /diagnostico/r3f-poc — Proof of concept aislado para evaluar React Three
 * Fiber como alternativa a Spline. NO afecta /diagnostico ni / .
 *
 * Carga HeroR3FPoc dinamicamente con ssr:false porque three.js toca window
 * en import-time y rompe SSR en App Router.
 * ========================================================================= */

const HeroR3FPoc = dynamic(
	() => import("@/components/sections/HeroR3FPoc").then((m) => m.HeroR3FPoc),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
				<p className="font-mono text-xs uppercase tracking-[0.18em] text-white/55">
					Cargando experiencia 3D…
				</p>
			</div>
		),
	},
);

export default function R3FPocPage(): ReactElement {
	return <HeroR3FPoc />;
}
