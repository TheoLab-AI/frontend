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
			{/* Preload del GLB del robot (5MB). El browser arranca la descarga
			    DESDE EL PRIMER INSTANTE en paralelo al HTML/JS. Cuando useGLTF
			    haga su fetch dentro del chunk dinamico R3F, el archivo ya esta
			    en el HTTP cache → cero espera. crossOrigin=anonymous es
			    obligatorio para que el preload sea reusado (sin esto el browser
			    descarga 2 veces: una por preload, otra por useGLTF). */}
			<link
				rel="preload"
				href="/models/robot-mixamo-v2.glb"
				as="fetch"
				type="model/gltf-binary"
				crossOrigin="anonymous"
			/>
			{children}
		</>
	);
}
