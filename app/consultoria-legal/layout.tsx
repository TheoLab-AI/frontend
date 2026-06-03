import type { Metadata } from "next";
import { ConsultoriaFooter } from "@/components/consultoria/ConsultoriaFooter";
import { ConsultoriaHeader } from "@/components/consultoria/ConsultoriaHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { consultoriaServiceJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
	title: "Consultoría de IA para firmas legales",
	description:
		"Recupere entre 18 y 27 horas profesionales al mes, medidas. Consultoría de IA para firmas legales colombianas.",
	alternates: { canonical: "/consultoria-legal" },
};

// Cupos restantes de la edición fundadora. Hoy hardcodeado a 3 mientras no
// haya conteo real (Firestore/API); cuando exista, pasar a un Server
// Component que lo consulte o expose un context client-side.
const SPOTS_LEFT = 3;

export default function ConsultoriaLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<JsonLd id="ld-consultoria" data={consultoriaServiceJsonLd()} />
			<ConsultoriaHeader spotsLeft={SPOTS_LEFT} />
			{children}
			<ConsultoriaFooter />
		</>
	);
}
