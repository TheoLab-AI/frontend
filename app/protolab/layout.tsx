import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Protolab — Conversación con Teo",
	description:
		"Hable por voz con Teo, el asistente de TheoLab. Diagnóstico conversacional para firmas legales colombianas.",
	alternates: { canonical: "/protolab" },
	robots: { index: false, follow: false },
};

export default function ProtolabLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* Preconnect a la API de Gemini Live: adelanta el handshake TCP/TLS
			    para que cuando VoiceClient haga su primer fetch del token + WebSocket
			    la conexion ya este caliente. Reduce ~200-500ms en el primer turno. */}
			<link
				rel="preconnect"
				href="https://generativelanguage.googleapis.com"
				crossOrigin="anonymous"
			/>
			<link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
			{children}
		</>
	);
}
