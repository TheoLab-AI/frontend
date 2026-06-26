import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Protolab — Conversación con Teo",
	description:
		"Hable por voz con Teo, el asistente de TheoLab. Diagnóstico conversacional para firmas legales colombianas.",
	alternates: { canonical: "/protolab" },
	robots: { index: false, follow: false },
};

export default function ProtolabLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
