import type { Metadata } from "next";
import { InstitutionalNav } from "@/components/institucional/InstitutionalNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, servicesJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

export default function InstitucionalLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<JsonLd id="ld-organization" data={organizationJsonLd()} />
			<JsonLd id="ld-services" data={servicesJsonLd()} />
			<InstitutionalNav />
			{children}
		</>
	);
}
