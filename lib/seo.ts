import { STEPS } from "@/lib/oferta";
import { brand } from "@/lib/tokens";

export function organizationJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: brand.name,
		alternateName: "TheoLab AI",
		url: `https://${brand.domain}`,
		logo: `https://${brand.domain}/brand/icon_theolab.png`,
		sameAs: [brand.github],
		description: brand.subtitle,
		areaServed: "CO",
		knowsLanguage: ["es", "en"],
	} as const;
}

export function servicesJsonLd() {
	const services = [
		{
			name: "Infraestructura IA",
			description: "Modelos, harnesses de evaluación y plataforma para inteligencia artificial.",
		},
		{
			name: "Adopción IA empresarial",
			description:
				"Identificación, incorporación y aprovechamiento medible de IA en organizaciones.",
		},
		{
			name: "Automatización y agentes",
			description:
				"Implementaciones a medida y agentes de inteligencia artificial para operaciones empresariales.",
		},
		{
			name: "Tecnología jurídica",
			description: "Desarrollo de tecnologías especializadas para el ámbito legal colombiano.",
		},
	];

	return services.map((s) => ({
		"@context": "https://schema.org",
		"@type": "Service",
		provider: { "@type": "Organization", name: brand.name },
		name: s.name,
		description: s.description,
		areaServed: { "@type": "Country", name: "Colombia" },
	}));
}

export function ofertaJsonLd() {
	const consultoria = STEPS.find((s) => s.name === "Consultoría");
	const options = consultoria?.options ?? [];
	// Emitimos ambos Offers (regular + fundador) cuando el tier fundador
	// está activo. Cuando la edición fundadora cierre (founderPrice ausente),
	// el JSON-LD volverá a emitir solo el precio regular sin tocar nada.
	const offers = options.flatMap((o) => {
		const base = {
			"@type": "Offer" as const,
			name: `Consultoría ${o.label.toLowerCase()}`,
			price: o.price.replace(/[^0-9]/g, ""),
			priceCurrency: "COP",
		};
		if (!o.founderPrice) return [base];
		return [
			base,
			{
				"@type": "Offer" as const,
				name: `Consultoría ${o.label.toLowerCase()} — Fundador`,
				price: o.founderPrice.replace(/[^0-9]/g, ""),
				priceCurrency: "COP",
			},
		];
	});
	return {
		"@context": "https://schema.org",
		"@type": "Service",
		serviceType: "Adopción de IA empresarial",
		provider: { "@type": "Organization", name: brand.name },
		areaServed: { "@type": "Country", name: "Colombia" },
		offers,
	};
}

export function consultoriaServiceJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "Service",
		serviceType: "Consultoría de adopción de IA para firmas legales",
		provider: { "@type": "Organization", name: brand.name },
		areaServed: { "@type": "Country", name: "Colombia" },
		offers: [
			{ "@type": "Offer", name: "Consultoría inicial", price: "500000", priceCurrency: "COP" },
			{ "@type": "Offer", name: "Consultoría completa", price: "1500000", priceCurrency: "COP" },
		],
	} as const;
}
