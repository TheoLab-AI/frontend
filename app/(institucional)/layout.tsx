import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { ofertaJsonLd, organizationJsonLd, servicesJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

export default function InstitucionalLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<JsonLd id="ld-organization" data={organizationJsonLd()} />
			<JsonLd id="ld-services" data={servicesJsonLd()} />
			<JsonLd id="ld-oferta" data={ofertaJsonLd()} />
			<SiteHeader />
			{children}
		</>
	);
}
