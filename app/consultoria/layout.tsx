import type { Metadata } from "next";
import { ConsultoriaFooter } from "@/components/consultoria/ConsultoriaFooter";
import { ConsultoriaHeader } from "@/components/consultoria/ConsultoriaHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { consultoriaServiceJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
	title: "Consultoría de IA para firmas legales",
	description:
		"Recupere entre 18 y 27 horas profesionales al mes, medidas. Consultoría de IA para firmas legales colombianas.",
	alternates: { canonical: "/consultoria" },
};

export default function ConsultoriaLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<JsonLd id="ld-consultoria" data={consultoriaServiceJsonLd()} />
			<ConsultoriaHeader />
			{children}
			<ConsultoriaFooter />
		</>
	);
}
