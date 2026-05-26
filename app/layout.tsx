import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, servicesJsonLd } from "@/lib/seo";
import { brand } from "@/lib/tokens";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
	axes: ["opsz"],
});

const interTight = Inter_Tight({
	variable: "--font-inter-tight",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(`https://${brand.domain}`),
	title: {
		default: `${brand.name} — ${brand.tagline}`,
		template: `%s · ${brand.name}`,
	},
	description: brand.subtitle,
	applicationName: brand.name,
	authors: [{ name: brand.name, url: brand.github }],
	keywords: [
		"inteligencia artificial",
		"IA aplicada",
		"infraestructura IA",
		"agentes IA",
		"automatización empresarial",
		"tecnología jurídica",
		"Colombia",
		"TheoLab",
	],
	openGraph: {
		type: "website",
		locale: "es_CO",
		url: `https://${brand.domain}`,
		siteName: brand.name,
		title: `${brand.name} — ${brand.tagline}`,
		description: brand.subtitle,
	},
	twitter: {
		card: "summary_large_image",
		title: `${brand.name} — ${brand.tagline}`,
		description: brand.subtitle,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/brand/TL_icon_short.png",
	},
	alternates: {
		canonical: `https://${brand.domain}`,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#E5E4E2" },
		{ media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
	],
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es-CO" className={`${inter.variable} ${interTight.variable}`}>
			<body className="flex min-h-dvh flex-col font-sans antialiased">
				<JsonLd id="ld-organization" data={organizationJsonLd()} />
				<JsonLd id="ld-services" data={servicesJsonLd()} />
				{children}
			</body>
		</html>
	);
}
